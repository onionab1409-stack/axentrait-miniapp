import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { AppModule } from './app.module';
import { initSentry } from './common/monitoring/sentry';
import { redactPii } from './common/utils/pii';

function buildAllowedOrigins(appOrigin?: string): string[] {
  const allowlist = new Set<string>(['http://localhost:5173']);
  if (appOrigin) {
    allowlist.add(appOrigin);
  }
  return [...allowlist];
}

async function bootstrap() {
  initSentry();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.use(cookieParser());
  app.use(
    pinoHttp({
      redact: {
        paths: ['req.headers.authorization', 'req.body.password', 'req.body.email', 'req.body.phone'],
        censor: '***',
      },
      serializers: {
        req: (req) => ({
          id: (req as { requestId?: string }).requestId,
          method: req.method,
          url: req.url,
          body: redactPii((req as { body?: unknown }).body),
        }),
      },
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  app.enableCors({
    origin: buildAllowedOrigins(config.get<string>('APP_ORIGIN')),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  const port = Number(config.get<string>('PORT') ?? '3000');
  await app.listen(port, '0.0.0.0');
  logger.log(`Backend API started on :${port}`);
}

void bootstrap();
