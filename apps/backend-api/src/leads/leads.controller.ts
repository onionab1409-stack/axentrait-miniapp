import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LeadsService } from './leads.service';

@Controller('/api/v1/leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async create(@Req() req: Request & { user: { id: string } }, @Body() body: unknown) {
    return { ok: true, data: await this.leadsService.create(req.user.id, body) };
  }

  @Get('my')
  async mine(@Req() req: Request & { user: { id: string } }) {
    return { ok: true, data: await this.leadsService.listMine(req.user.id) };
  }
}
