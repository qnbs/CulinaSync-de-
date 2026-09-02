import { test, expect } from '@playwright/test';
import { gotoApp } from './helpers/gotoApp';
import { goToSettingsData } from './helpers/navigation';

test.describe('Einstellungen — Daten & PWA', () => {
  test('Daten-Panel zeigt PWA Install/Update-Hinweise', async ({ page, baseURL }) => {
    await gotoApp(page, baseURL);
    await goToSettingsData(page);

    await expect(page.getByText(/app installieren|pwa/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/offline|install/i).first()).toBeVisible();
  });
});
