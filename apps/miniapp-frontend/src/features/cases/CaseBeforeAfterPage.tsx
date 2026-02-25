import { useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { MjImage } from '../../components/ui/MjImage';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useCase } from './hooks/useCase';

export default function CaseBeforeAfterPage() {
  const { id = '' } = useParams();
  const caseQuery = useCase(id);

  if (caseQuery.isLoading) {
    return (
      <AppShell title="Before / After" showBack showBottomNav>
        <Skeleton height={120} />
        <Skeleton height={220} />
      </AppShell>
    );
  }

  const caseStudy = caseQuery.data;

  if (caseQuery.isError || !caseStudy) {
    return (
      <AppShell title="Before / After" showBack showBottomNav>
        <ErrorState
          title="Кейс недоступен"
          description="Не удалось загрузить данные кейса."
          onRetry={() => {
            void caseQuery.refetch();
          }}
        />
      </AppShell>
    );
  }

  const beforeAfter = caseStudy.assets.beforeAfter;

  return (
    <AppShell title="Before / After" showBack showBottomNav>
      <Card>
        <div className="ax-col" style={{ gap: 10 }}>
          <h1 className="h2" style={{ fontSize: 22 }}>
            {caseStudy.title}
          </h1>
          <p className="p muted">{caseStudy.metrics.headline ?? 'Сравнение до и после внедрения'}</p>
        </div>
      </Card>

      {!beforeAfter ? (
        <EmptyState
          title="Данные before/after отсутствуют"
          description="Для этого кейса визуальное сравнение пока не опубликовано."
        />
      ) : (
        <div className="ax-grid ax-grid-2">
          <Card>
            <div className="ax-col" style={{ gap: 8 }}>
              <strong>До</strong>
              <MjImage
                src={beforeAfter.before}
                fallbackGradient="linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.06))"
                alt="Before state"
                style={{ width: '100%', height: 170, borderRadius: 12, objectFit: 'cover' }}
              />
            </div>
          </Card>
          <Card>
            <div className="ax-col" style={{ gap: 8 }}>
              <strong>После</strong>
              <MjImage
                src={beforeAfter.after}
                fallbackGradient="linear-gradient(135deg, rgba(34,197,94,0.16), rgba(34,197,94,0.06))"
                alt="After state"
                style={{ width: '100%', height: 170, borderRadius: 12, objectFit: 'cover' }}
              />
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
