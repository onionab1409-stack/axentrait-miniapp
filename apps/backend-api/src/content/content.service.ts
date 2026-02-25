import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ServicesQuery = {
  categoryId?: string;
  q?: string;
  tags?: string[];
};

type CasesQuery = {
  industry?: string;
  tag?: string;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async serviceCategories() {
    return this.prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async services(query: ServicesQuery) {
    const q = query.q?.trim();
    const categoryFilter = query.categoryId
      ? isUuid(query.categoryId)
        ? { is: { id: query.categoryId } }
        : { is: { slug: query.categoryId } }
      : undefined;

    return this.prisma.service.findMany({
      where: {
        isActive: true,
        category: categoryFilter,
        tags: query.tags && query.tags.length > 0 ? { hasSome: query.tags } : undefined,
        OR: q
          ? [
              { title: { contains: q, mode: 'insensitive' } },
              { shortPitch: { contains: q, mode: 'insensitive' } },
              { longDescription: { contains: q, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: {
        category: true,
        packages: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { title: 'asc' }],
    });
  }

  async serviceById(slugOrId: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        isActive: true,
        ...(isUuid(slugOrId) ? { id: slugOrId } : { slug: slugOrId }),
      },
      include: {
        category: true,
        packages: {
          orderBy: { sortOrder: 'asc' },
        },
        caseLinks: {
          include: {
            caseStudy: true,
          },
        },
      },
    });

    if (!service) return null;

    return {
      ...service,
      relatedCases: service.caseLinks.map((link) => link.caseStudy),
    };
  }

  async packages(serviceId?: string) {
    return this.prisma.package.findMany({
      where: {
        service: serviceId
          ? isUuid(serviceId)
            ? { is: { id: serviceId } }
            : { is: { slug: serviceId } }
          : undefined,
      },
      include: {
        service: true,
      },
      orderBy: [{ service: { title: 'asc' } }, { sortOrder: 'asc' }],
    });
  }

  async cases(query: CasesQuery) {
    return this.prisma.caseStudy.findMany({
      where: {
        isActive: true,
        industry: query.industry ? { contains: query.industry, mode: 'insensitive' } : undefined,
        tags: query.tag ? { has: query.tag } : undefined,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async caseById(slugOrId: string) {
    return this.prisma.caseStudy.findFirst({
      where: {
        isActive: true,
        ...(isUuid(slugOrId) ? { id: slugOrId } : { slug: slugOrId }),
      },
      include: {
        serviceLinks: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  onboarding() {
    return this.prisma.onboardingConfig.findUnique({ where: { key: 'default' } });
  }
}
