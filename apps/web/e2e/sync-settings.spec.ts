import { test, expect } from '@playwright/test';
import { seedDismissedAppModals } from './helpers/appStorage';
import { goToSettingsData } from './helpers/navigation';

test.describe('Settings — Sync & Device', () => {
  test.beforeEach(async ({ page }) => {
    await seedDismissedAppModals(page);
  });

  test('Daten-Panel zeigt Geräte-Sync und öffnet QR-Modal', async ({ page, baseURL }) => {
    await page.goto(baseURL ?? '/');
    await goToSettingsData(page);

    await expect(page.getByText(/qr-sync|geräte/i).first()).toBeVisible();
    await page.getByRole('button', { name: /qr-sync.*(öffnen|oeffnen)/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('Nextcloud-Verbindungstest mit gemocktem WebDAV', async ({ page, baseURL }) => {
    await page.route('**/remote.php/dav/files/**', async (route) => {
      if (route.request().method() === 'PROPFIND') {
        await route.fulfill({ status: 404, body: '' });
        return;
      }
      await route.continue();
    });

    await page.goto(baseURL ?? '/');
    await goToSettingsData(page);

    await page.getByRole('radio', { name: /nextcloud/i }).check();
    await page.getByPlaceholder(/https:\/\/cloud/i).fill('https://cloud.example.com');
    await page.getByPlaceholder(/benutzername/i).fill('demo');
    await page.getByPlaceholder(/app-passwort/i).fill('app-secret');
    await page.locator('section').filter({ hasText: /nextcloud/i }).getByPlaceholder(/passwort/i).last().fill('sync-pw');
    await page.getByRole('button', { name: /verbindung pruefen/i }).click();

    await expect(page.getByText(/nextcloud erreichbar/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});
