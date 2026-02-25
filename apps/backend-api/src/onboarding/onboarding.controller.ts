import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

const AnswersSchema = z.object({
  role: z.string().max(120),
  industry: z.string().max(120),
  companySize: z.string().max(120),
  painArea: z.string().max(120),
  goal: z.string().max(120),
});

const PayloadSchema = z.object({
  answers: AnswersSchema,
});

function buildSegments(answers: z.infer<typeof AnswersSchema>): string[] {
  return [
    `role:${answers.role}`,
    `industry:${answers.industry}`,
    `company_size:${answers.companySize}`,
    `pain:${answers.painArea}`,
    `goal:${answers.goal}`,
  ];
}

@Controller('/api/v1/onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('answers')
  async answers(@Req() req: Request & { user: { id: string } }, @Body() body: unknown) {
    const payload = PayloadSchema.parse(body);
    const segments = buildSegments(payload.answers);

    const [profile] = await this.prisma.$transaction([
      this.prisma.userProfile.upsert({
        where: { userId: req.user.id },
        update: {
          role: payload.answers.role,
          industry: payload.answers.industry,
          companySize: payload.answers.companySize,
          painArea: payload.answers.painArea,
          goal: payload.answers.goal,
          segments,
        },
        create: {
          userId: req.user.id,
          role: payload.answers.role,
          industry: payload.answers.industry,
          companySize: payload.answers.companySize,
          painArea: payload.answers.painArea,
          goal: payload.answers.goal,
          segments,
        },
      }),
      this.prisma.onboardingAnswer.create({
        data: {
          userId: req.user.id,
          answers: payload.answers,
        },
      }),
    ]);

    return {
      ok: true,
      data: {
        profile,
        segments,
      },
    };
  }
}
