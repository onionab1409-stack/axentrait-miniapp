import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';

const ReserveSchema = z.object({
  slotId: z.string().uuid(),
  leadId: z.string().uuid().optional(),
  idempotencyKey: z.string().min(8).max(128),
});

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async listSlots(from?: string, to?: string) {
    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

    return this.prisma.bookingSlot.findMany({
      where: {
        isActive: true,
        startsAt: { gte: fromDate, lte: toDate },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  async reserve(userId: string, input: unknown) {
    const payload = ReserveSchema.parse(input);

    const existing = await this.prisma.bookingReservation.findUnique({
      where: { idempotencyKey: payload.idempotencyKey },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.bookingSlot.findUnique({
        where: { id: payload.slotId },
      });
      if (!slot || !slot.isActive) {
        throw new NotFoundException({ code: 'SLOT_NOT_FOUND', message: 'Booking slot not found' });
      }

      if (slot.reservedCount >= slot.capacity) {
        throw new ConflictException({ code: 'SLOT_FULL', message: 'Booking slot is full' });
      }

      const reservation = await tx.bookingReservation.create({
        data: {
          slotId: payload.slotId,
          userId,
          leadId: payload.leadId ?? null,
          idempotencyKey: payload.idempotencyKey,
          status: 'reserved',
        },
      });

      await tx.bookingSlot.update({
        where: { id: slot.id },
        data: {
          reservedCount: { increment: 1 },
        },
      });

      return reservation;
    });
  }
}
