import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { PackageCompareTable } from '../../components/domain/PackageCompareTable';
import { track } from '../../shared/analytics/track';
import { useService } from './hooks/useService';

export default function PackagesComparePage() {
  const navigate = useNavigate();
  const { id = '' } = useParams();

  const serviceQuery = useService(id);

  const service = serviceQuery.data;
  const packages = service?.packages ?? [];

  const orderedPackages = useMemo(() => {
    const order = ['Стартовый', 'Стандартный', 'Максимальный'];
    return [...packages].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  }, [packages]);

  useEffect(() => {
    if (!id) return;
    track('package_compare_opened', { service_id: id, screen_id: 'SCR-SVC-030' });
  }, [id]);

  return (
    <AppShell title="Пакеты" showBack showBottomNav>
      <Card>
        <div className="ax-col" style={{ gap: 8 }}>
          <h1 className="h2">{service?.title ?? 'Сравнение пакетов'}</h1>
          <p className="p muted">Сравните состав, диапазон стоимости и оптимальный формат запуска.</p>
        </div>
      </Card>

      {serviceQuery.isLoading ? (
        <div className="ax-col" style={{ gap: 10 }}>
          <Skeleton height={120} />
          <Skeleton height={120} />
        </div>
      ) : null}

      {!serviceQuery.isLoading && serviceQuery.isError ? (
        <ErrorState
          title="Не удалось загрузить пакеты"
          description="Сервис временно недоступен."
          onRetry={() => {
            void serviceQuery.refetch();
          }}
        />
      ) : null}

      {!serviceQuery.isLoading && !serviceQuery.isError && orderedPackages.length === 0 ? (
        <EmptyState
          title="Пакеты пока не опубликованы"
          description="Запросите индивидуальный расчет на консультации."
          actionLabel="Оставить заявку"
          onAction={() => navigate('/lead')}
        />
      ) : null}

      {!serviceQuery.isLoading && !serviceQuery.isError && orderedPackages.length > 0 ? (
        <PackageCompareTable items={orderedPackages} />
      ) : null}

      <div className="ax-row ax-row-wrap">
        <Button
          onClick={() => {
            track('cta_consultation_clicked', { source_screen: 'SCR-SVC-030' });
            navigate('/lead', {
              state: {
                prefill: {
                  serviceInterest: service ? [service.slug] : [],
                  source: 'packages_compare',
                },
              },
            });
          }}
        >
          Оставить заявку
        </Button>
        {service ? (
          <Button variant="secondary" onClick={() => navigate(`/services/${service.slug}/calculator`)}>
            Рассчитать ROI
          </Button>
        ) : null}
      </div>
    </AppShell>
  );
}
