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

  it('flushDeferredPwaToasts is noop when queue is empty', () => {
    const emitted: string[] = [];
    flushDeferredPwaToasts((toast) => emitted.push(toast.message));
    expect(emitted).toEqual([]);
  });

  it('does not defer when intro gates feature flag is disabled', async () => {
    vi.resetModules();
    vi.doMock('../../config/featureFlags', () => ({ INTRO_GATES_ENABLED: false }));
    const mod = await import('../pwaIntroDeferral');
    expect(mod.isFirstRunIntroPending()).toBe(false);
    const emitted: string[] = [];
    mod.deferOrEmitPwaToast((toast) => emitted.push(toast.message), {
      message: 'immediate',
      type: 'info',
    });
    expect(emitted).toEqual(['immediate']);
    vi.doUnmock('../../config/featureFlags');
    vi.resetModules();
  });
});
