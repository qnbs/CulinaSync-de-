import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePwaUpdate } from '../usePwaUpdate';
import { applyPwaUpdate, skipWaitingServiceWorker } from '../../services/pwaRegistration';

vi.mock('../../services/pwaRegistration', () => ({
  applyPwaUpdate: vi.fn().mockResolvedValue(undefined),
  skipWaitingServiceWorker: vi.fn().mockResolvedValue(undefined),
}));

describe('usePwaUpdate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows update notice after 1s when intro gates are not active', () => {
    const { result } = renderHook(() => usePwaUpdate({ deferForIntro: false }));

    act(() => {
      window.dispatchEvent(new Event('culinasync:pwa-update-ready'));
    });
    expect(result.current.showUpdateReadyNotice).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.showUpdateReadyNotice).toBe(true);
  });

  it('defers update notice while intro gates are active', () => {
    const { result, rerender } = renderHook(
      ({ deferForIntro }) => usePwaUpdate({ deferForIntro }),
      { initialProps: { deferForIntro: true } },
    );

    act(() => {
      window.dispatchEvent(new Event('culinasync:pwa-update-ready'));
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.showUpdateReadyNotice).toBe(false);

    rerender({ deferForIntro: false });
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current.showUpdateReadyNotice).toBe(true);
  });

  it('dismissUpdateNotice hides the dialog', () => {
    const { result } = renderHook(() => usePwaUpdate({ deferForIntro: false }));

    act(() => {
      window.dispatchEvent(new Event('culinasync:pwa-update-ready'));
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.showUpdateReadyNotice).toBe(true);

    act(() => {
      result.current.dismissUpdateNotice();
    });
    expect(result.current.showUpdateReadyNotice).toBe(false);
  });

  it('handleReloadForUpdate applies waiting service worker', async () => {
    const { result } = renderHook(() => usePwaUpdate({ deferForIntro: false }));

    act(() => {
      window.dispatchEvent(new Event('culinasync:pwa-update-ready'));
      vi.advanceTimersByTime(1000);
    });

    await act(async () => {
      await result.current.handleReloadForUpdate();
    });

    expect(skipWaitingServiceWorker).toHaveBeenCalled();
    expect(applyPwaUpdate).toHaveBeenCalledWith(true);
    expect(result.current.showUpdateReadyNotice).toBe(false);
  });

  it('ignores update-ready events while notice is visible', () => {
    const { result } = renderHook(() => usePwaUpdate({ deferForIntro: false }));

    act(() => {
      window.dispatchEvent(new Event('culinasync:pwa-update-ready'));
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.showUpdateReadyNotice).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('culinasync:pwa-update-ready'));
    });
    act(() => {
      result.current.dismissUpdateNotice();
    });
    expect(result.current.showUpdateReadyNotice).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('culinasync:pwa-update-ready'));
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.showUpdateReadyNotice).toBe(true);
  });
});
