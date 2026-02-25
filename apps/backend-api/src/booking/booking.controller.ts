import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BookingService } from './booking.service';

@Controller('/api/v1/booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly booking: BookingService) {}

  @Get('slots')
  async slots(@Query('from') from?: string, @Query('to') to?: string) {
    return { ok: true, data: await this.booking.listSlots(from, to) };
  }

  @Post('reserve')
  async reserve(@Req() req: Request & { user: { id: string } }, @Body() body: unknown) {
    return { ok: true, data: await this.booking.reserve(req.user.id, body) };
  }
}
