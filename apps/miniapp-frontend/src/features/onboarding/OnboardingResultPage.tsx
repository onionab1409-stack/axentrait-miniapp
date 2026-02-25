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
      .slice(0, 2);
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
    <AppShell title="Результат" showBack>
      <Card>
        <div className="ax-col" style={{ gap: 10 }}>
          <h1 className="h2">{resultConfig.headline}</h1>
          <p className="p muted">{resultConfig.description}</p>
        </div>
      </Card>

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
          <Card variant="elevated">
            <div className="ax-col" style={{ gap: 10 }}>
              <h2 className="h2" style={{ fontSize: 20, margin: 0 }}>
                {servicesTitle}
              </h2>
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
                    category={categoriesMap.get(service.categoryId)}
                    onClick={() => {
                      track('service_opened', { service_id: service.slug, source_screen: 'SCR-ONB-030' });
                      navigate(`/services/${service.slug}`);
                    }}
                  />
                ))
              )}
            </div>
          </Card>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate('/ai')}
          >
            Задайте вопрос искусственному интеллекту
          </Button>

          <Card variant="glass">
            <div className="ax-col" style={{ gap: 10 }}>
              <h2 className="h2" style={{ fontSize: 20, margin: 0 }}>
                {caseTitle}
              </h2>
              {recommendedCase ? (
                <CaseCard
                  caseStudy={recommendedCase}
                  onClick={() => {
                    track('case_opened', { case_id: recommendedCase.slug, source_screen: 'SCR-ONB-030' });
                    navigate(`/cases/${recommendedCase.slug}`);
                  }}
                />
              ) : (
                <EmptyState
                  title={caseTitle}
                  description={caseEmpty}
                  actionLabel="Открыть кейсы"
                  onAction={() => navigate('/cases')}
                />
              )}
            </div>
          </Card>

          {scenario ? (
            <Card variant="interactive">
              <div className="ax-col" style={{ gap: 8 }}>
                <h2 className="h2" style={{ fontSize: 20, margin: 0 }}>
                  {aiTitle}
                </h2>
                <p className="p" style={{ margin: 0 }}>
                  {scenario.icon} {scenario.displayName}
                </p>
                <p className="p muted" style={{ margin: 0 }}>
                  {aiDescription}
                </p>
                <div className="ax-row ax-row-wrap">
                  <Button
                    onClick={() => {
                      track('ai_scenario_selected', { scenario_id: scenario.key, source_screen: 'SCR-ONB-030' });
                      navigate(`/ai/chat/new?scenario=${encodeURIComponent(scenario.key)}`);
                    }}
                  >
                    Запустить демо
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}

          <Card variant="interactive">
            <div className="ax-col" style={{ gap: 8 }}>
              <h2 className="h2" style={{ fontSize: 20, margin: 0 }}>
                {leadTitle}
              </h2>
              <p className="p muted" style={{ margin: 0 }}>
                {leadDescription}
              </p>
              <Button
                onClick={() => {
                  track('cta_consultation_clicked', { source_screen: 'SCR-ONB-030' });
                  navigate('/lead');
                }}
              >
                {leadButton}
              </Button>
            </div>
          </Card>

          <Button variant="ghost" onClick={() => navigate('/services')}>
            {resultConfig.skipText}
          </Button>
        </>
      ) : null}
    </AppShell>
  );
}
