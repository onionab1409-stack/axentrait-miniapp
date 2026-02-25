import onboardingRaw from './onboarding.json';
import casesRaw from './cases.json';
import servicesRaw from './services.json';
import aiPromptsRaw from './ai-prompts.json';
import type { CaseStudy, Package, Service, ServiceCategory } from '../types/content';
import type { AiScenarioMeta } from '../types/ai';
import type { OnboardingAnswers, OnboardingRule } from '../types/onboarding';

function formatRub(value?: number) {
  if (!value) return undefined;
  return `${Math.round(value / 1000)}k ₽`;
}

function formatRange(min?: number, max?: number) {
  if (!min || !max) return 'По запросу';
  return `${Math.round(min / 1000)}k–${(max / 1_000_000).toFixed(max >= 1_000_000 ? 1 : 0).replace('.0', '')}m ₽`;
}

type RawCategory = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  sortOrder: number;
};

type RawService = {
  slug: string;
  categorySlug: string;
  title: string;
  shortPitch: string;
  longDescription: string;
  deliverables: string[];
  prerequisites: string[];
  typicalTimeline: string;
  startingPrice?: number;
  tags: string[];
};

type RawPackage = {
  serviceSlug: string;
  name: string;
  priceMin?: number;
  priceMax?: number;
  includes: string[];
  excludes: string[];
  idealFor: string;
};

type RawCase = {
  slug: string;
  title: string;
  industry: string;
  problem: string;
  approach: string;
  solution: string;
  stack: string[];
  timeline: string;
  metrics?: {
    headline?: string;
    items?: Array<{ label: string; value: string; description: string }>;
    testimonial?: { quote: string; author: string };
  };
  assets?: {
    beforeAfter?: { before: string; after: string };
  };
  tags: string[];
  relatedServiceSlugs: string[];
};

const rawCategories = (servicesRaw.categories ?? []) as RawCategory[];
const rawServices = (servicesRaw.services ?? []) as RawService[];
const rawPackages = (servicesRaw.packages ?? []) as RawPackage[];
const rawCases = (casesRaw.cases ?? []) as RawCase[];

export const seedCategories: ServiceCategory[] = rawCategories.map((c) => ({
  id: c.slug,
  slug: c.slug,
  title: c.title,
  description: c.description,
  icon: c.icon,
  order: c.sortOrder,
}));

export const seedServices: Service[] = rawServices.map((s) => ({
  id: s.slug,
  slug: s.slug,
  categoryId: s.categorySlug,
  title: s.title,
  shortPitch: s.shortPitch,
  longDescription: s.longDescription,
  deliverables: s.deliverables,
  prerequisites: s.prerequisites,
  typicalTimeline: s.typicalTimeline,
  startingPrice: formatRub(s.startingPrice),
  tags: s.tags,
  relatedCases: rawCases.filter((c) => c.relatedServiceSlugs.includes(s.slug)).map((c) => c.slug),
}));

export const seedPackages: Package[] = rawPackages.map((p, index) => ({
  id: `${p.serviceSlug}:${p.name}:${index}`,
  serviceId: p.serviceSlug,
  name: p.name,
  priceRange: formatRange(p.priceMin, p.priceMax),
  includes: p.includes,
  excludes: p.excludes,
  idealFor: p.idealFor,
}));

export const seedCases: CaseStudy[] = rawCases.map((c) => ({
  id: c.slug,
  slug: c.slug,
  title: c.title,
  clientIndustry: c.industry,
  problem: c.problem,
  approach: c.approach,
  solution: c.solution,
  stack: c.stack,
  timeline: c.timeline,
  teamSize: 6,
  metrics: {
    headline: c.metrics?.headline,
    items: c.metrics?.items,
  },
  assets: {
    images: [caseImageBySlug(c.slug)],
    quotes: c.metrics?.testimonial?.quote ? [c.metrics.testimonial.quote] : [],
    beforeAfter: c.assets?.beforeAfter,
  },
  testimonial: c.metrics?.testimonial,
  tags: c.tags,
  relatedServiceSlugs: c.relatedServiceSlugs,
}));

export const onboardingContent = onboardingRaw;
export const onboardingQuestions = onboardingRaw.questions;
export const onboardingRules = onboardingRaw.routing.rules as OnboardingRule[];

