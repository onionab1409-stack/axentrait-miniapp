import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ContentService } from './content.service';

type ServiceQueryDto = {
  categoryId?: string;
  q?: string;
  tags?: string;
};

type CaseQueryDto = {
  industry?: string;
  tag?: string;
};

@Controller('/api/v1')
export class PublicContentController {
  constructor(private readonly content: ContentService) {}

  @Get('services')
  async services(@Query() query: ServiceQueryDto) {
    const tags = query.tags?.split(',').map((x) => x.trim()).filter(Boolean);
    return this.content.services({
      categoryId: query.categoryId,
      q: query.q,
      tags,
    });
  }

  @Get('services/:id')
  async serviceById(@Param('id') id: string) {
    const item = await this.content.serviceById(id);
    if (!item) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Service not found' });
    }
    return item;
  }

  @Get('cases')
  async cases(@Query() query: CaseQueryDto) {
    return this.content.cases({
      industry: query.industry,
      tag: query.tag,
    });
  }

  @Get('cases/:id')
  async caseById(@Param('id') id: string) {
    const item = await this.content.caseById(id);
    if (!item) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Case not found' });
    }
    return item;
  }

  @Get('onboarding')
  async onboarding() {
    const config = await this.content.onboarding();
    return config?.content ?? {};
  }
}
