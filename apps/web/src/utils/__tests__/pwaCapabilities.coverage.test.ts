import { afterEach, describe, expect, it, vi } from 'vitest';
import { canShowNativeInstall, detectPwaCapabilities, isIosSafari } from '../pwaCapabilities';

describe('pwaCapabilities (coverage)', () => {
  const originalNavigator = globalThis.navigator;
  const originalWindow = globalThis.window;

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, configurable: true });
    Object.defineProperty(globalThis, 'window', { value: originalWindow, configurable: true });
  });

  it('detectPwaCapabilities returns empty array without window', () => {
    vi.stubGlobal('window', undefined);
    expect(detectPwaCapabilities()).toEqual([]);
  });

  it('isIosSafari detects iPhone user agent', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
      configurable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: { MSStream: undefined },
      configurable: true,
    });
    expect(isIosSafari()).toBe(true);
  });

  it('isIosSafari returns false for non-iOS', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0)' },
      configurable: true,
    });
    expect(isIosSafari()).toBe(false);
  });

  it('canShowNativeInstall is false without BeforeInstallPromptEvent', () => {
    expect(canShowNativeInstall()).toBe(false);
  });

  it('detectPwaCapabilities marks standalone when display-mode matches', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('standalone'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    const caps = detectPwaCapabilities();
    expect(caps.find((c) => c.id === 'standalone')?.supported).toBe(true);
  });

  it('detectPwaCapabilities uses navigator.standalone on iOS', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(() => ({ matches: false })),
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: { ...originalNavigator, standalone: true },
      configurable: true,
    });
    const caps = detectPwaCapabilities();
    expect(caps.find((c) => c.id === 'standalone')?.supported).toBe(true);
  });
});