const scenarioMeta = (aiPromptsRaw.scenarioMeta ?? []) as AiScenarioMeta[];

export const SCENARIO_ALIAS_MAP: Record<string, string> = {
  faq: 'ai.scenario.faq',
  roi: 'ai.scenario.roi',
  audit: 'ai.scenario.audit',
  'use-cases': 'ai.scenario.usecase_finder',
};

export const scenarioMetaByKey = new Map<string, AiScenarioMeta>(scenarioMeta.map((s) => [s.key, s]));

export function lookupScenarioMeta(aliasOrKey: string | undefined): AiScenarioMeta | null {
  if (!aliasOrKey) return scenarioMeta[0] ?? null;
  const mapped = SCENARIO_ALIAS_MAP[aliasOrKey] ?? aliasOrKey;
  return scenarioMetaByKey.get(mapped) ?? scenarioMeta[0] ?? null;
}

const SEGMENT_FIELD_MAP: Record<string, string> = {
  role: 'role',
  industry: 'industry',
  companySize: 'company_size',
  painArea: 'pain',
  goal: 'goal',
};

export function matchRouting(answers: OnboardingAnswers, segments: string[] = []) {
  const serviceSet = new Set<string>();
  const caseSet = new Set<string>();
  const scenarioSet = new Set<string>();

  for (const rule of onboardingRules) {
    const field = rule.match.anyOf.field;
    const values = rule.match.anyOf.values;
    const answer = answers[field];
    const segmentPrefix = SEGMENT_FIELD_MAP[field] ?? field;

    const matchesAnswer = Boolean(answer && values.includes(answer));
    const matchesSegment = values.some((value) => segments.includes(`${segmentPrefix}:${value}`));

    if (!matchesAnswer && !matchesSegment) continue;

    rule.recommend.serviceSlugs.forEach((slug) => serviceSet.add(slug));
    rule.recommend.caseSlugs.forEach((slug) => caseSet.add(slug));
    scenarioSet.add(rule.recommend.aiScenario);
  }

  const firstScenario = Array.from(scenarioSet)[0] ?? 'ai.scenario.faq';
  const fallbackServiceSlugs = seedServices.slice(0, 2).map((item) => item.slug);
  const fallbackCaseSlugs = seedCases.slice(0, 1).map((item) => item.slug);

  const serviceSlugs = Array.from(serviceSet);
  const caseSlugs = Array.from(caseSet);

  return {
    serviceSlugs: serviceSlugs.length > 0 ? serviceSlugs : fallbackServiceSlugs,
    caseSlugs: caseSlugs.length > 0 ? caseSlugs : fallbackCaseSlugs,
    aiScenarioKey: firstScenario,
    aiScenario: lookupScenarioMeta(firstScenario),
  };
}

export function serviceImageBySlug(slug: string): string {
  const map: Record<string, string> = {
    'cybersecurity-audit-protection': '/images/services/svc-security.webp',
    'process-optimization-audit-kpi': '/images/services/svc-process.webp',
    'automation-rpa-crm-erp': '/images/services/svc-automation.webp',
    'ai-integration-use-cases-mlops': '/images/services/svc-ai.webp',
    'cloud-devops-ci-cd-platform': '/images/services/svc-devops.webp',
    'iot-digital-twins-pilot-platform': '/images/services/svc-iot.webp',
    'data-analytics-platform-bi': '/images/services/svc-data.webp',
  };
  return map[slug] ?? '/images/services/svc-ai.webp';
}

export function caseImageBySlug(slug: string): string {
  const map: Record<string, string> = {
    'fintech-security-regulator-remediation': '/images/cases/case-fintech.webp',
    'retail-returns-cycle-reduction': '/images/cases/case-retail.webp',
    'logistics-crm-erp-wms-automation': '/images/cases/case-logistics.webp',
    'ecommerce-single-source-of-truth': '/images/cases/case-ecommerce.webp',
    'medtech-support-ai-triage': '/images/cases/case-medtech.webp',
    'saas-devops-weekly-zero-downtime-releases': '/images/cases/case-saas.webp',
    'manufacturing-iot-downtime-reduction': '/images/cases/case-manufacturing.webp',
  };
  return map[slug] ?? '/images/cases/case-fintech.webp';
}

export { scenarioMeta };
