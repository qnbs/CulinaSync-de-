import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyPwaUpdate,
  setPwaUpdateHandler,
  skipWaitingServiceWorker,
} from '../pwaRegistration';

describe('pwaRegistration', () => {
  beforeEach(() => {
    setPwaUpdateHandler(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setPwaUpdateHandler(null);
  });

  it('applyPwaUpdate lädt die Seite neu wenn kein Handler gesetzt ist', async () => {
    const reload = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload },
    });

    await applyPwaUpdate(true);
    expect(reload).toHaveBeenCalledOnce();
  });

  it('applyPwaUpdate ruft registrierten Handler auf', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    setPwaUpdateHandler(handler);

    await applyPwaUpdate(false);
    expect(handler).toHaveBeenCalledWith(false);
  });

  it('skipWaitingServiceWorker sendet SKIP_WAITING an waiting worker', async () => {
    const postMessage = vi.fn();
    const getRegistration = vi.fn().mockResolvedValue({
      waiting: { postMessage },
    });
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistration },
    });

    await skipWaitingServiceWorker();
    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('skipWaitingServiceWorker ist no-op ohne waiting worker', async () => {
    const getRegistration = vi.fn().mockResolvedValue({ waiting: null });
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistration },
    });

    await expect(skipWaitingServiceWorker()).resolves.toBeUndefined();
  });
});
