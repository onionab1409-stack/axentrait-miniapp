import { apiFetch } from './apiClient';
import type { CaseStudy, Package, Service, ServiceCategory } from '../types/content';

type ApiList<T> = T[];

type BackendCategory = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
};

type BackendPackage = {
  id: string;
  serviceId: string;
  name: string;
  priceMin?: string | number | null;
  priceMax?: string | number | null;
  includes?: unknown;
  excludes?: unknown;
  idealFor?: string | null;
};

type BackendCase = {
  id: string;
  slug: string;
  title: string;
  industry?: string | null;
  problem?: string | null;
  approach?: string | null;
  solution?: string | null;
  stack?: unknown;
  timeline?: string | null;
  metrics?: unknown;
  assets?: unknown;
  tags?: unknown;
  relatedServiceSlugs?: string[];
};

type BackendService = {
  id: string;
  slug: string;
  categoryId?: string | null;
  title: string;
  shortPitch?: string | null;
  longDescription?: string | null;
  deliverables?: unknown;
  prerequisites?: unknown;
  typicalTimeline?: string | null;
  startingPrice?: string | number | null;
  tags?: unknown;
  packages?: BackendPackage[];
  relatedCases?: BackendCase[];
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function asMetricItems(value: unknown): Array<{ label: string; value: string; description: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      if (typeof row.label !== 'string' || typeof row.value !== 'string') return null;
      return {
        label: row.label,
        value: row.value,
        description: typeof row.description === 'string' ? row.description : '',
      };
    })
    .filter((item): item is { label: string; value: string; description: string } => Boolean(item));
}

function formatPrice(value: string | number | null | undefined): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return `${num.toLocaleString('ru-RU')} ₽`;
}

function formatPriceRange(min?: string | number | null, max?: string | number | null): string {
  const minNum = Number(min);
  const maxNum = Number(max);

  if (Number.isFinite(minNum) && Number.isFinite(maxNum) && minNum > 0 && maxNum > 0) {
    return `${minNum.toLocaleString('ru-RU')} - ${maxNum.toLocaleString('ru-RU')} ₽`;
  }

  if (Number.isFinite(minNum) && minNum > 0) {
    return `от ${minNum.toLocaleString('ru-RU')} ₽`;
  }

  return 'По запросу';
}

function mapPackage(pkg: BackendPackage): Package {
  return {
    id: pkg.id,
    serviceId: pkg.serviceId,
    name: pkg.name,
    priceRange: formatPriceRange(pkg.priceMin, pkg.priceMax),
    includes: asStringArray(pkg.includes),
    excludes: asStringArray(pkg.excludes),
    idealFor: pkg.idealFor ?? 'Подбирается после диагностики',
  };
}

function mapCase(item: BackendCase): CaseStudy {
  const metrics = (item.metrics && typeof item.metrics === 'object' ? item.metrics : {}) as Record<string, unknown>;
  const assets = (item.assets && typeof item.assets === 'object' ? item.assets : {}) as Record<string, unknown>;
  const beforeAfterRaw =
    assets.beforeAfter && typeof assets.beforeAfter === 'object'
      ? (assets.beforeAfter as Record<string, unknown>)
      : null;

  const testimonialRaw =
    metrics.testimonial && typeof metrics.testimonial === 'object'
      ? (metrics.testimonial as Record<string, unknown>)
      : null;

  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    clientIndustry: item.industry ?? 'Unknown',
    problem: item.problem ?? '',
    approach: item.approach ?? '',
    solution: item.solution ?? '',
    stack: asStringArray(item.stack),
    timeline: item.timeline ?? 'По согласованию',
    teamSize: 6,
    metrics: {
      headline: typeof metrics.headline === 'string' ? metrics.headline : undefined,
      items: asMetricItems(metrics.items),
    },
    assets: {
      images: [],
      video: typeof assets.video === 'string' ? assets.video : undefined,
      quotes: asStringArray(assets.quotes),
      beforeAfter:
        beforeAfterRaw && typeof beforeAfterRaw.before === 'string' && typeof beforeAfterRaw.after === 'string'
          ? {
              before: beforeAfterRaw.before,
              after: beforeAfterRaw.after,
            }
          : undefined,
    },
    testimonial:
      testimonialRaw && typeof testimonialRaw.quote === 'string' && typeof testimonialRaw.author === 'string'
        ? {
            quote: testimonialRaw.quote,
            author: testimonialRaw.author,
          }
        : undefined,
    tags: asStringArray(item.tags),
    relatedServiceSlugs: item.relatedServiceSlugs ?? [],
  };
}

function mapService(item: BackendService): Service {
  return {
    id: item.id,
    slug: item.slug,
    categoryId: item.categoryId ?? 'unknown',
    title: item.title,
    shortPitch: item.shortPitch ?? '',
    longDescription: item.longDescription ?? '',
    deliverables: asStringArray(item.deliverables),
    prerequisites: asStringArray(item.prerequisites),
    typicalTimeline: item.typicalTimeline ?? '8-12 недель',
    startingPrice: formatPrice(item.startingPrice),
    tags: asStringArray(item.tags),
    relatedCases: (item.relatedCases ?? []).map((caseItem) => caseItem.slug),
    packages: item.packages?.map(mapPackage),
    relatedCaseStudies: item.relatedCases?.map(mapCase),
  };
}

export async function fetchCategories(): Promise<ServiceCategory[]> {
  let categories: ApiList<BackendCategory>;
  try {
    categories = await apiFetch<ApiList<BackendCategory>>('/content/categories');
  } catch {
    categories = await apiFetch<ApiList<BackendCategory>>('/content/service-categories');
  }

  return categories.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description ?? '',
    icon: item.icon ?? 'Layers',
    order: item.sortOrder ?? 0,
  }));
}

export async function fetchServices(): Promise<Service[]> {
  const services = await apiFetch<ApiList<BackendService>>('/content/services');
  return services.map(mapService);
}

export async function fetchService(slugOrId: string): Promise<Service | null> {
  try {
    const service = await apiFetch<BackendService>(`/content/services/${encodeURIComponent(slugOrId)}`);
    return mapService(service);
  } catch {
    return null;
  }
}

export async function fetchPackages(serviceId?: string): Promise<Package[]> {
  const suffix = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : '';
  const packages = await apiFetch<ApiList<BackendPackage>>(`/content/packages${suffix}`);
  return packages.map(mapPackage);
}

export async function fetchCases(): Promise<CaseStudy[]> {
  const cases = await apiFetch<ApiList<BackendCase>>('/content/cases');
  return cases.map(mapCase);
}

export async function fetchCase(slugOrId: string): Promise<CaseStudy | null> {
  try {
    const caseItem = await apiFetch<BackendCase>(`/content/cases/${encodeURIComponent(slugOrId)}`);
    return mapCase(caseItem);
  } catch {
    return null;
  }
}
