import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useOnlineStatus } from '../useOnlineStatus';

describe('useOnlineStatus', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  it('startet mit navigator.onLine', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('reagiert auf offline/online Events', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });

  it('synchronisiert bei visibilitychange und pageshow persisted', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
      Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    });
    expect(result.current).toBe(true);
  });
});
