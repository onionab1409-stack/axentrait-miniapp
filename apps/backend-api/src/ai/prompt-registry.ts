import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

export type PromptSelection = {
  key: string;
  version: number;
  content: string;
};

@Injectable()
export class PromptRegistry {
  constructor(private readonly prisma: PrismaService) {}

  private bucket(userId: string): number {
    const digest = createHash('sha256').update(userId).digest('hex').slice(0, 8);
    return Number.parseInt(digest, 16) % 100;
  }

  async getPrompt(key: string, userId: string): Promise<PromptSelection> {
    const template = await this.prisma.promptTemplate.findUnique({
      where: { key },
      include: {
        versions: {
          where: { isActive: true },
          orderBy: { version: 'asc' },
        },
      },
    });

    if (!template || template.versions.length === 0) {
      return { key, version: 1, content: '' };
    }

    const versions = template.versions;
    const selected =
      versions.length === 1
        ? versions[0]
        : versions[this.bucket(userId) < 50 ? 0 : 1] ?? versions[versions.length - 1];

    return {
      key,
      version: selected.version,
      content: selected.content,
    };
  }
}
