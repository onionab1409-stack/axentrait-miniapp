import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { RedisService } from '../redis/redis.service';

const AUTH_LIMIT_PER_MIN = 10;
const WINDOW_SECONDS = 60;

@Injectable()
export class AuthRateLimitMiddleware implements NestMiddleware {
  constructor(private readonly redis: RedisService) {}

  async use(req: Request & { requestId?: string }, res: Response, next: NextFunction): Promise<void> {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate:auth:${ip}`;
    const count = await this.redis.incrWithTtl(key, WINDOW_SECONDS);

    if (count > AUTH_LIMIT_PER_MIN) {
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many auth requests',
          requestId: req.requestId ?? 'n/a',
        },
      });
      return;
    }

    next();
  }
}
