import { expect, test } from '@playwright/test';
import {
  seedBrowserSession,
  setBrowserOffline,
  signUpAndLogin,
  waitForAuthenticatedApp,
} from './helpers/auth';

test.describe('offline V2 banner', () => {
  test('shows offline UI while keeping the signed-in session', async ({
    page,
    request,
  }) => {
    const stamp = Date.now();
    const email = `offline-ui-${stamp}@test.local`;
    const session = await signUpAndLogin(request, email);

    const meReady = page.waitForResponse(
      (response) => response.url().includes('/api/v2/me') && response.ok()
    );

    await seedBrowserSession(page, session.tokens, session.user);
    await page.goto('/');
    await meReady;
    await waitForAuthenticatedApp(page);
    await expect(page.getByTestId('auth-logout-button')).toBeVisible({
      timeout: 15_000,
    });

    await setBrowserOffline(page, true);

    const banner = page.getByTestId('offline-v2-banner');
    await expect(banner).toBeVisible({ timeout: 10_000 });
    await expect(banner).toContainText(/limited mode|обмежений режим/i);

    const badge = page.getByTestId('sync-status-badge');
    await expect(badge).toBeVisible({ timeout: 10_000 });
    await expect(badge).toHaveAttribute('data-sync-state', 'offline');
    await expect(page.getByTestId('youtube-url-input')).toBeVisible();
  });
});
