import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../useOnlineStatus';

describe('useOnlineStatus', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('liest den initialen navigator.onLine-Wert', () => {
    vi.stubGlobal('navigator', { onLine: false });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('reagiert auf online- und offline-Events', () => {
    vi.stubGlobal('navigator', { onLine: true });
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });

  it('synchronisiert den Status nach visibilitychange und bfcache-pageshow', () => {
    vi.stubGlobal('navigator', { onLine: true });
    const { result } = renderHook(() => useOnlineStatus());

    vi.stubGlobal('navigator', { onLine: false });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current).toBe(false);

    vi.stubGlobal('navigator', { onLine: true });
    act(() => {
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    });
    expect(result.current).toBe(true);
  });
});
