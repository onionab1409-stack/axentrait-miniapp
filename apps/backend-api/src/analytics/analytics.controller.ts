import { Body, Controller, Post } from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';

const eventNameRegex = /^[a-z0-9_]+$/;
const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phoneRegex = /(?:\+?\d[\d()\-\s]{6,}\d)/;

const EventSchema = z.object({
  name: z.string().min(1).max(120),
  properties: z.record(z.unknown()).optional(),
  timestamp: z.union([z.string(), z.number(), z.date()]).optional(),
});

const EventsPayloadSchema = z.union([
  z.object({
    events: z.array(EventSchema).max(200),
  }),
  z.record(z.unknown()),
]);

function hasPii(value: unknown): boolean {
  if (typeof value === 'string') {
    return emailRegex.test(value) || phoneRegex.test(value);
  }
  if (Array.isArray(value)) {
    return value.some(hasPii);
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).some(([key, nested]) => {
      const keyLower = key.toLowerCase();
      if (keyLower.includes('email') || keyLower.includes('phone')) return true;
      return hasPii(nested);
    });
  }
  return false;
}

@Controller('/api/v1/events')
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async ingest(@Body() body: unknown) {
    const parsed = EventsPayloadSchema.parse(body);

    const events = Array.isArray((parsed as { events?: unknown }).events)
      ? (parsed as { events: Array<z.infer<typeof EventSchema>> }).events
      : [EventSchema.parse(parsed)];

    const rows = events
      .filter((event) => eventNameRegex.test(event.name))
      .map((event) => {
        const rawProps = event.properties ?? {};
        const sanitizedProps = hasPii(rawProps) ? { pii_redacted: true } : rawProps;
        const ts =
          typeof event.timestamp === 'string' || typeof event.timestamp === 'number'
            ? new Date(event.timestamp)
            : event.timestamp instanceof Date
              ? event.timestamp
              : new Date();

        return {
          name: event.name,
          properties: sanitizedProps as object,
          timestamp: Number.isNaN(ts.getTime()) ? new Date() : ts,
        };
      });

    if (rows.length > 0) {
      await this.prisma.analyticsEvent.createMany({
        data: rows,
      });
    }

    return {
      ok: true,
      data: {
        accepted: rows.length,
      },
    };
  }
}
