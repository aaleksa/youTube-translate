// Edge-runtime Sentry init (e.g. proxy.ts if it ever runs on the Edge
// runtime). Loaded via instrumentation.ts's register() when
// NEXT_RUNTIME === 'edge'. No-ops safely when SENTRY_DSN is unset.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN?.trim();

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    environment: process.env.NODE_ENV,
  });
}
