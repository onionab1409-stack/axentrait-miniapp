import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CaseCard } from '../../components/domain/CaseCard';
import { ServiceCard } from '../../components/domain/ServiceCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { fetchCategories } from '../../shared/api/contentApi';
import { lookupScenarioMeta, matchRouting, onboardingContent } from '../../shared/data';
import { track } from '../../shared/analytics/track';
import { useMe } from '../../shared/hooks/useMe';
import { useCases } from '../cases/hooks/useCases';
import { useServices } from '../services/hooks/useServices';
import { useOnboardingState } from './useOnboardingState';

export default function OnboardingResultPage() {
  const navigate = useNavigate();
  const { answers } = useOnboardingState();
  const resultConfig = onboardingContent.result;

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

  const recommendedCase = useMemo(() => {
    const items = casesQuery.data ?? [];
    const map = new Map(items.map((item) => [item.slug, item]));
    return recommendation.caseSlugs.map((slug) => map.get(slug)).find(Boolean) ?? null;
  }, [casesQuery.data, recommendation.caseSlugs]);

  const scenario = recommendation.aiScenario ?? lookupScenarioMeta('faq');
  const categoriesMap = useMemo(
    () => new Map((categoriesQuery.data ?? []).map((item) => [item.id, item.title])),
    [categoriesQuery.data],
  );

  const servicesTitle =
    resultConfig.sections?.find((s) => s.type === 'recommended_services')?.title ?? 'Подходящие услуги';
  const servicesEmpty =
    resultConfig.sections?.find((s) => s.type === 'recommended_services')?.emptyState ??
    'Не нашли точного совпадения — покажем все направления.';
  const caseTitle = resultConfig.sections?.find((s) => s.type === 'relevant_case')?.title ?? 'Похожий кейс';
  const caseEmpty =
    resultConfig.sections?.find((s) => s.type === 'relevant_case')?.emptyState ??
    'Нет кейса один в один — покажем ближайший по логике.';
  const aiTitle = resultConfig.sections?.find((s) => s.type === 'ai_demo')?.title ?? 'Попробовать AI-демо';
  const aiDescription =
    resultConfig.sections?.find((s) => s.type === 'ai_demo')?.description ??
    'За 2 минуты оцените эффект и следующий шаг.';
  const leadTitle = resultConfig.sections?.find((s) => s.type === 'cta_lead')?.title ?? 'Обсудить внедрение';
  const leadDescription =
    resultConfig.sections?.find((s) => s.type === 'cta_lead')?.description ??
    'Уточним вводные и предложим план пилота, сроки и бюджет.';
  const leadButton = resultConfig.sections?.find((s) => s.type === 'cta_lead')?.buttonText ?? 'Оставить заявку';

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
    <AppShell title="Результат" showBack showBottomNav>
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
        <div className="ax-col" style={{ gap: 12 }}>
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
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            gap: 10,
          }}>
            {recommendedServices.length === 0 ? (
              <EmptyState
                title={servicesTitle}
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
    </AppShell>
  );
}
