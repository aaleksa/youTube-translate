import { expect, test } from '@playwright/test';
import {
  clearBrowserStorage,
  loginThroughUi,
  signUpAndLogin,
  waitForAuthenticatedApp,
} from './helpers/auth';

test.describe('auth flow', () => {
  test('UI login shows the signed-in email in the header', async ({
    page,
    request,
  }) => {
    const stamp = Date.now();
    const email = `auth-ui-${stamp}@test.local`;
    await signUpAndLogin(request, email);

    await clearBrowserStorage(page);
    await page.goto('/');
    await loginThroughUi(page, email);

    await expect(page.getByTestId('auth-user-email')).toHaveText(email);
    await waitForAuthenticatedApp(page);
  });

  test('logout clears session and shows the login button', async ({
    page,
    request,
  }) => {
    const stamp = Date.now();
    const email = `auth-logout-${stamp}@test.local`;
    await signUpAndLogin(request, email);

    await clearBrowserStorage(page);
    await page.goto('/');
    await loginThroughUi(page, email);
    await expect(page.getByTestId('auth-logout-button')).toBeVisible();

    await page.getByTestId('auth-logout-button').click();
    await expect(page.getByTestId('auth-login-button')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('youtube-url-input')).toHaveCount(0);
  });
});