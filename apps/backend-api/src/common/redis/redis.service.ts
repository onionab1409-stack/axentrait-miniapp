import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('REDIS_URL') ?? 'redis://127.0.0.1:6379';
    this.client = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: false,
      lazyConnect: false,
    });
  }

  get raw(): Redis {
    return this.client;
  }

  async ping(): Promise<boolean> {
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  async incrWithTtl(key: string, ttlSeconds: number): Promise<number> {
    const tx = this.client.multi();
    tx.incr(key);
    tx.expire(key, ttlSeconds, 'NX');
    const result = await tx.exec();
    const count = result?.[0]?.[1];
    return typeof count === 'number' ? count : Number(count ?? 0);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
