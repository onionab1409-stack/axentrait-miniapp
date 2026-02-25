import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { REFRESH_COOKIE_NAME } from '../common/utils/constants';
import { AuthService } from './auth.service';

type RefreshBody = {
  refreshToken?: string;
};

const cookieOptions = (secure: boolean) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure,
  path: '/api/v1/auth',
});

@Controller('/api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('telegram')
  async telegram(
    @Body('initData') initData: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const secure = this.config.get<string>('NODE_ENV') === 'production';
    const result = await this.authService.loginWithTelegram(initData);

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, cookieOptions(secure));

    return {
      ok: true,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Body() body: RefreshBody,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const secure = this.config.get<string>('NODE_ENV') === 'production';
    const rawToken = body.refreshToken ?? (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined);
    if (!rawToken) {
      throw new UnauthorizedException({ code: 'MISSING_REFRESH_TOKEN', message: 'Refresh token is required' });
    }

    const next = await this.authService.refreshToken(rawToken, req.headers.origin as string | undefined);
    res.cookie(REFRESH_COOKIE_NAME, next.refreshToken, cookieOptions(secure));

    return {
      ok: true,
      data: {
        accessToken: next.accessToken,
        refreshToken: next.refreshToken,
      },
    };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Body() body: RefreshBody,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const token = body.refreshToken ?? (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined);
    await this.authService.logout(token);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
    return { ok: true };
  }
}
