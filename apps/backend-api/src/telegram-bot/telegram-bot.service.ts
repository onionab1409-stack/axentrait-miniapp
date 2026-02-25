import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type InlineButton = {
  text: string;
  web_app?: { url: string };
  url?: string;
};

@Injectable()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(private readonly config: ConfigService) {}

  private get botToken(): string {
    return this.config.get<string>('TG_BOT_TOKEN') ?? this.config.get<string>('TELEGRAM_BOT_TOKEN') ?? '';
  }

  private get apiBase(): string {
    return `https://api.telegram.org/bot${this.botToken}`;
  }

  private get miniAppUrl(): string {
    return this.config.get<string>('TG_MINIAPP_URL') ?? this.config.get<string>('APP_URL') ?? '';
  }

  sanitizeStartParam(value?: string): string | null {
    if (!value) return null;
    const trimmed = value.trim().slice(0, 64);
    if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
      return null;
    }
    return trimmed;
  }

  private async send(chatId: string | number, text: string, button?: InlineButton): Promise<void> {
    if (!this.botToken) {
      this.logger.warn('TG_BOT_TOKEN is not configured, skip Telegram notification');
      return;
    }

    const body: Record<string, unknown> = {
      chat_id: chatId,
      text,
    };
    if (button) {
      body.reply_markup = {
        inline_keyboard: [[button]],
      };
    }

    try {
      const response = await fetch(`${this.apiBase}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const details = await response.text();
        this.logger.warn(`Telegram sendMessage failed: ${response.status} ${details}`);
      }
    } catch (error) {
      this.logger.warn(`Telegram sendMessage request failed: ${(error as Error).message}`);
    }
  }

  async sendStartWelcome(chatId: string | number, rawStartParam?: string): Promise<void> {
    const startParam = this.sanitizeStartParam(rawStartParam);
    const deepLink =
      this.miniAppUrl && startParam ? `${this.miniAppUrl}/#/?startapp=${startParam}` : this.miniAppUrl || undefined;

    await this.send(
      chatId,
      'Добро пожаловать в AXENTRAIT. Нажмите кнопку ниже, чтобы открыть Mini App и подобрать решение.',
      this.miniAppUrl
        ? {
            text: 'Открыть приложение',
            web_app: { url: deepLink ?? this.miniAppUrl },
          }
        : undefined,
    );
  }

  async sendLeadSubmittedUser(telegramUserId: string): Promise<void> {
    const text =
      'Заявка принята. В течение 1 рабочего дня мы уточним вводные и предложим формат: аудит/пилот/подписка.\n' +
      'Если удобно — оставьте время для короткого созвона (15 минут).';
    await this.send(
      telegramUserId,
      text,
      this.miniAppUrl
        ? {
            text: 'Открыть Mini App',
            web_app: { url: `${this.miniAppUrl}/#/lead/success` },
          }
        : undefined,
    );
  }

  async sendLeadSubmittedInternal(input: {
    username?: string | null;
    companyName?: string | null;
    problemStatement: string;
    serviceInterest: string[];
  }): Promise<void> {
    const chatId = this.config.get<string>('INTERNAL_GROUP_CHAT_ID');
    if (!chatId) {
      return;
    }

    const message =
      `🆕 Новая заявка от ${input.username ? `@${input.username}` : 'пользователя'}\n` +
      `Компания: ${input.companyName || '—'}\n` +
      `Боль: ${input.problemStatement.slice(0, 220)}\n` +
      `Интерес: ${input.serviceInterest.join(', ') || '—'}`;

    await this.send(chatId, message);
  }
}
