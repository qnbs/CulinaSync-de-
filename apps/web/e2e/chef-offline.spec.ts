import { test, expect } from '@playwright/test';
import { seedDismissedAppModals } from './helpers/appStorage';
import { goToAiChef, openSettingsSection } from './helpers/navigation';

test.describe('KI-Chef — Offline', () => {
  test.beforeEach(async ({ page }) => {
    await seedDismissedAppModals(page);
  });

  test('Offline-Banner und AI-Hinweis auf KI-Chef', async ({ page, baseURL, context }) => {
    await page.goto(baseURL ?? '/');
    await goToAiChef(page);
    await expect(page.getByRole('button', { name: /chef fragen/i })).toBeVisible();

    await context.setOffline(true);
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
      window.dispatchEvent(new Event('offline'));
    });

    await expect(page.locator('#offline-status-banner')).toContainText(/offline/i, {
      timeout: 15_000,
    });
    await expect(page.locator('#offline-status-ai-hint')).toBeVisible();
    await context.setOffline(false);
  });

  test('Chef fragen offline liefert lokale Ideen ohne Crash', async ({ page, baseURL, context }) => {
    test.setTimeout(60_000);
    await page.goto(baseURL ?? '/');
    await openSettingsSection(page, /lokale ki/i);
    const localOnly = page.getByRole('switch', { name: /nur lokal/i });
    if (await localOnly.isVisible().catch(() => false)) {
      const checked = await localOnly.getAttribute('aria-checked');
      if (checked !== 'true') {
        await localOnly.click();
      }
    }

    await goToAiChef(page);
    const askButton = page.getByRole('button', { name: /chef fragen/i });
    await expect(askButton).toBeVisible();

    // Button ist disabled ohne Craving-Text
    const cravingInput = page.getByRole('textbox').first();
    await cravingInput.fill('Pasta mit Tomaten');
    await expect(askButton).toBeEnabled({ timeout: 10_000 });

    await context.setOffline(true);
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
      window.dispatchEvent(new Event('offline'));
    });

    await askButton.click();
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/fehler|crash/i)).toHaveCount(0);
    await context.setOffline(false);
  });
});
