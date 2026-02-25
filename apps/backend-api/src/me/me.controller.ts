import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MeService } from './me.service';

@Controller('/api/v1/me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  async getMe(@Req() req: Request & { user: { id: string } }) {
    return { ok: true, data: await this.meService.me(req.user.id) };
  }

  @Patch()
  async patch(@Req() req: Request & { user: { id: string } }, @Body() body: unknown) {
    return { ok: true, data: await this.meService.patch(req.user.id, body) };
  }
}
