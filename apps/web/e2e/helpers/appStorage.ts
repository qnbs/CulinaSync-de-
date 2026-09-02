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

/**
 * Simuliert Erstbesuch: kein Intro-complete Marker (Welcome-Modal beim Laden).
 * Nicht mit `seedDismissedAppModals` kombinieren.
 */
export async function seedFirstRunIntro(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.removeItem('culinaSyncOnboarded');
    localStorage.removeItem('culinasync_version');
  });
}
