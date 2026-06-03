import { test, expect } from '@playwright/test';
import { seedDismissedAppModals } from './helpers/appStorage';
import { goToAiChef, openSettingsSection } from './helpers/navigation';

test.describe('KI-Chef — Local-First', () => {
  test.beforeEach(async ({ page }) => {
    await seedDismissedAppModals(page);
  });

  test('Lokale-KI-Einstellungen zeigen Strict-Local-Toggle', async ({ page, baseURL }) => {
    await page.goto(baseURL ?? '/');
    await openSettingsSection(page, /lokale ki/i);
    await expect(page.getByRole('switch', { name: /nur lokal/i })).toBeVisible();
  });

  test('KI-Chef-Bereich ist erreichbar', async ({ page, baseURL }) => {
    await page.goto(baseURL ?? '/');
    await goToAiChef(page);
    await expect(page.getByRole('button', { name: /chef fragen/i })).toBeVisible();
  });
});
