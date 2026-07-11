import { useEffect, useRef } from 'react';
import {
  DEMO_MODE_SESSION_KEY,
  loadDemoPantrySeed,
  TRY_MODE_SESSION_KEY,
} from '../services/demoSeedService';

const ONBOARDED_KEY = 'culinaSyncOnboarded';

function stripQueryParams(keys: string[]): void {
  const url = new URL(window.location.href);
  let changed = false;
  for (const key of keys) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  if (changed) {
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  }
}

export type DemoEntryResult = 'demo' | 'try' | null;

/**
 * R-011: `?demo=1` loads pantry demo + dismisses onboarding; `?try=1` starts empty without tour.
 */
export function useDemoEntryQuery(
  onResolved?: (result: DemoEntryResult) => void,
  enabled = true,
): void {
  const handled = useRef(false);

  useEffect(() => {
    // Gated off with the intro gates: `?demo=1` / `?try=1` must not mark onboarding
    // complete or load demo data while INTRO_GATES_ENABLED is false (CodeRabbit).
    if (!enabled || handled.current || typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const tryMode = params.get('try') === '1';
    const demoMode = params.get('demo') === '1';

    if (!tryMode && !demoMode) {
      return;
    }

    handled.current = true;

    if (tryMode) {
      localStorage.setItem(ONBOARDED_KEY, 'true');
      sessionStorage.setItem(TRY_MODE_SESSION_KEY, '1');
      stripQueryParams(['try']);
      onResolved?.('try');
      return;
    }

    localStorage.setItem(ONBOARDED_KEY, 'true');
    sessionStorage.setItem(DEMO_MODE_SESSION_KEY, '1');
    stripQueryParams(['demo']);
    void loadDemoPantrySeed()
      .then(() => onResolved?.('demo'))
      .catch(() => onResolved?.('demo'));
  }, [onResolved, enabled]);
}
