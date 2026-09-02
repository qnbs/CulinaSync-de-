import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearDeferredPwaToastsForTests,
  deferOrEmitPwaToast,
  flushDeferredPwaToasts,
  isFirstRunIntroPending,
} from '../pwaIntroDeferral';

vi.mock('../../config/featureFlags', () => ({ INTRO_GATES_ENABLED: true }));

describe('pwaIntroDeferral', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearDeferredPwaToastsForTests();
  });

  it('defers PWA toasts while first-run intro is pending', () => {
    expect(isFirstRunIntroPending()).toBe(true);
    const emitted: string[] = [];
    deferOrEmitPwaToast((toast) => emitted.push(toast.message), {
      message: 'offline-ready',
      type: 'info',
    });
    expect(emitted).toEqual([]);
    flushDeferredPwaToasts((toast) => emitted.push(toast.message));
    expect(emitted).toEqual(['offline-ready']);
  });

  it('emits immediately when onboarding was completed', () => {
    window.localStorage.setItem('culinaSyncOnboarded', 'true');
    const emitted: string[] = [];
    deferOrEmitPwaToast((toast) => emitted.push(toast.message), {
      message: 'update-download',
      type: 'info',
    });
    expect(emitted).toEqual(['update-download']);
    expect(isFirstRunIntroPending()).toBe(false);
  });
});
