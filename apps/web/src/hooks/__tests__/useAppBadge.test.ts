import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAppBadge } from '../useAppBadge';

describe('useAppBadge', () => {
  it('setzt Badge wenn API verfuegbar', async () => {
    const setAppBadge = vi.fn().mockResolvedValue(undefined);
    const clearAppBadge = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'setAppBadge', { configurable: true, value: setAppBadge });
    Object.defineProperty(navigator, 'clearAppBadge', { configurable: true, value: clearAppBadge });

    renderHook(() => useAppBadge(3));
    await vi.waitFor(() => {
      expect(setAppBadge).toHaveBeenCalledWith(3);
    });

    renderHook(() => useAppBadge(0));
    await vi.waitFor(() => {
      expect(clearAppBadge).toHaveBeenCalled();
    });
  });

  it('kappt Badge bei mehr als 99', async () => {
    const setAppBadge = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'setAppBadge', { configurable: true, value: setAppBadge });
    Object.defineProperty(navigator, 'clearAppBadge', { configurable: true, value: vi.fn() });

    renderHook(() => useAppBadge(150));
    await vi.waitFor(() => {
      expect(setAppBadge).toHaveBeenCalledWith(99);
    });
  });
});
