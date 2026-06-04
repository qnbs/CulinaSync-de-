import { db } from './dbInstance';
import { logAppError } from './errorLoggingService';

export const DEMO_MODE_SESSION_KEY = 'culinaSyncDemoMode';
export const TRY_MODE_SESSION_KEY = 'culinaSyncTryMode';
export const PAGES_DEMO_BANNER_DISMISSED_KEY = 'culinaSyncPagesDemoBannerDismissed';

/** GitHub Pages production host (public demo). */
export function isGitHubPagesHost(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.location.hostname === 'qnbs.github.io';
}

export function isDemoModeActive(): boolean {
  try {
    return sessionStorage.getItem(DEMO_MODE_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

/** Same sample items as onboarding demo — keeps Pages/E2E behaviour predictable. */
export async function loadDemoPantrySeed(): Promise<number> {
  const now = Date.now();
  const items = [
    { name: 'Tomaten', quantity: 6, unit: 'Stk', category: 'Gemuese', createdAt: now, updatedAt: now },
    { name: 'Spaghetti', quantity: 1, unit: 'Packung', category: 'Trockenware', createdAt: now, updatedAt: now },
    { name: 'Olivenoel', quantity: 1, unit: 'Flasche', category: 'Grundlagen', createdAt: now, updatedAt: now },
    { name: 'Knoblauch', quantity: 3, unit: 'Zehen', category: 'Gemuese', createdAt: now, updatedAt: now },
  ];
  try {
    await db.transaction('rw', db.pantry, async () => {
      await db.pantry.bulkAdd(items);
    });
    return items.length;
  } catch (error) {
    void logAppError(error, 'demoSeedService.loadDemoPantrySeed');
    throw error;
  }
}
