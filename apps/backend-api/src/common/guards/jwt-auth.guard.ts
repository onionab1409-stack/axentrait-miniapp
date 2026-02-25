import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

type AccessPayload = {
  sub: string;
  telegramUserId: string;
  iat: number;
  exp: number;
};

const USER_LIMIT_PER_MIN = 120;

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: { id: string; telegramUserId: string };
    }>();

    const authHeader = req.headers.authorization ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Missing bearer token' });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Empty bearer token' });
    }

    let payload: AccessPayload;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }) as AccessPayload;
    } catch {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Invalid access token' });
    }

    req.user = {
      id: payload.sub,
      telegramUserId: payload.telegramUserId,
    };

    const key = `rate:user:${payload.sub}`;
    const hits = await this.redis.incrWithTtl(key, 60);
    if (hits > USER_LIMIT_PER_MIN) {
      throw new HttpException(
        { code: 'RATE_LIMITED', message: 'Per-user rate limit reached' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
