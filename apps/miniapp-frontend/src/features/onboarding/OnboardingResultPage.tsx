import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BottomNav } from '../../components/layout/BottomNav';
import { ToastHost } from '../../components/ui/ToastHost';
import { Button } from '../../components/ui/Button';
import { ServiceCard } from '../../components/domain/ServiceCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { fetchCategories } from '../../shared/api/contentApi';
import { matchRouting, onboardingContent } from '../../shared/data';
import { track } from '../../shared/analytics/track';
import { useMe } from '../../shared/hooks/useMe';
import { useCases } from '../cases/hooks/useCases';
import { useServices } from '../services/hooks/useServices';
import { useOnboardingState } from './useOnboardingState';
import { useTgBackButton } from '../../shared/telegram/useTgBackButton';

export default function OnboardingResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { answers } = useOnboardingState();
  const resultConfig = onboardingContent.result;

  /* ── Telegram Back Button (заменяет AppShell showBack) ── */
  const goBack = useCallback(() => {
    if (location.key === 'default') navigate('/welcome');
    else navigate(-1);
  }, [location.key, navigate]);
  useTgBackButton(true, goBack);

  /* ── Data hooks (без изменений) ── */
  const meQuery = useMe();
  const servicesQuery = useServices();
  const casesQuery = useCases();
  const categoriesQuery = useQuery({
    queryKey: ['content', 'categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  const segments = meQuery.data?.profile?.segments ?? [];
  const recommendation = useMemo(() => matchRouting(answers, segments), [answers, segments]);

  const recommendedServices = useMemo(() => {
    const items = servicesQuery.data ?? [];
    const map = new Map(items.map((item) => [item.slug, item]));
    return recommendation.serviceSlugs
      .map((slug) => map.get(slug))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .slice(0, 3);
  }, [recommendation.serviceSlugs, servicesQuery.data]);

  /* case slug — для аналитики (секция убрана, но track сохраняем) */
  const recommendedCase = useMemo(() => {
    const items = casesQuery.data ?? [];
    const map = new Map(items.map((item) => [item.slug, item]));
    return recommendation.caseSlugs.map((slug) => map.get(slug)).find(Boolean) ?? null;
  }, [casesQuery.data, recommendation.caseSlugs]);

  const servicesEmpty =
    resultConfig.sections?.find((s) => s.type === 'recommended_services')?.emptyState ??
    'Не нашли точного совпадения — покажем все направления.';

  useEffect(() => {
    if (recommendedServices.length > 0 || recommendedCase) {
      track('personal_plan_viewed', {
        service_slugs: recommendedServices.map((item) => item.slug).join(','),
        case_slug: recommendedCase?.slug ?? '',
      });
    }
  }, [recommendedCase, recommendedServices]);

  const isLoading = meQuery.isLoading || servicesQuery.isLoading || casesQuery.isLoading;
  const isError = meQuery.isError || servicesQuery.isError || casesQuery.isError;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--app-bg, #050A0F)',
    }}>
      {/* Content area — H11 FIX: no AppShell/TopBar */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '64px 20px 80px',
        overflowY: 'auto',
      }}>
        <h2 style={{
          fontSize: 26,
          fontWeight: 300,
          color: '#7EE8F2',
          letterSpacing: '0.5px',
          textShadow: '0 0 30px rgba(34,211,238,0.2)',
          margin: 0,
          marginBottom: 6,
        }}>
          {resultConfig.headline}
        </h2>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <Skeleton height={160} />
            <Skeleton height={130} />
            <Skeleton height={120} />
          </div>
        ) : null}

        {!isLoading && isError ? (
          <ErrorState
            title="Рекомендации пока недоступны"
            description="Не удалось загрузить персональный план. Проверьте сеть и повторите."
            onRetry={() => {
              void meQuery.refetch();
              void servicesQuery.refetch();
              void casesQuery.refetch();
              void categoriesQuery.refetch();
            }}
          />
        ) : null}

        {!isLoading && !isError ? (
          <>
            {/* H12 FIX: cards flex:1 + space-evenly — заполняют экран */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-evenly',
              gap: 10,
            }}>
              {recommendedServices.length === 0 ? (
                <EmptyState
                  title="Подходящие услуги"
                  description={servicesEmpty}
                  actionLabel="Смотреть услуги"
                  onAction={() => navigate('/services')}
                />
              ) : (
                recommendedServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    variant="minimal"
                    onClick={() => {
                      track('service_opened', { service_id: service.slug, source_screen: 'SCR-ONB-030' });
                      navigate(`/services/${service.slug}`);
                    }}
                  />
                ))
              )}
            </div>

            <Button variant="glassPrimaryMuted" fullWidth onClick={() => navigate('/ai')}
              style={{ padding: '15px 0', fontSize: 14 }}>
              Задайте вопрос искусственному интеллекту
            </Button>
          </>
        ) : null}
      </div>

      <BottomNav />
      <ToastHost />
    </div>
  );
}
