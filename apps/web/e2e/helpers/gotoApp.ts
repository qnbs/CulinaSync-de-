import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { seedDismissedAppModals } from './appStorage';

/**
 * Open the app shell after dismissing intro modals.
 * Waits for `#main-content` — WebKit treats `body` as hidden during hydration.
 */
export async function gotoApp(page: Page, baseURL?: string): Promise<void> {
  await seedDismissedAppModals(page);
  await page.goto(baseURL ?? '/', { waitUntil: 'load' });
  await expect(page.locator('#main-content')).toBeVisible({ timeout: 30_000 });
}
