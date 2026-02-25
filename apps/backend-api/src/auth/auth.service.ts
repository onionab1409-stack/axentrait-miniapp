import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { validateTelegramInitData } from './telegram.util';

type JwtRefreshPayload = {
  sub: string;
  telegramUserId: string;
  tokenId: string;
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private getTtlSeconds(key: string, fallback: number): number {
    const raw = this.configService.get<string>(key);
    const parsed = Number(raw ?? fallback);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private async issueTokens(userId: string, telegramUserId: string): Promise<Tokens> {
    const accessTtl = this.getTtlSeconds('JWT_ACCESS_TTL_SEC', 900);
    const refreshTtl = this.getTtlSeconds('JWT_REFRESH_TTL_SEC', 60 * 60 * 24 * 30);
    const refreshTokenId = randomUUID();

    const accessToken = await this.jwtService.signAsync(
      { telegramUserId },
      {
        subject: userId,
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessTtl,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { telegramUserId, tokenId: refreshTokenId },
      {
        subject: userId,
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenId: refreshTokenId,
        tokenHash: this.hash(refreshToken),
        expiresAt: new Date(Date.now() + refreshTtl * 1000),
      },
    });

    return { accessToken, refreshToken, refreshTokenId };
  }

  async loginWithTelegram(initData: string) {
    const botToken = this.configService.getOrThrow<string>('TG_BOT_TOKEN');
    const initDataMaxAgeSec = this.getTtlSeconds('TG_INITDATA_MAX_AGE_SEC', 24 * 60 * 60);
    const parsed = validateTelegramInitData(initData, botToken, initDataMaxAgeSec);
    if (!parsed.isValid || !parsed.user) {
      throw new UnauthorizedException({ code: 'INVALID_INIT_DATA', message: 'Invalid Telegram initData' });
    }

    const telegramUserId = BigInt(parsed.user.id);
    const user = await this.prisma.user.upsert({
      where: { telegramUserId },
      create: {
        telegramUserId,
        firstName: parsed.user.first_name ?? null,
        lastName: parsed.user.last_name ?? null,
        username: parsed.user.username ?? null,
        languageCode: parsed.user.language_code ?? null,
      },
      update: {
        firstName: parsed.user.first_name ?? null,
        lastName: parsed.user.last_name ?? null,
        username: parsed.user.username ?? null,
        languageCode: parsed.user.language_code ?? null,
      },
    });

    const profile = await this.prisma.userProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    const tokens = await this.issueTokens(user.id, String(user.telegramUserId));

    return {
      ...tokens,
      user: {
        id: user.id,
        telegramUserId: user.telegramUserId.toString(),
        firstName: user.firstName,
        username: user.username,
        segments: profile.segments,
      },
    };
  }

  async refreshToken(rawToken: string, origin?: string): Promise<{ accessToken: string; refreshToken: string }> {
    const appOrigin = this.configService.get<string>('APP_ORIGIN');
    const devOrigin = 'http://localhost:5173';
    if (origin && appOrigin && origin !== appOrigin && origin !== devOrigin) {
      throw new ForbiddenException({ code: 'ORIGIN_NOT_ALLOWED', message: 'Origin is not allowed' });
    }

    let payload: JwtRefreshPayload;
    try {
      payload = this.jwtService.verify(rawToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      }) as JwtRefreshPayload;
    } catch {
      throw new UnauthorizedException({ code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid' });
    }

    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenId: payload.tokenId },
    });

    if (!existing || existing.userId !== payload.sub || existing.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException({ code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is expired or revoked' });
    }

    if (existing.tokenHash !== this.hash(rawToken)) {
      throw new UnauthorizedException({ code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token hash mismatch' });
    }

    await this.prisma.refreshToken.delete({ where: { tokenId: payload.tokenId } });

    const next = await this.issueTokens(payload.sub, payload.telegramUserId);
    return {
      accessToken: next.accessToken,
      refreshToken: next.refreshToken,
    };
  }

  async logout(rawToken?: string): Promise<void> {
    if (!rawToken) return;
    try {
      const payload = this.jwtService.verify(rawToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      }) as JwtRefreshPayload;
      await this.prisma.refreshToken.deleteMany({ where: { tokenId: payload.tokenId } });
    } catch {
      // Ignore invalid refresh token on logout.
    }
  }
}
