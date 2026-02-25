import { Controller, Get, NotFoundException, Param, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createHash } from 'node:crypto';
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

@Controller('/api/v1/content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  private sendWithEtag(
    req: Request,
    res: Response,
    payload: unknown,
    maxAgeSeconds = 60,
  ): { ok: true; data: unknown } | void {
    const body = JSON.stringify(payload);
    const etag = `"${createHash('sha1').update(body).digest('hex')}"`;
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=300`);
    return { ok: true, data: payload };
  }

  @Get('service-categories')
  async serviceCategories(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.sendWithEtag(req, res, await this.content.serviceCategories());
  }

  @Get('categories')
  async categoriesAlias(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.sendWithEtag(req, res, await this.content.serviceCategories());
  }

  @Get('services')
  async services(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: ServiceQueryDto,
  ) {
    const tags = query.tags?.split(',').map((x) => x.trim()).filter(Boolean);
    return this.sendWithEtag(
      req,
      res,
      await this.content.services({
        categoryId: query.categoryId,
        q: query.q,
        tags,
      }),
    );
  }

  @Get('services/:id')
  async serviceById(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ) {
    const item = await this.content.serviceById(id);
    if (!item) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Service not found' });
    }
    return this.sendWithEtag(req, res, item, 30);
  }

  @Get('packages')
  async packages(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.sendWithEtag(req, res, await this.content.packages(serviceId));
  }

  @Get('cases')
  async cases(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: CaseQueryDto,
  ) {
    return this.sendWithEtag(
      req,
      res,
      await this.content.cases({
        industry: query.industry,
        tag: query.tag,
      }),
    );
  }

  @Get('cases/:id')
  async caseById(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ) {
    const item = await this.content.caseById(id);
    if (!item) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Case not found' });
    }
    return this.sendWithEtag(req, res, item, 30);
  }

  @Get('onboarding')
  async onboarding(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.sendWithEtag(req, res, await this.content.onboarding());
  }
}
