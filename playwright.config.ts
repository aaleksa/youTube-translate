import { defineConfig, devices } from '@playwright/test';

const testPort = process.env.PLAYWRIGHT_PORT ?? '3001';
const testBaseUrl = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: testBaseUrl,
    trace: 'on-first-retry',
    serviceWorkers: 'block',
  },
  projects: [
    {
      name: 'auth-isolation',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: [
        '**/account-isolation.spec.ts',
        '**/billing-api.spec.ts',
        '**/billing-api.spec.ts',
      ],
    },
    {
      name: 'auth-ui',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: [
        '**/auth-flow.spec.ts',
        '**/auth-multi-user-ui.spec.ts',
        '**/premium-ui.spec.ts',
        '**/offline-v2.spec.ts',
      ],
    },
    {
      name: 'iPhone 14',
      use: {
        ...devices['iPhone 14'],
        defaultBrowserType: 'chromium',
      },
      testIgnore: [
        '**/account-isolation.spec.ts',
        '**/billing-api.spec.ts',
        '**/auth-flow.spec.ts',
        '**/auth-multi-user-ui.spec.ts',
        '**/premium-ui.spec.ts',
        '**/offline-v2.spec.ts',
      ],
    },
    {
      name: 'Pixel 7',
      use: {
        ...devices['Pixel 7'],
        defaultBrowserType: 'chromium',
      },
      testIgnore: [
        '**/account-isolation.spec.ts',
        '**/billing-api.spec.ts',
        '**/auth-flow.spec.ts',
        '**/auth-multi-user-ui.spec.ts',
        '**/premium-ui.spec.ts',
        '**/offline-v2.spec.ts',
      ],
    },
    {
      name: 'iPad (gen 7)',
      use: {
        ...devices['iPad (gen 7)'],
        defaultBrowserType: 'chromium',
      },
      testIgnore: [
        '**/account-isolation.spec.ts',
        '**/billing-api.spec.ts',
        '**/auth-flow.spec.ts',
        '**/auth-multi-user-ui.spec.ts',
        '**/premium-ui.spec.ts',
        '**/offline-v2.spec.ts',
      ],
    },
  ],
  webServer: {
    command: `rm -f .next/dev/lock && npm run dev -- --hostname 127.0.0.1 --port ${testPort}`,
    url: testBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
