import { test, expect } from '@playwright/test';
import { seedDismissedAppModals } from './helpers/appStorage';
import { goToAiChef } from './helpers/navigation';

async function dismissLocalAiSetupIfOpen(page: import('@playwright/test').Page): Promise<void> {
  // LocalAiSetupHost öffnet auf der Chef-Seite wenn setupWizardCompleted=false
  const later = page.getByRole('button', { name: /später|later/i });
  if (await later.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await later.click();
    await expect(later).toBeHidden({ timeout: 10_000 });
  }
}

test.describe('KI-Chef — Offline', () => {
  test.beforeEach(async ({ page }) => {
    await seedDismissedAppModals(page);
  });

  test('Offline-Banner und AI-Hinweis auf KI-Chef', async ({ page, baseURL, context }) => {
    await page.goto(baseURL ?? '/');
    await goToAiChef(page);
    await dismissLocalAiSetupIfOpen(page);
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
    await goToAiChef(page);
    await dismissLocalAiSetupIfOpen(page);

    const askButton = page.getByRole('button', { name: /chef fragen/i });
    await expect(askButton).toBeVisible();

    const cravingInput = page.locator('textarea').first();
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
