import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';

const LeadCreateSchema = z
  .object({
    companyName: z.string().max(160).optional(),
    company_name: z.string().max(160).optional(),
    contactEmail: z.string().email().optional(),
    contact_email: z.string().email().optional(),
    contactPhone: z.string().max(40).optional(),
    contact_phone: z.string().max(40).optional(),
    preferredContactMethod: z.enum(['telegram', 'phone', 'email']).optional(),
    preferred_contact_method: z.enum(['telegram', 'phone', 'email']).optional(),
    problemStatement: z.string().min(8).max(4000).optional(),
    problem_statement: z.string().min(8).max(4000).optional(),
    serviceInterest: z.array(z.string().max(120)).max(20).optional(),
    service_interest: z.array(z.string().max(120)).max(20).optional(),
    source: z.string().max(64).optional(),
  })
  .transform((input) => ({
    companyName: input.companyName ?? input.company_name ?? null,
    contactEmail: input.contactEmail ?? input.contact_email ?? null,
    contactPhone: input.contactPhone ?? input.contact_phone ?? null,
    preferredContactMethod: input.preferredContactMethod ?? input.preferred_contact_method ?? 'telegram',
    problemStatement: input.problemStatement ?? input.problem_statement ?? '',
    serviceInterest: input.serviceInterest ?? input.service_interest ?? [],
    source: input.source ?? 'miniapp',
  }));

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramBotService,
  ) {}

  async create(userId: string, input: unknown) {
    const payload = LeadCreateSchema.parse(input);

    const lead = await this.prisma.lead.create({
      data: {
        userId,
        companyName: payload.companyName,
        contactEmail: payload.contactEmail,
        contactPhone: payload.contactPhone,
        preferredContactMethod: payload.preferredContactMethod,
        problemStatement: payload.problemStatement,
        serviceInterest: payload.serviceInterest,
        source: payload.source,
        status: 'new',
        events: {
          create: [
            {
              type: 'created',
              payload: { source: payload.source },
            },
            {
              type: 'crm_sync_enqueued',
              payload: { provider: 'mock' },
            },
          ],
        },
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        telegramUserId: true,
        username: true,
      },
    });

    if (user) {
      void Promise.allSettled([
        this.telegram.sendLeadSubmittedUser(user.telegramUserId.toString()),
        this.telegram.sendLeadSubmittedInternal({
          username: user.username,
          companyName: payload.companyName,
          problemStatement: payload.problemStatement,
          serviceInterest: payload.serviceInterest,
        }),
      ]).then((results) => {
        for (const item of results) {
          if (item.status === 'rejected') {
            this.logger.warn(`Telegram notification failed: ${String(item.reason)}`);
          }
        }
      });
    }

    return {
      id: lead.id,
      status: lead.status,
    };
  }

  async listMine(userId: string) {
    return this.prisma.lead.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}
