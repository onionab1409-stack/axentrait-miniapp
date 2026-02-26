import { useCallback, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MjImage } from '../../components/ui/MjImage';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { AppShell } from '../../components/layout/AppShell';
import { BottomNav } from '../../components/layout/BottomNav';
import { ToastHost } from '../../components/ui/ToastHost';
import { serviceImageBySlug } from '../../shared/data';
import { track } from '../../shared/analytics/track';
import { useTgBackButton } from '../../shared/telegram/useTgBackButton';
import { useService } from './hooks/useService';

function formatPrice(value?: string | null): string | null {
  if (!value) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  return `${numeric.toLocaleString('ru-RU')} ₽`;
}

export default function ServiceDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id = '' } = useParams();

  const serviceQuery = useService(id);
  const service = serviceQuery.data;

  /* Telegram Back Button */
  const goBack = useCallback(() => {
    if (location.key === 'default') navigate('/services');
    else navigate(-1);
  }, [location.key, navigate]);
  useTgBackButton(true, goBack);

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

  /* H24 FIX: only first paragraph of longDescription */
  const firstParagraph = (service.longDescription || '')
    .split('\n\n')
    .map((p) => p.trim())
    .find((p) => p.length > 0) ?? '';

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

      {/* H23 FIX: content pinned to bottom with flex-end */}
      <div style={{
        position: 'relative', zIndex: 1, height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '64px 20px 80px',
        overflowY: 'auto',
      }}>
        {/* H1: 22px/700/white — Service is the exception (not cyan/300) */}
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#F0F6FC',
          lineHeight: 1.2,
          margin: 0,
          marginBottom: 8,
        }}>
          {service.title}
        </h1>

        {/* Subtitle: 13px, slightly muted */}
        <p style={{
          fontSize: 13,
          color: 'rgba(240,246,252,0.5)',
          lineHeight: 1.5,
          margin: 0,
          marginBottom: 16,
        }}>
          {service.shortPitch}
        </p>

        {/* H25 FIX: Chips white (#F0F6FC), not teal */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            fontSize: 12, padding: '5px 12px', borderRadius: 8,
            color: '#F0F6FC', background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          }}>
            {timeline}
          </span>
          {price ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: 12, padding: '5px 12px', borderRadius: 8,
              color: '#F0F6FC', background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            }}>
              от {price}
            </span>
          ) : null}
        </div>

        {/* H24 FIX: single paragraph only */}
        {firstParagraph ? (
          <p style={{
            fontSize: 14,
            lineHeight: 1.6,
            fontWeight: 300,
            color: 'rgba(240,246,252,0.65)',
            margin: '0 0 16px',
          }}>
            {firstParagraph}
          </p>
        ) : null}

        {/* Primary button — solid gradient (conversion CTA, unchanged) */}
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

        {/* H26 FIX: compact secondary button, not fullWidth */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="secondary"
            onClick={() => navigate('/services')}
            style={{
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 12,
              borderColor: 'rgba(34,211,238,0.3)',
              padding: '11px 22px',
              minHeight: 'auto',
            }}
          >
            Все услуги
          </Button>
        </div>
      </div>

      <BottomNav />
      <ToastHost />
    </div>
  );
}
