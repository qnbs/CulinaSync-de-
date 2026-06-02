import { test, expect } from '@playwright/test';

test.describe('CulinaSync Navigation & Offline', () => {
  test('Desktop-Navigation wechselt zu Rezepten', async ({ page, baseURL }) => {
    await page.goto(baseURL ?? '/');
    await page.getByRole('button', { name: /rezept/i }).first().click();
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('Mobile Bottom-Navigation wechselt zu Rezepten', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseURL ?? '/');
    await page.getByRole('navigation', { name: /hauptnavigation/i }).getByRole('button', { name: /^rezepte$/i }).click();
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('Offline-Banner erscheint ohne Netzwerk', async ({ page, baseURL, context }) => {
    await page.goto(baseURL ?? '/');
    await context.setOffline(true);
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
      window.dispatchEvent(new Event('offline'));
    });
    await expect(page.locator('#offline-status-banner')).toContainText(/offline/i);
    await context.setOffline(false);
  });
});
