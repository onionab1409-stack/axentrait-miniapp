import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTgMainButton } from '../../shared/telegram/useTgMainButton';
import { track } from '../../shared/analytics/track';

export default function LeadSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasBooking = searchParams.get('booking') === '1';

  const responseWindow = useMemo(() => (hasBooking ? 'Слот закреплён. Подтверждение отправим в Telegram.' : 'Мы свяжемся в Telegram в течение рабочего дня.'), [hasBooking]);

  useEffect(() => {
    track('lead_success_viewed', { booking: hasBooking });
  }, [hasBooking]);

  useTgMainButton({
    text: hasBooking ? 'К услугам' : 'Записаться на слот',
    visible: true,
    onClick: () => navigate(hasBooking ? '/services' : '/lead/booking'),
  });

  return (
    <AppShell title="Готово" showBottomNav>
      <Card>
        <div className="ax-col" style={{ gap: 12, alignItems: 'center', textAlign: 'center' }}>
          <div
            aria-hidden
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              border: '2px solid color-mix(in srgb, var(--ax-success-500) 55%, var(--app-border))',
              display: 'grid',
              placeItems: 'center',
              fontSize: 34,
              color: 'var(--ax-success-500)',
              animation: 'ax-success-pop 420ms var(--ax-ease-out)',
            }}
          >
            ✓
          </div>
          <h1 className="h2">Заявка принята</h1>
          <p className="p muted">{responseWindow}</p>
        </div>
      </Card>

      <div className="ax-row ax-row-wrap">
        {!hasBooking ? (
          <Button onClick={() => navigate('/lead/booking')} variant="secondary">
            Записаться на слот
          </Button>
        ) : null}
        <Button onClick={() => navigate('/cases')} variant="secondary">
          Посмотреть кейсы
        </Button>
        <Button onClick={() => navigate('/services')}>Вернуться к услугам</Button>
      </div>

      <style>{`@keyframes ax-success-pop {0%{transform:scale(0.82);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </AppShell>
  );
}
