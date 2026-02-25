import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MjImage } from '../../components/ui/MjImage';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { caseImageBySlug } from '../../shared/data';
import { track } from '../../shared/analytics/track';
import { useCase } from './hooks/useCase';

export default function CaseMediaPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const [showVideo, setShowVideo] = useState(false);

  const caseQuery = useCase(id);

  if (caseQuery.isLoading) {
    return (
      <AppShell title="Видео и отзывы" showBack showBottomNav>
        <Skeleton height={120} />
        <Skeleton height={220} />
      </AppShell>
    );
  }

  const caseStudy = caseQuery.data;

  if (caseQuery.isError || !caseStudy) {
    return (
      <AppShell title="Видео и отзывы" showBack showBottomNav>
        <ErrorState title="Медиа кейса недоступны" description="Не удалось загрузить медиа-блок кейса." />
      </AppShell>
    );
  }

  return (
    <AppShell title="Видео и отзывы" showBack showBottomNav>
      <Card>
        <div className="ax-col" style={{ gap: 10 }}>
          <h1 className="h2" style={{ fontSize: 22 }}>
            {caseStudy.title}
          </h1>
          <p className="p muted">Видео открывается только по клику, без автоплея.</p>
        </div>
      </Card>

      <Card>
        <div className="ax-col" style={{ gap: 10 }}>
          <strong>Видео</strong>
          {!showVideo ? (
            <button
              type="button"
              onClick={() => {
                setShowVideo(true);
                track('case_video_played', { case_id: caseStudy.slug });
              }}
              style={{
                border: '1px solid var(--app-border)',
                borderRadius: 12,
                overflow: 'hidden',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <MjImage
                src={caseImageBySlug(caseStudy.slug)}
                fallbackGradient="linear-gradient(135deg, rgba(47,107,255,0.06), rgba(34,211,238,0.03))"
                alt="Video preview"
                style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
              />
            </button>
          ) : caseStudy.assets.video ? (
            <div
              style={{
                border: '1px solid var(--app-border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <iframe
                src={caseStudy.assets.video}
                title={`video_${caseStudy.slug}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: 220, border: 0 }}
              />
            </div>
          ) : (
            <div
              style={{
                border: '1px solid var(--app-border)',
                borderRadius: 12,
                minHeight: 200,
                display: 'grid',
                placeItems: 'center',
                padding: 12,
                background: 'color-mix(in srgb, var(--app-card) 92%, transparent)',
              }}
            >
              <p className="p muted" style={{ textAlign: 'center', margin: 0 }}>
                Видео подключится, когда media-URL будет доступен на backend.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="ax-col" style={{ gap: 10 }}>
          <strong>Отзыв</strong>
          <blockquote style={{ margin: 0, paddingLeft: 12, borderLeft: '2px solid var(--app-accent)' }}>
            <p className="p" style={{ marginTop: 0 }}>
              {caseStudy.testimonial?.quote ?? caseStudy.assets.quotes[0] ?? 'Отзыв будет добавлен позже.'}
            </p>
            <footer className="muted">{caseStudy.testimonial?.author ?? 'Клиент (NDA)'}</footer>
          </blockquote>
        </div>
      </Card>

      <div className="ax-row ax-row-wrap">
        <Button
          onClick={() => {
            track('case_cta_clicked', { source_screen: 'SCR-CS-030', case_id: caseStudy.slug });
            track('cta_consultation_clicked', { source_screen: 'SCR-CS-030' });
            navigate('/lead');
          }}
        >
          Запросить похожее решение
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/cases/${caseStudy.slug}`)}>
          Назад к кейсу
        </Button>
      </div>
    </AppShell>
  );
}
