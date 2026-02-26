import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { MjImage } from '../../components/ui/MjImage';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { BottomNav } from '../../components/layout/BottomNav';
import { ToastHost } from '../../components/ui/ToastHost';
import { serviceImageBySlug } from '../../shared/data';
import { track } from '../../shared/analytics/track';
import { useService } from './hooks/useService';

function formatPrice(value?: string | null): string | null {
  if (!value) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  return `${numeric.toLocaleString('ru-RU')} ₽`;
}

export default function ServiceDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams();

  const serviceQuery = useService(id);
  const service = serviceQuery.data;

  useEffect(() => {
    if (id) track('service_opened', { service_id: id, screen_id: 'SCR-SVC-020' });
  }, [id]);

  const timeline = service?.typicalTimeline ?? 'Срок уточняется';
  const price = formatPrice(service?.startingPrice ?? null);

  if (serviceQuery.isLoading) {
    return (
      <AppShell title="Услуга" showBack showBottomNav>
        <Skeleton height={220} />
        <Skeleton height={130} />
      </AppShell>
    );
  }

  if (serviceQuery.isError || !service) {
    return (
      <AppShell title="Услуга" showBack showBottomNav>
        <ErrorState
          title="Услуга не найдена"
          description="Проверьте ссылку или вернитесь к каталогу."
          retryLabel="Вернуться к каталогу"
          onRetry={() => navigate('/services')}
        />
      </AppShell>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Fullscreen background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MjImage
          src={serviceImageBySlug(service.slug)}
          fallbackGradient="linear-gradient(145deg, rgba(15, 30, 50, 0.9), rgba(5, 10, 20, 0.95))"
          alt={service.title}
          height="100%"
          borderRadius={0}
          scrim={false}
        />
      </div>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1, height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '64px 20px 80px',
        overflowY: 'auto',
      }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 700,
          color: '#F0F6FC',
          lineHeight: 1.2,
          margin: 0,
          marginBottom: 8,
        }}>
          {service.title}
        </h1>

        <p style={{
          fontSize: 14,
          color: 'rgba(240,246,252,0.6)',
          lineHeight: 1.5,
          margin: 0,
          marginBottom: 16,
        }}>
          {service.shortPitch}
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <Chip>{timeline}</Chip>
          {price ? <Chip>от {price}</Chip> : null}
        </div>

        {(service.longDescription || '').split('\n\n')
          .filter((paragraph) => paragraph.trim().length > 0)
          .map((paragraph, i) => (
            <p
              key={`${service.slug}_paragraph_${i}`}
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                fontWeight: 300,
                color: 'rgba(240,246,252,0.72)',
                margin: i === 0 ? '0 0 12px' : '0 0 12px',
              }}
            >
              {paragraph}
            </p>
          ))}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => {
            track('case_cta_clicked', { source_screen: 'SCR-SVC-020' });
            track('cta_consultation_clicked', { source_screen: 'SCR-SVC-020' });
            navigate('/lead', {
              state: {
                prefill: {
                  serviceInterest: [service.slug],
                  source: 'service_detail',
                },
              },
            });
          }}
          style={{ marginTop: 8, marginBottom: 8 }}
        >
          Оставить заявку
        </Button>

        <Button
          variant="glassPrimary"
          size="lg"
          fullWidth
          onClick={() => navigate('/services')}
          style={{ marginBottom: 12 }}
        >
          Все услуги
        </Button>
      </div>

      <BottomNav />
      <ToastHost />
    </div>
  );
}
