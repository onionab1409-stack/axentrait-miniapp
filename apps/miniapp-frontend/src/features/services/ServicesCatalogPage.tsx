import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Chip } from '../../components/ui/Chip';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchCategories } from '../../shared/api/contentApi';
import { track } from '../../shared/analytics/track';
import { getBackground } from '../../config/imageMap';
import { useServices } from './hooks/useServices';

/* slug → imageMap id (зеркало ServiceCard.SERVICE_IMAGE_MAP) */
const SERVICE_IMAGE_MAP: Record<string, string> = {
  'cybersecurity-audit-protection': 'svc-security',
  'process-optimization-audit-kpi': 'svc-process',
  'automation-rpa-crm-erp': 'svc-automation',
  'ai-integration-use-cases-mlops': 'svc-ai',
  'cloud-devops-ci-cd-platform': 'svc-devops',
  'iot-digital-twins-pilot-platform': 'svc-iot',
  'data-analytics-platform-bi': 'svc-data',
};

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
      {/* H20 FIX: убран дублирующий H2 "Услуги" — заголовок только в TopBar */}

      <div className="ax-col ax-sticky-top" style={{ gap: 10 }}>
        {/* H21 FIX: glass search bar */}
        <label
          className="ax-row"
          style={{
            border: '1px solid rgba(126,232,242,0.15)',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 14,
            minHeight: 44,
            paddingInline: 12,
          }}
        >
          <Search size={16} color="rgba(126,232,242,0.4)" />
          <input
            className="glass-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск услуги по задаче или тегу"
            style={{
              border: 0,
              background: 'transparent',
              minHeight: 42,
              paddingLeft: 0,
              width: '100%',
              color: '#F0F6FC',
              fontSize: 14,
              fontWeight: 300,
              outline: 'none',
            }}
          />
        </label>

        <div className="ax-row" style={{ gap: 8, overflowX: 'auto', marginBottom: 20 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`svc_skeleton_${index}`} height={200} />
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

      {/* H18+H19 FIX: mj-card стиль — bg image + только title cyan/300 */}
      {!servicesQuery.isLoading && !hasError && filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((service) => {
            const imageId = SERVICE_IMAGE_MAP[service.slug] ?? 'svc-process';
            const bg = getBackground(imageId);

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  track('service_opened', { service_id: service.slug });
                  navigate(`/services/${service.slug}`);
                }}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 18,
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 16,
                  border: '1px solid rgba(255,255,255,0.06)',
                  backgroundImage: bg,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {/* Scrim gradient для читаемости текста */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 40%, rgba(5,10,15,0.8) 100%)',
                  borderRadius: 18,
                  pointerEvents: 'none',
                }} />

                {/* Только название — без category, description, badges, price */}
                <span style={{
                  fontSize: 16,
                  fontWeight: 300,
                  lineHeight: 1.25,
                  letterSpacing: '0.5px',
                  color: '#7EE8F2',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {service.title}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </AppShell>
  );
}
