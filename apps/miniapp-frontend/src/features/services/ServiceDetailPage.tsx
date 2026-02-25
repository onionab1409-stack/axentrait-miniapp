import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { CaseCard } from '../../components/domain/CaseCard';
import { MjImage } from '../../components/ui/MjImage';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { serviceImageBySlug } from '../../shared/data';
import { track } from '../../shared/analytics/track';
import { useCases } from '../cases/hooks/useCases';
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
  const casesQuery = useCases();
  const service = serviceQuery.data;

  useEffect(() => {
    if (id) track('service_opened', { service_id: id, screen_id: 'SCR-SVC-020' });
  }, [id]);

  const relatedCases = useMemo(() => {
    if (!service) return [];

    if (service.relatedCaseStudies && service.relatedCaseStudies.length > 0) {
      return service.relatedCaseStudies;
    }

    const allCases = casesQuery.data ?? [];
    return allCases.filter((caseStudy) => service.relatedCases.includes(caseStudy.slug));
  }, [casesQuery.data, service]);

  const packages = service?.packages ?? [];
  const timeline = service?.typicalTimeline ?? 'Срок уточняется';
  const price = formatPrice(service?.startingPrice ?? null);
  const deliverables = service?.deliverables ?? [];
  const prerequisites = service?.prerequisites ?? [];

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
    <AppShell title="Услуга" showBack showBottomNav>
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(34, 211, 238, 0.06), transparent)',
          borderRadius: 18,
          overflow: 'hidden',
          marginBottom: 6,
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <MjImage
          src={serviceImageBySlug(service.slug)}
          fallbackGradient="linear-gradient(145deg, rgba(15, 30, 50, 0.9), rgba(5, 10, 20, 0.95))"
          alt={service.title}
          style={{ width: '100%', height: 196, objectFit: 'cover' }}
          scrim={false}
        />
        <div style={{ padding: '20px 20px 24px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, margin: 0, marginBottom: 8 }}>{service.title}</h1>
          <p style={{ fontSize: 14, color: 'rgba(240,246,252,0.6)', lineHeight: 1.5, margin: 0 }}>{service.shortPitch}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <Chip>{timeline}</Chip>
            {price ? <Chip>от {price}</Chip> : null}
          </div>
        </div>
      </section>

      <Card variant="default">
        {(service.longDescription || '')
          .split('\n\n')
          .filter((paragraph) => paragraph.trim().length > 0)
          .map((paragraph, i) => (
            <p
              key={`${service.slug}_paragraph_${i}`}
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: 'rgba(240,246,252,0.72)',
                margin: i === 0 ? 0 : '0 0 16px',
              }}
            >
              {paragraph}
            </p>
          ))}
      </Card>

      <Card variant="glass" style={{ marginTop: 4 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, marginTop: 0, marginBottom: 12 }}>Что вы получите</h3>
        {deliverables.length > 0 ? (
          deliverables.map((item, i) => (
            <div
              key={`${service.slug}_deliverable_${i}`}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: '8px 0',
                borderBottom: i < deliverables.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <span style={{ color: '#22D3EE', fontSize: 14, marginTop: 2 }}>✓</span>
              <span style={{ fontSize: 14, color: 'rgba(240,246,252,0.75)', lineHeight: 1.4 }}>{item}</span>
            </div>
          ))
        ) : (
          <p className="p muted" style={{ margin: 0 }}>
            Список артефактов фиксируем после короткого discovery.
          </p>
        )}
      </Card>

      <Card variant="default">
        <h3 style={{ fontSize: 17, fontWeight: 600, marginTop: 0, marginBottom: 12 }}>Предпосылки к старту</h3>
        {prerequisites.length > 0 ? (
          prerequisites.map((item, i) => (
            <div key={`${service.slug}_prerequisite_${i}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0' }}>
              <span style={{ color: 'rgba(240,246,252,0.35)', fontSize: 14 }}>•</span>
              <span style={{ fontSize: 14, color: 'rgba(240,246,252,0.55)', lineHeight: 1.4 }}>{item}</span>
            </div>
          ))
        ) : (
          <p className="p muted" style={{ margin: 0 }}>
            Требования уточняются на стартовом звонке.
          </p>
        )}
      </Card>

      <Card variant="glass">
        <div className="ax-col" style={{ gap: 10 }}>
          <h2 className="h2" style={{ fontSize: 20, margin: 0 }}>
            Пакеты
          </h2>
          <p className="p muted" style={{ margin: 0 }}>
            Доступно пакетов: <span className="metric">{packages.length}</span>
          </p>
          <div className="ax-row ax-row-wrap">
            <Button
              onClick={() => {
                track('package_compare_opened', { service_id: service.slug });
                navigate(`/services/${service.slug}/packages`);
              }}
            >
              Сравнить пакеты
            </Button>
            <Button
              onClick={() => {
                track('calculator_opened', { service_id: service.slug, source_screen: 'SCR-SVC-020' });
                navigate(`/services/${service.slug}/calculator`);
              }}
              variant="secondary"
            >
              Рассчитать ROI
            </Button>
          </div>
        </div>
      </Card>

      <div className="ax-col" style={{ gap: 10 }}>
        <h2 className="h2" style={{ fontSize: 20, margin: 0 }}>
          Кейсы
        </h2>
        <p className="p muted" style={{ margin: 0 }}>
          Похожие проекты и результаты для этого направления.
        </p>
        {casesQuery.isLoading ? (
          <Skeleton height={140} />
        ) : relatedCases.length === 0 ? (
          <EmptyState
            title="Кейсы по этой услуге"
            description="Покажем типовой результат на консультации и примеры из схожей отрасли."
          />
        ) : (
          relatedCases.map((caseStudy) => (
            <CaseCard key={caseStudy.id} caseStudy={caseStudy} onClick={() => navigate(`/cases/${caseStudy.slug}`)} />
          ))
        )}
      </div>

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
        variant="secondary"
        size="lg"
        fullWidth
        onClick={() => navigate('/services')}
        style={{ marginBottom: 32 }}
      >
        Все услуги
      </Button>
    </AppShell>
  );
}
