import { test, expect } from '@playwright/test';
import { gotoApp } from './helpers/gotoApp';
import { goToPantry } from './helpers/navigation';

test.describe('Vorratskammer — Smart Add', () => {
  test('Smart-Add-Platzhalter → Artikel erscheint in der Liste', async ({ page, baseURL }) => {
    await gotoApp(page, baseURL);
    await goToPantry(page);

    const smartInput = page.getByLabel(/schnellzugabe|quick add/i);
    await expect(smartInput).toBeVisible({ timeout: 15_000 });
    await smartInput.fill('500g Spaghetti');
    await smartInput.press('Enter');

    await expect(page.getByRole('heading', { name: /^spaghetti$/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
