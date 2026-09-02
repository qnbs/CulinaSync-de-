import { test, expect } from '@playwright/test';
import { gotoApp } from './helpers/gotoApp';

test.describe('CulinaSync Navigation & Offline', () => {
  test('Desktop-Navigation wechselt zu Rezepten', async ({ page, baseURL }) => {
    await gotoApp(page, baseURL);
    const btn = page.getByRole('button', { name: /rezept/i }).first();
    await expect(btn).toBeVisible({ timeout: 15_000 });
    await btn.click();
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('Mobile Bottom-Navigation wechselt zu Rezepten', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoApp(page, baseURL);
    const navBtn = page
      .getByRole('navigation', { name: /hauptnavigation/i })
      .getByRole('button', { name: /^rezepte$/i });
    await expect(navBtn).toBeVisible({ timeout: 15_000 });
    await navBtn.click();
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('Offline-Banner erscheint ohne Netzwerk', async ({ page, baseURL, context }) => {
    await gotoApp(page, baseURL);
    await context.setOffline(true);
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
      window.dispatchEvent(new Event('offline'));
    });
    await expect(page.locator('#offline-status-banner')).toContainText(/offline/i, {
      timeout: 15_000,
    });
    await context.setOffline(false);
  });
});
