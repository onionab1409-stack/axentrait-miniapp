import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../common/redis/redis.service';

type LimitCheckResult = {
  allowed: boolean;
  remaining: number;
  reason?: 'minute' | 'day';
};

function dayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function secondsUntilTomorrow(now = new Date()): number {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.floor((next.getTime() - now.getTime()) / 1000));
}

@Injectable()
export class CostManager {
  private readonly perDay: number;
  private readonly perMinute: number;

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.perDay = Number(
      this.config.get<string>('AI_RATE_LIMIT_PER_USER_DAY') ?? this.config.get<string>('AI_MAX_REQUESTS_PER_DAY') ?? '20',
    );
    this.perMinute = Number(
      this.config.get<string>('AI_RATE_LIMIT_PER_USER_MIN') ?? this.config.get<string>('AI_MAX_REQUESTS_PER_MIN') ?? '6',
    );
  }

  async checkLimit(userId: string): Promise<LimitCheckResult> {
    const minuteBucket = Math.floor(Date.now() / 60000);
    const minuteKey = `ai:limit:min:${userId}:${minuteBucket}`;
    const day = dayKey();
    const dayKeyValue = `ai:limit:day:${userId}:${day}`;

    const [minuteRaw, dayRaw] = await this.redis.raw.mget(minuteKey, dayKeyValue);
    const minuteCount = Number(minuteRaw ?? '0');
    const dayCount = Number(dayRaw ?? '0');

    if (minuteCount >= this.perMinute) {
      return { allowed: false, remaining: 0, reason: 'minute' };
    }
    if (dayCount >= this.perDay) {
      return { allowed: false, remaining: 0, reason: 'day' };
    }

    return {
      allowed: true,
      remaining: Math.max(0, this.perDay - dayCount),
    };
  }

  async recordUsage(userId: string, tokensIn: number, tokensOut: number): Promise<void> {
    const minuteBucket = Math.floor(Date.now() / 60000);
    const minuteKey = `ai:limit:min:${userId}:${minuteBucket}`;
    const day = dayKey();
    const dayCounterKey = `ai:limit:day:${userId}:${day}`;
    const dayTokensKey = `ai:tokens:day:${userId}:${day}`;

    await this.redis.raw
      .multi()
      .incr(minuteKey)
      .expire(minuteKey, 120, 'NX')
      .incr(dayCounterKey)
      .expire(dayCounterKey, secondsUntilTomorrow(), 'NX')
      .incrby(dayTokensKey, Math.max(0, tokensIn + tokensOut))
      .expire(dayTokensKey, secondsUntilTomorrow(), 'NX')
      .exec();
  }
}
