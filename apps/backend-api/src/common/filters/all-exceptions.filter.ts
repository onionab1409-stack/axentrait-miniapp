import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Sentry } from '../monitoring/sentry';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { requestId?: string }>();
    const res = ctx.getResponse<Response>();
    const requestId = req.requestId ?? 'n/a';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: unknown;

    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      message = 'Invalid payload';
      details = exception.issues.map((issue) => ({
        field: issue.path.join('.') || 'unknown',
        issue: issue.message,
      }));
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        const data = payload as Record<string, unknown>;
        if (typeof data.code === 'string') code = data.code;
        if (typeof data.message === 'string') {
          message = data.message;
        } else if (Array.isArray(data.message)) {
          message = data.message.join('; ');
        }
        details = data.details;
      }
    }

    if (status >= 500) {
      this.logger.error(`${req.method} ${req.url}`, exception as Error);
      Sentry.captureException(exception, {
        tags: {
          requestId,
          path: req.url,
          method: req.method,
        },
      });
    }

    res.status(status).json({
      error: {
        code,
        message,
        details,
        requestId,
      },
    });
  }
}
