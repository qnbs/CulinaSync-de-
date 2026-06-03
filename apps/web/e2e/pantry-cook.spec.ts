import { test, expect } from '@playwright/test';
import { seedDismissedAppModals } from './helpers/appStorage';
import { goToPantry } from './helpers/navigation';

test.describe('Vorratskammer — Kernflow', () => {
  test.beforeEach(async ({ page }) => {
    await seedDismissedAppModals(page);
  });

  test('Artikel hinzufügen und in der Liste sehen', async ({ page, baseURL }) => {
    const itemName = `E2E-Milch-${Date.now()}`;

    await page.goto(baseURL ?? '/');
    await goToPantry(page);

    await page.getByRole('button', { name: /artikel hinzuf/i }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/name/i).fill(itemName);
    await dialog.getByRole('button', { name: /speichern|hinzuf/i }).click();

    await expect(page.getByRole('heading', { name: itemName })).toBeVisible({ timeout: 15_000 });
  });
});
