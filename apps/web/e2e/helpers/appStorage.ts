import type { Page } from '@playwright/test';
import pkg from '../../package.json' with { type: 'json' };

/** Muss mit `__APP_VERSION__` aus dem gebauten Bundle übereinstimmen (apps/web/package.json). */
export const E2E_APP_VERSION = pkg.version;

/**
 * Unterdrückt Onboarding- und Whats-New-Overlays, die Navigation in E2E blockieren.
 * Vor jedem `page.goto()` aufrufen.
 */
export async function seedDismissedAppModals(page: Page): Promise<void> {
  await page.addInitScript((version: string) => {
    localStorage.setItem('culinaSyncOnboarded', 'true');
    localStorage.setItem('culinasync_version', version);
  }, E2E_APP_VERSION);
}
