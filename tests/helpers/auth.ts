import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const TEST_PASSWORD = 'password123';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

export interface AuthUser {
  userId: string;
  email: string;
}

export async function signUpAndLogin(
  request: APIRequestContext,
  email: string,
  password = TEST_PASSWORD
): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  await request.post('/api/v2/auth/signup', {
    data: { email, password },
  });

  const loginResponse = await request.post('/api/v2/auth/login', {
    data: { email, password },
  });
  expect(loginResponse.ok()).toBeTruthy();

  const tokens = (await loginResponse.json()) as ApiEnvelope<AuthTokens>;

  const meResponse = await request.get('/api/v2/me', {
    headers: { Authorization: `Bearer ${tokens.data.accessToken}` },
  });
  expect(meResponse.ok()).toBeTruthy();
  const me = (await meResponse.json()) as ApiEnvelope<AuthUser>;

  return {
    tokens: tokens.data,
    user: me.data,
  };
}

export async function clearBrowserStorage(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function seedBrowserSession(
  page: Page,
  tokens: AuthTokens,
  user: AuthUser
): Promise<void> {
  await page.addInitScript(
    ({ accessToken, refreshToken, idToken, expiresIn, storedUser }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('yoytube-v2-access-token', accessToken);
      localStorage.setItem('yoytube-v2-refresh-token', refreshToken);
      localStorage.setItem('yoytube-v2-id-token', idToken);
      localStorage.setItem(
        'yoytube-v2-expires-at',
        String(Date.now() + expiresIn * 1000)
      );
      localStorage.setItem('yoytube-v2-user', JSON.stringify(storedUser));
    },
    {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      idToken: tokens.idToken,
      expiresIn: tokens.expiresIn,
      storedUser: user,
    }
  );
}

export async function waitForAuthenticatedApp(page: Page): Promise<void> {
  await expect(page.getByTestId('youtube-url-input')).toBeVisible({
    timeout: 30_000,
  });
}

export async function openLoginDialog(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog');

  const dialogVisible = await dialog
    .waitFor({ state: 'visible', timeout: 30_000 })
    .then(() => true)
    .catch(() => false);
  if (dialogVisible) return;

  await page
    .locator('button.bg-blue-600', { hasText: /sign in|увійти/i })
    .click();
  await expect(dialog).toBeVisible({ timeout: 15_000 });
}

export async function loginThroughUi(
  page: Page,
  email: string,
  password = TEST_PASSWORD
): Promise<void> {
  await openLoginDialog(page);

  const dialog = page.getByRole('dialog');
  await dialog.locator('input[type="email"]').fill(email);
  await dialog.locator('input[type="password"]').fill(password);
  await dialog
    .getByRole('button', { name: /sign in|увійти|log in/i })
    .click();

  await page.waitForLoadState('load');
  await waitForAuthenticatedApp(page);
}
