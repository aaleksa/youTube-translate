import { expect, test } from '@playwright/test';
import {
  seedBrowserSession,
  signUpAndLogin,
  waitForAuthenticatedApp,
} from './helpers/auth';

test.describe('premium UI', () => {
  test('shows AI usage and upgrade button for free users', async ({
    page,
    request,
  }) => {
    const stamp = Date.now();
    const email = `premium-ui-${stamp}@test.local`;
    const session = await signUpAndLogin(request, email);

    await seedBrowserSession(page, session.tokens, session.user);
    await page.goto('/');
    await waitForAuthenticatedApp(page);

    const usage = page.getByTestId('premium-ai-usage');
    await expect(usage).toBeVisible({ timeout: 15_000 });
    await expect(usage).toContainText(/\d+\s*\/\s*\d+|AI/i);

    await expect(page.getByTestId('premium-upgrade-button')).toBeVisible();
    await page.getByTestId('premium-upgrade-button').click();
    await expect(page.getByRole('dialog').last()).toBeVisible();
  });
});
