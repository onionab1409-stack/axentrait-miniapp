import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import { TelegramBotService } from './telegram-bot.service';

type TelegramUpdate = {
  message?: {
    text?: string;
    chat?: {
      id?: number;
    };
  };
};

function safeCompare(left: string, right: string): boolean {
  const leftBuf = Buffer.from(left);
  const rightBuf = Buffer.from(right);
  if (leftBuf.length !== rightBuf.length) return false;
  return timingSafeEqual(leftBuf, rightBuf);
}

@Controller(['/telegram', '/api/v1/telegram'])
export class TelegramBotUpdateController {
  constructor(
    private readonly config: ConfigService,
    private readonly telegram: TelegramBotService,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Body() body: TelegramUpdate,
    @Headers('x-telegram-bot-api-secret-token') secretToken?: string,
  ) {
    const expectedSecret = this.config.get<string>('TG_WEBHOOK_SECRET_TOKEN');
    if (expectedSecret) {
      if (!secretToken || !safeCompare(secretToken, expectedSecret)) {
        throw new UnauthorizedException({ code: 'INVALID_WEBHOOK_SECRET', message: 'Webhook secret mismatch' });
      }
    }

    const text = body.message?.text?.trim() ?? '';
    const chatId = body.message?.chat?.id;

    if (chatId && text.startsWith('/start')) {
      const parts = text.split(/\s+/, 2);
      const startParam = parts[1];
      await this.telegram.sendStartWelcome(chatId, startParam);
    }

    return { ok: true };
  }
}
