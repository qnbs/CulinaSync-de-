import { test, expect } from '@playwright/test';
import { seedFirstRunIntro } from './helpers/appStorage';
import { goToPantry } from './helpers/navigation';

/** PWA offline/update toasts must not overlay the welcome modal (see pwaIntroDeferral). */
const PWA_TOAST_PATTERNS = [
  /app-update wird herunterladen/i,
  /offline-modus ist bereit/i,
  /offline mode is ready/i,
  /update.*download/i,
];

test.describe('First-run intro', () => {
  test.setTimeout(60_000);

  test('Welcome ohne PWA-Toasts → Überspringen → Vorrats-Artikel bleibt nach Reload', async ({
    page,
    baseURL,
  }) => {
    const itemName = `E2E-Spaghetti-${Date.now()}`;

    await seedFirstRunIntro(page);
    await page.goto(baseURL ?? '/', { waitUntil: 'domcontentloaded' });

    const welcome = page.getByRole('dialog').filter({ hasText: /willkommen|welcome/i });
    await expect(welcome).toBeVisible({ timeout: 20_000 });

    for (const pattern of PWA_TOAST_PATTERNS) {
      await expect(page.getByText(pattern)).toHaveCount(0);
    }

    const skipIntro = page
      .locator('[aria-labelledby="onboarding-title"]')
      .getByRole('button', { name: /^überspringen$/i });
    await skipIntro.click();
    await expect(page.locator('#onboarding-title')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 15_000 });

    await goToPantry(page);

    await page.getByRole('button', { name: /artikel hinzuf/i }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/name/i).fill(itemName);
    await dialog.getByRole('button', { name: /speichern|hinzuf/i }).click();
    await expect(page.getByRole('heading', { name: itemName })).toBeVisible({ timeout: 15_000 });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: itemName })).toBeVisible({ timeout: 20_000 });
  });
});
