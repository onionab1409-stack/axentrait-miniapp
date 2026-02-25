import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { RedisService } from '../redis/redis.service';

const GLOBAL_LIMIT_PER_MIN = 100;
const WINDOW_SECONDS = 60;

@Injectable()
export class GlobalRateLimitMiddleware implements NestMiddleware {
  constructor(private readonly redis: RedisService) {}

  async use(req: Request & { requestId?: string }, res: Response, next: NextFunction): Promise<void> {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate:global:${ip}`;
    const count = await this.redis.incrWithTtl(key, WINDOW_SECONDS);

    if (count > GLOBAL_LIMIT_PER_MIN) {
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests',
          requestId: req.requestId ?? 'n/a',
        },
      });
      return;
    }

    next();
  }
}
