import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';

@Controller('/api/v1')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get('health')
  async health() {
    let db = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'connected';
    } catch {
      db = 'disconnected';
    }

    const redis = (await this.redis.ping()) ? 'connected' : 'disconnected';

    return {
      status: db === 'connected' && redis === 'connected' ? 'ok' : 'degraded',
      db,
      redis,
    };
  }

  @Get('metrics')
  async metrics() {
    const [users, leads, aiSessions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.lead.count(),
      this.prisma.aiSession.count(),
    ]);

    return {
      users,
      leads,
      aiSessions,
      ts: new Date().toISOString(),
    };
  }
}
