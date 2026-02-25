import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { AiRouter } from './ai-router';
import { CostManager } from './cost-manager';
import { PromptRegistry } from './prompt-registry';
import { SafetyLayer } from './safety-layer';
import { StreamingMux, type SseEvent } from './streaming-mux';

const CreateSessionSchema = z.object({
  mode: z.enum(['scenario', 'free']).default('scenario'),
  scenarioId: z.string().max(120).optional(),
});

const SendMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  scenarioKey: z.string().max(120).optional(),
  clientContext: z
    .object({
      industry: z.string().max(120).optional(),
      companySize: z.string().max(120).optional(),
      role: z.string().max(120).optional(),
    })
    .optional(),
});

type SendMessagePayload = z.infer<typeof SendMessageSchema>;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

@Injectable()
export class AiService {
  private readonly clientSessionMap = new Map<string, string>();
  private openai: OpenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly costManager: CostManager,
    private readonly safety: SafetyLayer,
    private readonly promptRegistry: PromptRegistry,
    private readonly router: AiRouter,
    private readonly mux: StreamingMux,
  ) {}

  private getOpenAiClient(): OpenAI {
    if (!this.openai) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.openai;
  }

  async createSession(userId: string, input: unknown) {
    const payload = CreateSessionSchema.parse(input);
    const session = await this.prisma.aiSession.create({
      data: {
        userId,
        mode: payload.mode,
        scenarioId: payload.scenarioId ?? null,
      },
    });
    this.clientSessionMap.set(`${userId}:${session.id}`, session.id);
    return session;
  }

  async listSessions(userId: string) {
    return this.prisma.aiSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }

  private async resolveSessionId(userId: string, clientSessionId: string, scenarioId?: string): Promise<string> {
    if (isUuid(clientSessionId)) {
      const existing = await this.prisma.aiSession.findFirst({
        where: { id: clientSessionId, userId },
      });
      if (existing) return existing.id;
    }

    const key = `${userId}:${clientSessionId}`;
    const mapped = this.clientSessionMap.get(key);
    if (mapped) {
      const existing = await this.prisma.aiSession.findFirst({
        where: { id: mapped, userId },
      });
      if (existing) return existing.id;
    }

    const created = await this.prisma.aiSession.create({
      data: {
        userId,
        mode: 'scenario',
        scenarioId: scenarioId ?? 'ai.scenario.faq',
      },
    });
    this.clientSessionMap.set(key, created.id);
    return created.id;
  }

  async getSession(userId: string, clientSessionId: string) {
    const sessionId = await this.resolveSessionId(userId, clientSessionId);
    return this.prisma.aiSession.findFirst({
      where: { id: sessionId, userId },
    });
  }

  async getMessages(userId: string, clientSessionId: string) {
    const sessionId = await this.resolveSessionId(userId, clientSessionId);
    return this.prisma.aiMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listScenarios() {
    const defaults: Record<
      string,
      { displayName: string; displayDescription: string; outputFormat: 'json' | 'text'; maxTurns: number }
    > = {
      'ai.scenario.audit': {
        displayName: 'Аудит процесса',
        displayDescription: 'Рекомендации, риски и план действий',
        outputFormat: 'json',
        maxTurns: 7,
      },
      'ai.scenario.usecase_finder': {
        displayName: 'Поиск AI-кейсов',
        displayDescription: '3-6 сценариев внедрения AI',
        outputFormat: 'json',
        maxTurns: 7,
      },
      'ai.scenario.roi': {
        displayName: 'Расчёт ROI',
        displayDescription: 'Оценка экономии и окупаемости',
        outputFormat: 'text',
        maxTurns: 9,
      },
      'ai.scenario.faq': {
        displayName: 'Вопросы по услугам',
        displayDescription: 'Цены, сроки и формат работы',
        outputFormat: 'text',
        maxTurns: 10,
      },
    };

    const templates = await this.prisma.promptTemplate.findMany({
      where: { key: { startsWith: 'ai.scenario.' } },
      include: {
        versions: {
          where: { isActive: true },
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
      orderBy: { key: 'asc' },
    });

    if (templates.length === 0) {
      return Object.entries(defaults).map(([key, meta]) => ({
        key,
        version: 1,
        ...meta,
      }));
    }

    return templates.map((template) => {
      const fallback = defaults[template.key] ?? {
        displayName: template.key.replace('ai.scenario.', ''),
        displayDescription: 'AI сценарий AXENTRAIT',
        outputFormat: 'text' as const,
        maxTurns: 8,
      };

      return {
        key: template.key,
        version: template.versions[0]?.version ?? 1,
        ...fallback,
      };
    });
  }

  private buildAnswer(input: {
    scenarioKey: string;
    userMessage: string;
    basePrompt: string;
    scenarioPrompt: string;
    warnings: string[];
    context?: Record<string, string | undefined>;
  }): string {
    const contextLine = input.context
      ? `Контекст: role=${input.context.role ?? 'n/a'}, industry=${input.context.industry ?? 'n/a'}, companySize=${input.context.companySize ?? 'n/a'}`
      : '';
    const warningLine = input.warnings.length ? `Safety: ${input.warnings.join(', ')}` : '';

    if (input.scenarioKey === 'ai.scenario.audit') {
      return JSON.stringify(
        {
          context: contextLine || 'Контекст не передан',
          assumptions: ['Оценка выполнена на основе пользовательского сообщения'],
          recommendations: [
            'Зафиксировать текущий процесс в BPMN и измерить baseline метрики.',
            'Выделить 1 пилотный процесс с наибольшим влиянием на SLA.',
            'Согласовать интеграционный контур и требования ИБ до пилота.',
          ],
          risks_and_mitigations: [
            'Неполные исходные данные -> ввести обязательные поля ввода.',
            'Сопротивление изменениям -> назначить process owner и cadence ревью.',
          ],
          next_step: 'Оставьте заявку, и команда AXENTRAIT подготовит дорожную карту внедрения.',
          user_message: input.userMessage,
          safety: warningLine || undefined,
        },
        null,
        2,
      );
    }

    if (input.scenarioKey === 'ai.scenario.usecase_finder') {
      return JSON.stringify(
        {
          use_cases: [
            { title: 'Автоклассификация заявок', impact: 'high', complexity: 'medium', priority: 1 },
            { title: 'Предиктивный контроль SLA', impact: 'medium', complexity: 'medium', priority: 2 },
            { title: 'Ассистент для оператора', impact: 'high', complexity: 'low', priority: 3 },
          ],
          next_step: 'Выберите один сценарий и подготовьте пилот на 6-8 недель.',
          context: contextLine,
        },
        null,
        2,
      );
    }

    if (input.scenarioKey === 'ai.scenario.roi') {
      return [
        '### Предварительный расчёт ROI',
        '',
        `Вход: ${input.userMessage}`,
        contextLine ? `- ${contextLine}` : '',
        '- monthly_savings = employees_count × hours_wasted_per_week × 4.33 × avg_hourly_cost × automation_percent',
        '- payback_months = implementation_cost / monthly_savings',
        '',
        'Следующий шаг: оставьте заявку, чтобы получить расчёт с вашими фактическими цифрами.',
      ]
        .filter(Boolean)
        .join('\n');
    }

    return [
      'Краткий ответ по услугам AXENTRAIT:',
      `- Ваш запрос: ${input.userMessage}`,
      contextLine ? `- ${contextLine}` : '',
      warningLine ? `- ${warningLine}` : '',
      '- Дальше: можем предложить формат аудит / пилот / подписка.',
      '- Оставьте заявку в Mini App, и мы подготовим план внедрения с оценкой сроков.',
      '',
      `System prompt: ${input.basePrompt.slice(0, 140)}`,
      `Scenario prompt: ${input.scenarioPrompt.slice(0, 140)}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  async *streamChat(
    userId: string,
    clientSessionId: string,
    input: unknown,
  ): AsyncGenerator<SseEvent> {
    const payload = SendMessageSchema.parse(input);
    const scenarioKey = payload.scenarioKey ?? 'ai.scenario.faq';
    const sessionId = await this.resolveSessionId(userId, clientSessionId, scenarioKey);

    const limit = await this.costManager.checkLimit(userId);
    if (!limit.allowed) {
      yield {
        event: 'error',
        data: {
          code: 'RATE_LIMITED',
          message: 'Лимит исчерпан, попробуйте позже',
          scope: limit.reason,
        },
      };
      return;
    }

    const sanitizedInput = this.safety.sanitizeInput(payload.message);
    if (sanitizedInput.rejected) {
      yield {
        event: 'error',
        data: {
          code: sanitizedInput.rejectCode ?? 'INPUT_REJECTED',
          message: 'Сообщение отклонено safety layer',
        },
      };
      return;
    }

    const userMessage = await this.prisma.aiMessage.create({
      data: {
        sessionId,
        role: 'user',
        content: sanitizedInput.clean,
        tokensIn: estimateTokens(sanitizedInput.clean),
      },
    });

    const [basePrompt, scenarioPrompt, provider] = await Promise.all([
      this.promptRegistry.getPrompt('ai.base.system', userId),
      this.promptRegistry.getPrompt(scenarioKey, userId),
      this.router.route(),
    ]);

    let generated: string;

    if (provider.provider === 'openai') {
      try {
        const history = await this.prisma.aiMessage.findMany({
          where: { sessionId },
          orderBy: { createdAt: 'asc' },
          select: { role: true, content: true },
        });

        const systemContent = [basePrompt.content, scenarioPrompt.content]
          .filter(Boolean)
          .join('\n\n');

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          ...(systemContent ? [{ role: 'system' as const, content: systemContent }] : []),
          ...history.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user' as const, content: sanitizedInput.clean },
        ];

        const openai = this.getOpenAiClient();
        const completion = await openai.chat.completions.create({
          model: provider.model || 'gpt-4o-mini',
          messages,
          max_tokens: 1500,
          temperature: 0.7,
        });

        generated =
          completion.choices[0]?.message?.content ||
          'Извините, не удалось сгенерировать ответ.';
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error('OpenAI API error, falling back to mock:', errMsg);
        generated = this.buildAnswer({
          scenarioKey,
          userMessage: sanitizedInput.clean,
          basePrompt: basePrompt.content,
          scenarioPrompt: scenarioPrompt.content,
          warnings: sanitizedInput.warnings,
          context: payload.clientContext,
        });
      }
    } else {
      generated = this.buildAnswer({
        scenarioKey,
        userMessage: sanitizedInput.clean,
        basePrompt: basePrompt.content,
        scenarioPrompt: scenarioPrompt.content,
        warnings: sanitizedInput.warnings,
        context: payload.clientContext,
      });
    }

    const cleanOutput = this.safety.sanitizeOutput(generated);
    const tokensOut = estimateTokens(cleanOutput);

    const assistant = await this.prisma.aiMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: cleanOutput,
        tokensIn: userMessage.tokensIn,
        tokensOut,
        provider: provider.provider,
        model: provider.model,
      },
    });

    await this.costManager.recordUsage(userId, userMessage.tokensIn ?? 0, tokensOut);

    for await (const event of this.mux.streamText(cleanOutput, {
      messageId: assistant.id,
      usage: {
        tokensIn: userMessage.tokensIn ?? 0,
        tokensOut,
      },
    })) {
      yield event;
    }
  }
}
