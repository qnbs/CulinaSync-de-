import { test, expect } from '@playwright/test';
import { seedDismissedAppModals } from './helpers/appStorage';

test.describe('CulinaSync Navigation & Offline', () => {
  test('Desktop-Navigation wechselt zu Rezepten', async ({ page, baseURL }) => {
    await seedDismissedAppModals(page);
    await page.goto(baseURL ?? '/');
    await page.getByRole('button', { name: /rezept/i }).first().click();
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('Mobile Bottom-Navigation wechselt zu Rezepten', async ({ page, baseURL }) => {
    await seedDismissedAppModals(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseURL ?? '/');
    await page.getByRole('navigation', { name: /hauptnavigation/i }).getByRole('button', { name: /^rezepte$/i }).click();
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('Offline-Banner erscheint ohne Netzwerk', async ({ page, baseURL, context }) => {
    await seedDismissedAppModals(page);
    await page.goto(baseURL ?? '/');
    await expect(page.locator('#main-content')).toBeVisible();
    await context.setOffline(true);
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
      window.dispatchEvent(new Event('offline'));
    });
    await expect(page.getByRole('status')).toContainText(/offline/i, { timeout: 15_000 });
    await context.setOffline(false);
  });
});
