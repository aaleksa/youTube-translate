import { test, expect } from '@playwright/test';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const hasHorizontalOverflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth > root.clientWidth + 1;
  });

  expect(hasHorizontalOverflow).toBe(false);
}

test.describe('responsive layout', () => {
  test('landing page fits the viewport', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('settings and theme controls stay visible', async ({ page }) => {
    await page.goto('/');

    const settingsButton = page.getByRole('button', {
      name: /settings|налаштування|ustawienia|ajustes|einstellungen|paramètres/i,
    });
    await expect(settingsButton).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('quick info stats grid does not overflow on tablet width', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expectNoHorizontalOverflow(page);
  });
});
