import * as Sentry from '@sentry/node';

let isInitialized = false;

export function initSentry(): void {
  if (isInitialized) {
    return;
  }

  const dsn = process.env.SENTRY_DSN_BACKEND;
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1,
  });

  isInitialized = true;
}

export { Sentry };
