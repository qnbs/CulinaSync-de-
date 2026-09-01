import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePwaInstall } from '../usePwaInstall';
import type { BeforeInstallPromptEvent } from '../../types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../utils/pwaCapabilities', () => ({
  canShowNativeInstall: () => true,
  isIosSafari: () => false,
}));

const makeInstallEvent = () =>
  ({
    preventDefault: vi.fn(),
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
  }) as unknown as BeforeInstallPromptEvent;

describe('usePwaInstall', () => {
  const addToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({ matches: false })),
    });
  });

  const dispatchInstallPrompt = () => {
    const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & BeforeInstallPromptEvent;
    Object.assign(event, makeInstallEvent());
    window.dispatchEvent(event);
  };

  it('defers install reminder while intro gates are active', () => {
    const { result } = renderHook(() => usePwaInstall(addToast, { deferForIntro: true }));

    act(() => {
      dispatchInstallPrompt();
    });

    expect(result.current.showInstallDialog).toBe(false);
  });

  it('shows install reminder after intro gates dismiss', () => {
    const { result, rerender } = renderHook(
      ({ deferForIntro }) => usePwaInstall(addToast, { deferForIntro }),
      { initialProps: { deferForIntro: true } },
    );

    act(() => {
      dispatchInstallPrompt();
    });
    expect(result.current.showInstallDialog).toBe(false);

    rerender({ deferForIntro: false });
    expect(result.current.showInstallDialog).toBe(true);
  });

  it('handleInstallDismiss persists permanent dismiss', () => {
    const { result } = renderHook(() => usePwaInstall(addToast, { deferForIntro: false }));

    act(() => {
      dispatchInstallPrompt();
    });
    act(() => {
      result.current.handleInstallDismiss();
    });

    expect(localStorage.getItem('culinaSyncInstallDismissed')).toBe('true');
    expect(result.current.showInstallDialog).toBe(false);
  });
});
