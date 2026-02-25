import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AuthRateLimitMiddleware } from './common/middleware/auth-rate-limit.middleware';
import { GlobalRateLimitMiddleware } from './common/middleware/global-rate-limit.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { RedisModule } from './common/redis/redis.module';
import { ContentModule } from './content/content.module';
import { CrmModule } from './crm/crm.module';
import { HealthModule } from './health/health.module';
import { LeadsModule } from './leads/leads.module';
import { MeModule } from './me/me.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    TelegramBotModule,
    AuthModule,
    ContentModule,
    LeadsModule,
    BookingModule,
    AiModule,
    AnalyticsModule,
    HealthModule,
    CrmModule,
    MeModule,
    OnboardingModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware, GlobalRateLimitMiddleware).forRoutes('*');

    consumer.apply(AuthRateLimitMiddleware).forRoutes(
      { path: '/api/v1/auth', method: RequestMethod.ALL },
      { path: '/api/v1/auth/(.*)', method: RequestMethod.ALL },
    );
  }
}
