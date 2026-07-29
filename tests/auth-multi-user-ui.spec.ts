import { expect, test } from '@playwright/test';
import {
  loginThroughUi,
  seedBrowserSession,
  signUpAndLogin,
  waitForAuthenticatedApp,
} from './helpers/auth';

test.describe('multi-user UI isolation', () => {
  test('switching accounts clears video history in the UI', async ({
    page,
    request,
  }) => {
    const stamp = Date.now();
    const emailA = `iso-a-ui-${stamp}@test.local`;
    const emailB = `iso-b-ui-${stamp}@test.local`;
    const markerTitle = `UI Isolation Marker ${stamp}`;
    const videoId = 'dQw4w9WgXcQ';

    const userA = await signUpAndLogin(request, emailA);
    const userB = await signUpAndLogin(request, emailB);

    await request.post('/api/v2/video-history', {
      headers: { Authorization: `Bearer ${userA.tokens.accessToken}` },
      data: {
        videoId,
        title: markerTitle,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        channel: 'Test Channel',
      },
    });

    await seedBrowserSession(page, userA.tokens, userA.user);
    await page.goto('/');
    await waitForAuthenticatedApp(page);

    await expect(page.getByText(markerTitle)).toBeVisible({ timeout: 15_000 });

    await seedBrowserSession(page, userB.tokens, userB.user);
    await page.goto('/');
    await waitForAuthenticatedApp(page);

    await expect(page.getByTestId('auth-user-email')).toHaveText(emailB);
    await expect(page.getByText(markerTitle)).toHaveCount(0);
    await expect(
      page.getByText(/recent videos|нещодавні відео/i)
    ).toHaveCount(0);
  });
});
