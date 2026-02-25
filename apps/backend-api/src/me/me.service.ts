import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';

const ProfilePatchSchema = z.object({
  role: z.string().max(120).optional(),
  industry: z.string().max(120).optional(),
  companySize: z.string().max(80).optional(),
  painArea: z.string().max(120).optional(),
  goal: z.string().max(120).optional(),
  budgetRange: z.string().max(120).optional(),
  timeline: z.string().max(120).optional(),
  segments: z.array(z.string().max(120)).max(30).optional(),
});

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      telegramUserId: user.telegramUserId.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      languageCode: user.languageCode,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile,
    };
  }

  async patch(userId: string, input: unknown) {
    const payload = ProfilePatchSchema.parse(input);
    return this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        role: payload.role,
        industry: payload.industry,
        companySize: payload.companySize,
        painArea: payload.painArea,
        goal: payload.goal,
        budgetRange: payload.budgetRange,
        timeline: payload.timeline,
        segments: payload.segments,
      },
      create: {
        userId,
        role: payload.role,
        industry: payload.industry,
        companySize: payload.companySize,
        painArea: payload.painArea,
        goal: payload.goal,
        budgetRange: payload.budgetRange,
        timeline: payload.timeline,
        segments: payload.segments ?? [],
      },
    });
  }
}
