// Server-side Sentry init. Loaded once via instrumentation.ts's register()
// when NEXT_RUNTIME === 'nodejs'. No-ops safely when SENTRY_DSN is unset,
// so this is a no-op for self-hosters who don't use Sentry.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN?.trim();

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    environment: process.env.NODE_ENV,
  });
}
