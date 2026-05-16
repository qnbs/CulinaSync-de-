import { test, expect } from '@playwright/test';

test.describe('CulinaSync Smoke', () => {
  test('Startseite lädt', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
