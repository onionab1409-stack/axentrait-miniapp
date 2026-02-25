import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CaseMetrics } from '../../components/domain/CaseMetrics';
import { MjImage } from '../../components/ui/MjImage';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { caseImageBySlug } from '../../shared/data';
import { track } from '../../shared/analytics/track';
import { getTagLabel } from '../../config/tagLabels';
import { useCase } from './hooks/useCase';

export default function CaseDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams();

  const caseQuery = useCase(id);

  useEffect(() => {
    if (id) track('case_opened', { screen_id: 'SCR-CS-010', case_id: id });
  }, [id]);

  if (caseQuery.isLoading) {
    return (
      <AppShell title="Кейс" showBack showBottomNav>
        <Skeleton height={220} />
        <Skeleton height={120} />
      </AppShell>
    );
  }

  const caseStudy = caseQuery.data;

  if (caseQuery.isError || !caseStudy) {
    return (
      <AppShell title="Кейс" showBack showBottomNav>
        <ErrorState
          title="Кейс не найден"
          description="Проверьте ссылку или откройте галерею кейсов."
          retryLabel="Вернуться к кейсам"
          onRetry={() => navigate('/cases')}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Кейс" showBack showBottomNav>
      <section className="ax-hero" style={{ minHeight: 220 }}>
        <MjImage
          src={caseImageBySlug(caseStudy.slug)}
          fallbackGradient="linear-gradient(135deg, rgba(47,107,255,0.06), rgba(34,211,238,0.03))"
          alt={caseStudy.title}
          style={{ width: '100%', minHeight: 220, objectFit: 'cover' }}
        />
        <div className="ax-scrim" />
        <div className="ax-hero-content ax-col" style={{ gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            {caseStudy.clientIndustry}
          </span>
          <h1 className="h2" style={{ color: '#fff' }}>
            {caseStudy.title}
          </h1>
          {caseStudy.metrics.headline ? (
            <p className="p metric" style={{ color: 'var(--ax-accent-400)' }}>
              {caseStudy.metrics.headline}
            </p>
          ) : null}
        </div>
      </section>

      <Card>
        <div className="ax-col" style={{ gap: 10 }}>
          <h2 className="h2" style={{ fontSize: 20 }}>
            Что было
          </h2>
          <p className="p">{caseStudy.problem}</p>
        </div>
      </Card>

      <Card>
        <div className="ax-col" style={{ gap: 10 }}>
          <h2 className="h2" style={{ fontSize: 20 }}>
            Что сделали
          </h2>
          <p className="p">{caseStudy.approach}</p>
        </div>
      </Card>

      <Card>
        <div className="ax-col" style={{ gap: 10 }}>
          <h2 className="h2" style={{ fontSize: 20 }}>
            Что получили
          </h2>
          <p className="p">{caseStudy.solution}</p>
        </div>
      </Card>

      {caseStudy.metrics.items?.length ? <CaseMetrics caseStudy={caseStudy} /> : null}

      <Card>
        <div className="ax-col" style={{ gap: 10 }}>
          <div className="ax-row ax-row-wrap">
            <Badge>{caseStudy.timeline}</Badge>
            <Badge>Команда: {caseStudy.teamSize}</Badge>
          </div>
          <div className="ax-row ax-row-wrap">
            {caseStudy.stack.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
          {caseStudy.tags.length > 0 ? (
            <div className="ax-row ax-row-wrap">
              {caseStudy.tags.map((tag) => (
                <Badge key={tag}>{getTagLabel(tag)}</Badge>
              ))}
            </div>
          ) : null}
        </div>
      </Card>

      <div className="ax-row ax-row-wrap">
        <Button
          onClick={() => {
            track('case_cta_clicked', { source_screen: 'SCR-CS-010', case_id: caseStudy.slug });
            track('cta_consultation_clicked', { source_screen: 'SCR-CS-010' });
            navigate('/lead', {
              state: {
                prefill: {
                  source: 'case_detail',
                },
              },
            });
          }}
        >
          Запросить похожее решение
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/cases/${caseStudy.slug}/before-after`)}>
          Before / After
        </Button>
        <Button variant="ghost" onClick={() => navigate(`/cases/${caseStudy.slug}/media`)}>
          Видео и отзывы
        </Button>
      </div>
    </AppShell>
  );
}
