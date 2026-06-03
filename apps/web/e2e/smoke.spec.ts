import { test, expect } from '@playwright/test';
import { seedDismissedAppModals } from './helpers/appStorage';

test.describe('CulinaSync Smoke', () => {
  test('Startseite lädt', async ({ page, baseURL }) => {
    await seedDismissedAppModals(page);
    await page.goto(baseURL ?? '/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('link', { name: /skip|inhalt/i })).toBeVisible();
  });
});
