import type { Page } from '@playwright/test';
import pkg from '../../package.json' with { type: 'json' };

/** Muss mit `__APP_VERSION__` aus dem gebauten Bundle übereinstimmen (apps/web/package.json). */
export const E2E_APP_VERSION = pkg.version;

/**
 * Unterdrückt Onboarding- und Whats-New-Overlays, die Navigation in E2E blockieren.
 * Vor jedem `page.goto()` aufrufen.
 */
const E2E_IDB_NAMES = [
  'CulinaSyncStateDB',
  'CulinaSyncDataDB',
  'CulinaSyncDB',
  'CulinaSyncMigrationBackups',
] as const;

export async function seedDismissedAppModals(page: Page): Promise<void> {
  await page.addInitScript(async (version: string) => {
    await Promise.all(
      E2E_IDB_NAMES.map(
        (name) =>
          new Promise<void>((resolve) => {
            try {
              const request = indexedDB.deleteDatabase(name);
              request.onsuccess = () => resolve();
              request.onerror = () => resolve();
              request.onblocked = () => resolve();
            } catch {
              resolve();
            }
          }),
      ),
    );
    localStorage.setItem('culinaSyncOnboarded', 'true');
    localStorage.setItem('culinasync_version', version);
  }, E2E_APP_VERSION);
}
