import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { CaseCard } from '../../components/domain/CaseCard';
import { Chip } from '../../components/ui/Chip';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { track } from '../../shared/analytics/track';
import { useCases } from './hooks/useCases';

export default function CasesGalleryPage() {
  const navigate = useNavigate();
  const [activeIndustry, setActiveIndustry] = useState('all');

  const casesQuery = useCases();

  useEffect(() => {
    track('cases_gallery_viewed', { screen_id: 'SCR-CS-001' });
  }, []);

  const industries = useMemo(() => {
    const set = new Set<string>();
    for (const caseStudy of casesQuery.data ?? []) {
      set.add(caseStudy.clientIndustry);
    }
    return Array.from(set);
  }, [casesQuery.data]);

  const filteredCases = useMemo(() => {
    if (activeIndustry === 'all') return casesQuery.data ?? [];
    return (casesQuery.data ?? []).filter((caseStudy) => caseStudy.clientIndustry === activeIndustry);
  }, [activeIndustry, casesQuery.data]);

  return (
    <AppShell title="Кейсы" showBottomNav>
      <div className="ax-row" style={{ gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        <Chip active={activeIndustry === 'all'} onClick={() => setActiveIndustry('all')}>
          Все
        </Chip>
        {industries.map((industry) => (
          <Chip key={industry} active={activeIndustry === industry} onClick={() => setActiveIndustry(industry)}>
            {industry}
          </Chip>
        ))}
      </div>

      {casesQuery.isLoading ? (
        <div className="ax-col" style={{ gap: 12 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`case_skeleton_${index}`} height={208} />
          ))}
        </div>
      ) : null}

      {!casesQuery.isLoading && casesQuery.isError ? (
        <ErrorState
          title="Кейсы временно недоступны"
          description="Не удалось загрузить галерею кейсов с сервера."
          onRetry={() => {
            void casesQuery.refetch();
          }}
        />
      ) : null}

      {!casesQuery.isLoading && !casesQuery.isError && filteredCases.length === 0 ? (
        <EmptyState
          title="Кейсы по фильтру не найдены"
          description="Кейсов по этому фильтру пока нет. Выберите другую отрасль."
          actionLabel="Сбросить фильтр"
          onAction={() => setActiveIndustry('all')}
        />
      ) : null}

      {!casesQuery.isLoading && !casesQuery.isError && filteredCases.length > 0 ? (
        <div className="ax-col" style={{ gap: 12 }}>
          {filteredCases.map((caseStudy) => (
            <CaseCard
              key={caseStudy.id}
              caseStudy={caseStudy}
              onClick={() => {
                track('case_opened', { case_id: caseStudy.slug });
                navigate(`/cases/${caseStudy.slug}`);
              }}
            />
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}
