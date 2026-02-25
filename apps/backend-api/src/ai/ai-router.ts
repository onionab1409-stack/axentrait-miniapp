import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type RoutedProvider = {
  provider: 'anthropic' | 'openai' | 'mock';
  model: string;
  fallbackUsed: boolean;
};

@Injectable()
export class AiRouter {
  constructor(private readonly config: ConfigService) {}

  async route(): Promise<RoutedProvider> {
    const primaryProvider = (this.config.get<string>('AI_PRIMARY_PROVIDER') ??
      this.config.get<string>('AI_DEFAULT_PROVIDER') ??
      'anthropic') as 'anthropic' | 'openai' | 'mock';
    const fallbackProvider = (this.config.get<string>('AI_FALLBACK_PROVIDER') ?? 'openai') as
      | 'anthropic'
      | 'openai'
      | 'mock';

    const primaryModel =
      this.config.get<string>('AI_PRIMARY_MODEL') ??
      (primaryProvider === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gpt-4o-mini');
    const fallbackModel =
      this.config.get<string>('AI_FALLBACK_MODEL') ??
      (fallbackProvider === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gpt-4o-mini');

    const hasAnthropic = Boolean(this.config.get<string>('ANTHROPIC_API_KEY'));
    const hasOpenAi = Boolean(this.config.get<string>('OPENAI_API_KEY'));

    if (primaryProvider === 'anthropic' && hasAnthropic) {
      return { provider: 'anthropic', model: primaryModel, fallbackUsed: false };
    }
    if (primaryProvider === 'openai' && hasOpenAi) {
      return { provider: 'openai', model: primaryModel, fallbackUsed: false };
    }
    if (primaryProvider === 'mock') {
      return { provider: 'mock', model: 'mock-v1', fallbackUsed: false };
    }

    if (fallbackProvider === 'anthropic' && hasAnthropic) {
      return { provider: 'anthropic', model: fallbackModel, fallbackUsed: true };
    }
    if (fallbackProvider === 'openai' && hasOpenAi) {
      return { provider: 'openai', model: fallbackModel, fallbackUsed: true };
    }

    return { provider: 'mock', model: 'mock-v1', fallbackUsed: true };
  }
}
