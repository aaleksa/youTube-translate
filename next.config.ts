import { spawnSync } from 'node:child_process';
import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';
import { withSentryConfig } from '@sentry/nextjs';

const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout?.trim() ||
  crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  additionalPrecacheEntries: [{ url: '/~offline', revision }],
  disable: process.env.NODE_ENV === 'development',
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
};

const baseConfig = withSerwist(nextConfig);

// Only enable Sentry's build-time source map upload when org/project are
// configured (e.g. on Vercel with Sentry secrets set). Without them, this
// is a plain pass-through - no Sentry account required to build the app.
const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;

export default sentryOrg && sentryProject
  ? withSentryConfig(baseConfig, {
      org: sentryOrg,
      project: sentryProject,
      silent: true,
      widenClientFileUpload: true,
      disableLogger: true,
    })
  : baseConfig;
