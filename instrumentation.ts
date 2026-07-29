import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Captures errors from Server Components, Route Handlers, and the proxy.
// Safe no-op when Sentry.init was never called (no SENTRY_DSN configured).
export const onRequestError = Sentry.captureRequestError;
