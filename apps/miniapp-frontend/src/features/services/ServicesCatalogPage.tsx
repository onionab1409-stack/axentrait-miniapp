import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { ServiceCard } from '../../components/domain/ServiceCard';
import { Chip } from '../../components/ui/Chip';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchCategories } from '../../shared/api/contentApi';
import { track } from '../../shared/analytics/track';
import { useServices } from './hooks/useServices';

const CATEGORY_SHORT_LABELS: Record<string, string> = {
  'Кибербезопасность и защита персональных данных': 'Безопасность',
  'Кибербезопасность и защита ПДн': 'Безопасность',
  'Оптимизация бизнес-процессов': 'Процессы',
  'Автоматизация бизнес-процессов': 'Автоматизация',
  'AI в процессах и MLOps': 'AI и MLOps',
  'Облачная инфраструктура и DevOps': 'Облако',
  'IoT и цифровые двойники': 'IoT',
  'Платформа данных и BI': 'Данные и BI',
};

function getShortLabel(title: string): string {
  return CATEGORY_SHORT_LABELS[title] ?? title;
}

export default function ServicesCatalogPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const servicesQuery = useServices();

  const categoriesQuery = useQuery({
    queryKey: ['content', 'categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    track('service_catalog_viewed', { screen_id: 'SCR-SVC-001' });
  }, []);

  const categories = categoriesQuery.data ?? [];
  const services = servicesQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((service) => {
      const categoryMatch = activeCategory === 'all' || service.categoryId === activeCategory;
      if (!categoryMatch) return false;
      if (!q) return true;

      return (
        service.title.toLowerCase().includes(q) ||
        service.shortPitch.toLowerCase().includes(q) ||
        service.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, search, services]);

  const hasError = servicesQuery.isError || categoriesQuery.isError;

  return (
    <AppShell title="Услуги" showBottomNav>
      <div className="ax-col ax-sticky-top" style={{ gap: 10 }}>
        <label
          className="ax-row"
          style={{
            border: '1px solid var(--app-border)',
            background: 'color-mix(in srgb, var(--app-card) 94%, transparent)',
            borderRadius: 12,
            minHeight: 44,
            paddingInline: 12,
          }}
        >
          <Search size={16} color="var(--app-text-muted)" />
          <input
            className="ax-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск услуги по задаче или тегу"
            style={{ border: 0, background: 'transparent', minHeight: 42, paddingLeft: 0 }}
          />
        </label>

        <div className="ax-row" style={{ gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          <Chip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
            Все
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category.id}
              active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              {getShortLabel(category.title)}
            </Chip>
          ))}
        </div>
      </div>

      {servicesQuery.isLoading ? (
        <div className="ax-col" style={{ gap: 12 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`svc_skeleton_${index}`} height={160} />
          ))}
        </div>
      ) : null}

      {!servicesQuery.isLoading && hasError ? (
        <ErrorState
          title="Каталог временно недоступен"
          description="Не удалось загрузить услуги из API. Проверьте сеть и повторите."
          onRetry={() => {
            void servicesQuery.refetch();
            void categoriesQuery.refetch();
          }}
        />
      ) : null}

      {!servicesQuery.isLoading && !hasError && filtered.length === 0 ? (
        <EmptyState
          title="Подходящие услуги не найдены"
          description="Не нашли точного совпадения. Попробуйте очистить фильтр или перейти к всем направлениям."
          actionLabel="Сбросить фильтры"
          onAction={() => {
            setSearch('');
            setActiveCategory('all');
          }}
        />
      ) : null}

      {!servicesQuery.isLoading && !hasError && filtered.length > 0 ? (
        <div className="ax-col" style={{ gap: 12 }}>
          {filtered.map((service) => {
            const category = categories.find((item) => item.id === service.categoryId);
            return (
              <ServiceCard
                key={service.id}
                service={service}
                category={category?.title}
                onClick={() => {
                  track('service_opened', { service_id: service.slug });
                  navigate(`/services/${service.slug}`);
                }}
              />
            );
          })}
        </div>
      ) : null}
    </AppShell>
  );
}
