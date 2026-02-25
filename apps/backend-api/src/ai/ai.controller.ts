import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@Controller('/api/v1/ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('sessions')
  async listSessions(@Req() req: Request & { user: { id: string } }) {
    return {
      ok: true,
      data: await this.ai.listSessions(req.user.id),
    };
  }

  @Post('sessions')
  async createSession(@Req() req: Request & { user: { id: string } }, @Body() body: unknown) {
    return {
      ok: true,
      data: await this.ai.createSession(req.user.id, body),
    };
  }

  @Get('sessions/:id')
  async getSession(@Req() req: Request & { user: { id: string } }, @Param('id') sessionId: string) {
    return {
      ok: true,
      data: await this.ai.getSession(req.user.id, sessionId),
    };
  }

  @Get('sessions/:id/messages')
  async getMessages(@Req() req: Request & { user: { id: string } }, @Param('id') sessionId: string) {
    return {
      ok: true,
      data: await this.ai.getMessages(req.user.id, sessionId),
    };
  }

  @Post('sessions/:id/messages')
  async stream(
    @Req() req: Request & { user: { id: string } },
    @Param('id') sessionId: string,
    @Body() body: unknown,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      for await (const event of this.ai.streamChat(req.user.id, sessionId, body)) {
        res.write(`event: ${event.event}\n`);
        res.write(`data: ${JSON.stringify(event.data)}\n\n`);
        if (event.event === 'error') {
          break;
        }
      }
    } catch {
      res.write('event: error\n');
      res.write(`data: ${JSON.stringify({ code: 'AI_STREAM_ERROR', message: 'Streaming failed' })}\n\n`);
    } finally {
      res.end();
    }
  }
}
