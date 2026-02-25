import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const prisma = new PrismaClient();

type ServicesSeed = {
  categories: Array<{ slug: string; name?: string; title?: string; description?: string; sortOrder?: number }>;
  services: Array<{
    slug: string;
    categorySlug: string;
    name?: string;
    title?: string;
    description?: string;
    shortPitch?: string;
    longDescription?: string;
    deliverables?: string[];
    prerequisites?: string[];
    typicalTimeline?: string;
    tags?: string[];
  }>;
  packages: Array<{
    slug?: string;
    serviceSlug: string;
    name: string;
    description?: string;
    includes?: string[];
    excludes?: string[];
    idealFor?: string;
    sortOrder?: number;
  }>;
};

type CasesSeed = {
  cases: Array<{
    slug: string;
    title: string;
    industry?: string;
    problem?: string;
    approach?: string;
    solution?: string;
    timeline?: string;
    stack?: string[];
    metrics?: unknown;
    tags?: string[];
    assets?: unknown;
    relatedServiceSlugs?: string[];
  }>;
};

type OnboardingSeed = Record<string, unknown>;
type AiPromptsSeed = {
  prompts: Array<{
    key: string;
    description?: string;
    version?: number;
    isActive?: boolean;
    content: string;
  }>;
  scenarioMeta?: unknown;
};

const SERVICE_TIMELINES: Record<string, string> = {
  'cybersecurity-audit-protection': '8-12 недель',
  'process-optimization-audit-kpi': '6-10 недель',
  'automation-rpa-crm-erp': '4-8 недель',
  'ai-integration-use-cases-mlops': '6-10 недель',
  'cloud-devops-ci-cd-platform': '8-14 недель',
  'iot-digital-twins-pilot-platform': '10-16 недель',
  'data-analytics-platform-bi': '8-16 недель',
};

