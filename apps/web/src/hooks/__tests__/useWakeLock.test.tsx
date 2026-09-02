import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWakeLock } from '../useWakeLock';

describe('useWakeLock', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      writable: true,
      value: 'visible',
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'wakeLock');
  });

  it('fordert Wake Lock an und gibt release frei', async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    const sentinel = {
      released: false,
      type: 'screen' as const,
      release,
      addEventListener: vi.fn(),
    };

    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: {
        request: vi.fn().mockResolvedValue(sentinel),
      },
    });

    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toBe(true);

    await act(async () => {
      await result.current[2]();
    });

    expect(release).toHaveBeenCalled();
  });

  it('fängt Fehler beim Request ab', async () => {
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: {
        request: vi.fn().mockRejectedValue(new Error('denied')),
      },
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toBe(false);
    consoleSpy.mockRestore();
  });

  it('setzt isLocked false wenn release-Event feuert', async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    let releaseHandler: (() => void) | null = null;
    const sentinel = {
      released: false,
      type: 'screen' as const,
      release,
      addEventListener: vi.fn((event: string, handler: () => void) => {
        if (event === 'release') releaseHandler = handler;
      }),
    };

    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request: vi.fn().mockResolvedValue(sentinel) },
    });

    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current[1]();
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      releaseHandler?.();
    });
    expect(result.current[0]).toBe(false);
  });

  it('released Lock beim Unmount', async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    const sentinel = {
      released: false,
      type: 'screen' as const,
      release,
      addEventListener: vi.fn(),
    };

    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request: vi.fn().mockResolvedValue(sentinel) },
    });

    const { result, unmount } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current[1]();
    });

    unmount();
    expect(release).toHaveBeenCalled();
  });

  it('tut nichts wenn wakeLock API fehlt', async () => {
    const { result } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current[1]();
    });
    expect(result.current[0]).toBe(false);
  });
});
