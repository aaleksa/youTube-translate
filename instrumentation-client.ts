// Client-side Sentry init, auto-loaded by Next.js in the browser. No-ops
// safely when NEXT_PUBLIC_SENTRY_DSN is unset, so this has zero effect for
// self-hosters who don't use Sentry.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    environment: process.env.NODE_ENV,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
