import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { track } from '../../shared/analytics/track';
import { uid } from '../../shared/utils/id';
import { useBookingSlots } from './hooks/useBookingSlots';
import { useReserveSlot } from './hooks/useReserveSlot';

function formatSlot(startsAt: string) {
  return new Date(startsAt).toLocaleString('ru-RU', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  const leadId = searchParams.get('leadId') ?? undefined;
  const slotsQuery = useBookingSlots(undefined, undefined, isOnline);
  const reserveSlot = useReserveSlot();

  useEffect(() => {
    track('calendar_opened', { screen_id: 'SCR-LEAD-020' });
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const slots = useMemo(() => (slotsQuery.data ?? []).filter((item) => item.capacity > item.reservedCount), [slotsQuery.data]);

  const confirm = async () => {
    if (!selectedSlotId || reserveSlot.isPending || !isOnline) return;

    const reservation = await reserveSlot.mutateAsync({
      slotId: selectedSlotId,
      idempotencyKey: uid('booking'),
      leadId,
    });

    navigate(`/lead/success?booking=1&reservationId=${encodeURIComponent(reservation.id)}`);
  };

  return (
    <AppShell title="Выбор слота" showBack showBottomNav>
      {!isOnline ? (
        <ErrorState
          title="Календарь недоступен офлайн"
          description="Подключитесь к интернету, чтобы увидеть свободные слоты и забронировать встречу."
        />
      ) : null}

      <Card>
        <div className="ax-col" style={{ gap: 8 }}>
          <h1 className="h2" style={{ fontSize: 22 }}>
            Выберите удобный слот
          </h1>
          <p className="p muted">После выбора закрепим слот и отправим подтверждение в Telegram.</p>
        </div>
      </Card>

      {slotsQuery.isLoading ? (
        <Card>
          <div className="ax-col" style={{ gap: 8 }}>
            <Skeleton height={36} />
            <Skeleton height={36} />
            <Skeleton height={36} />
          </div>
        </Card>
      ) : null}

      {!slotsQuery.isLoading && slotsQuery.isError ? (
        <ErrorState
          title="Не удалось загрузить слоты"
          description="Сервис бронирования временно недоступен."
          onRetry={() => {
            void slotsQuery.refetch();
          }}
        />
      ) : null}

      {!slotsQuery.isLoading && !slotsQuery.isError && slots.length === 0 ? (
        <EmptyState
          title="Нет свободных слотов"
          description="Сейчас нет доступных окон. Оставьте заявку, и менеджер согласует время вручную."
          actionLabel="К форме заявки"
          onAction={() => navigate('/lead')}
        />
      ) : null}

      {!slotsQuery.isLoading && !slotsQuery.isError && slots.length > 0 ? (
        <Card>
          <div className="ax-row ax-row-wrap" style={{ gap: 8 }}>
            {slots.map((slot) => (
              <Chip
                key={slot.id}
                active={selectedSlotId === slot.id}
                onClick={() => {
                  setSelectedSlotId(slot.id);
                  track('slot_selected', { slot_id: slot.id, starts_at: slot.startsAt });
                }}
              >
                {`${formatSlot(slot.startsAt)} (${slot.capacity - slot.reservedCount} мест)`}
              </Chip>
            ))}
          </div>
        </Card>
      ) : null}

      {reserveSlot.isError ? (
        <ErrorState
          title="Не удалось забронировать слот"
          description={reserveSlot.error instanceof Error ? reserveSlot.error.message : 'Попробуйте другой слот.'}
          onRetry={() => {
            void confirm();
          }}
        />
      ) : null}

      <div className="ax-row ax-row-wrap">
        <Button
          isDisabled={!selectedSlotId || !isOnline}
          isLoading={reserveSlot.isPending}
          onClick={() => {
            void confirm();
          }}
        >
          Подтвердить слот
        </Button>
        <Button variant="secondary" onClick={() => navigate('/lead')}>
          Назад к заявке
        </Button>
      </div>
    </AppShell>
  );
}