const PACKAGE_PRICE_MATRIX: Record<string, Record<string, { min: number; max: number }>> = {
  'cybersecurity-audit-protection': {
    'Стартовый': { min: 250000, max: 450000 },
    'Стандартный': { min: 650000, max: 1200000 },
    'Максимальный': { min: 1600000, max: 3500000 },
  },
  'process-optimization-audit-kpi': {
    'Стартовый': { min: 180000, max: 350000 },
    'Стандартный': { min: 500000, max: 900000 },
    'Максимальный': { min: 1200000, max: 2500000 },
  },
  'automation-rpa-crm-erp': {
    'Стартовый': { min: 250000, max: 500000 },
    'Стандартный': { min: 600000, max: 1400000 },
    'Максимальный': { min: 1500000, max: 4000000 },
  },
  'ai-integration-use-cases-mlops': {
    'Стартовый': { min: 450000, max: 850000 },
    'Стандартный': { min: 900000, max: 1800000 },
    'Максимальный': { min: 1800000, max: 4500000 },
  },
  'cloud-devops-ci-cd-platform': {
    'Стартовый': { min: 450000, max: 900000 },
    'Стандартный': { min: 900000, max: 1800000 },
    'Максимальный': { min: 1800000, max: 4500000 },
  },
  'iot-digital-twins-pilot-platform': {
    'Стартовый': { min: 600000, max: 900000 },
    'Стандартный': { min: 1300000, max: 2500000 },
    'Максимальный': { min: 2800000, max: 5500000 },
  },
  'data-analytics-platform-bi': {
    'Стартовый': { min: 500000, max: 900000 },
    'Стандартный': { min: 1200000, max: 2800000 },
    'Максимальный': { min: 2800000, max: 5500000 },
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  'cybersecurity-audit-protection': 'Shield',
  'process-optimization-audit-kpi': 'Workflow',
  'automation-rpa-crm-erp': 'Cog',
  'ai-integration-use-cases-mlops': 'Bot',
  'cloud-devops-ci-cd-platform': 'Cloud',
  'iot-digital-twins-pilot-platform': 'Cpu',
  'data-analytics-platform-bi': 'BarChart3',
};

function readJson<T>(filename: string): T {
  const file = join(__dirname, 'seed-data', filename);
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}

async function resetContentTables() {
  await prisma.serviceCaseLink.deleteMany();
  await prisma.package.deleteMany();
  await prisma.caseStudy.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
}

async function seedContent(services: ServicesSeed, cases: CasesSeed) {
  await resetContentTables();

  for (const category of services.categories) {
    await prisma.serviceCategory.create({
      data: {
        slug: category.slug,
        title: category.title ?? category.name ?? category.slug,
        description: category.description ?? null,
        icon: CATEGORY_ICONS[category.slug] ?? 'Layers',
        sortOrder: category.sortOrder ?? 0,
        isActive: true,
      },
    });
  }

  for (const serviceRow of services.services) {
    const category = await prisma.serviceCategory.findUnique({
      where: { slug: serviceRow.categorySlug },
    });
    if (!category) continue;

    const serviceSlug = serviceRow.slug;
    const starterPrice = PACKAGE_PRICE_MATRIX[serviceSlug]?.['Стартовый']?.min;

    await prisma.service.create({
      data: {
        slug: serviceSlug,
        categoryId: category.id,
        title: serviceRow.title ?? serviceRow.name ?? serviceSlug,
        shortPitch: serviceRow.shortPitch ?? serviceRow.description ?? null,
        longDescription: serviceRow.longDescription ?? serviceRow.description ?? null,
        deliverables: serviceRow.deliverables ?? [],
        prerequisites: serviceRow.prerequisites ?? [],
        typicalTimeline: serviceRow.typicalTimeline ?? SERVICE_TIMELINES[serviceSlug] ?? null,
        startingPrice: starterPrice ?? null,
        tags: serviceRow.tags ?? [],
        isActive: true,
      },
    });
  }

  const serviceBySlug = new Map((await prisma.service.findMany()).map((service) => [service.slug, service]));

  for (const pack of services.packages) {
    const service = serviceBySlug.get(pack.serviceSlug);
    if (!service) continue;

    const price = PACKAGE_PRICE_MATRIX[pack.serviceSlug]?.[pack.name];

    await prisma.package.create({
      data: {
        serviceId: service.id,
        name: pack.name,
        priceMin: price?.min ?? null,
        priceMax: price?.max ?? null,
        includes: pack.includes ?? [],
        excludes: pack.excludes ?? [],
        idealFor: pack.idealFor ?? pack.description ?? null,
        sortOrder: pack.sortOrder ?? 0,
      },
    });
  }

  for (const row of cases.cases) {
    await prisma.caseStudy.create({
      data: {
        slug: row.slug,
        title: row.title,
        industry: row.industry ?? null,
        problem: row.problem ?? null,
        approach: row.approach ?? null,
        solution: row.solution ?? null,
        timeline: row.timeline ?? null,
        stack: row.stack ?? [],
        metrics: (row.metrics as object | undefined) ?? undefined,
        assets: (row.assets as object | undefined) ?? undefined,
        tags: row.tags ?? [],
        isActive: true,
      },
    });
  }

  const caseBySlug = new Map((await prisma.caseStudy.findMany()).map((row) => [row.slug, row]));
  for (const row of cases.cases) {
    const caseStudy = caseBySlug.get(row.slug);
    if (!caseStudy) continue;
    for (const serviceSlug of row.relatedServiceSlugs ?? []) {
      const service = serviceBySlug.get(serviceSlug);
      if (!service) continue;
      await prisma.serviceCaseLink.create({
        data: {
          serviceId: service.id,
          caseId: caseStudy.id,
        },
      });
    }
  }
}

async function seedPrompts(aiPrompts: AiPromptsSeed) {
  for (const prompt of aiPrompts.prompts) {
    const template = await prisma.promptTemplate.upsert({
      where: { key: prompt.key },
      update: {
        description: prompt.description ?? null,
      },
      create: {
        key: prompt.key,
        description: prompt.description ?? null,
      },
    });

    await prisma.promptVersion.upsert({
      where: {
        templateId_version: {
          templateId: template.id,
          version: prompt.version ?? 1,
        },
      },
      update: {
        content: prompt.content,
        isActive: prompt.isActive ?? true,
      },
      create: {
        templateId: template.id,
        version: prompt.version ?? 1,
        content: prompt.content,
        isActive: prompt.isActive ?? true,
      },
    });
  }
}

async function seedOnboarding(onboarding: OnboardingSeed) {
  await prisma.onboardingConfig.upsert({
    where: { key: 'default' },
    update: { content: onboarding as object },
    create: { key: 'default', content: onboarding as object },
  });
}

async function main() {
  const services = readJson<ServicesSeed>('services.json');
  const cases = readJson<CasesSeed>('cases.json');
  const onboarding = readJson<OnboardingSeed>('onboarding.json');
  const aiPrompts = readJson<AiPromptsSeed>('ai-prompts.json');

  await seedContent(services, cases);
  await seedPrompts(aiPrompts);
  await seedOnboarding(onboarding);

  const [serviceCount, packageCount, caseCount, promptCount] = await Promise.all([
    prisma.service.count(),
    prisma.package.count(),
    prisma.caseStudy.count(),
    prisma.promptTemplate.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        ok: true,
        services: serviceCount,
        packages: packageCount,
        cases: caseCount,
        promptTemplates: promptCount,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
