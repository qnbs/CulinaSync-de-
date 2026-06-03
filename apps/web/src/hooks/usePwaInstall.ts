import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BeforeInstallPromptEvent } from '../types';
import { canShowNativeInstall, isIosSafari } from '../utils/pwaCapabilities';
import { logAppError } from '../services/errorLoggingService';

const REMIND_KEY = 'culinaSyncInstallRemindAfter';
const DISMISS_KEY = 'culinaSyncInstallDismissed';

const isStandaloneMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    nav.standalone === true
  );
};

export const usePwaInstall = (addToast: (message: string, type?: 'success' | 'error' | 'info') => void) => {
  const { t } = useTranslation();
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallReminder, setShowInstallReminder] = useState(false);
  const [isStandalone] = useState(isStandaloneMode);
  const [isIos] = useState(isIosSafari);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);

      const dismissedUntil = Number(window.localStorage.getItem(REMIND_KEY) || '0');
      const permanentlyDismissed = window.localStorage.getItem(DISMISS_KEY) === 'true';
      const now = Date.now();

      if (!isStandaloneMode() && !permanentlyDismissed && now >= dismissedUntil) {
        setShowInstallReminder(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = useCallback(async () => {
    if (!installPromptEvent) {
      addToast(t('app.install.unavailable'), 'info');
      return;
    }
    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === 'accepted') {
        addToast(t('app.install.success'), 'success');
        window.localStorage.removeItem(REMIND_KEY);
        window.localStorage.removeItem(DISMISS_KEY);
        setShowInstallReminder(false);
      } else {
        window.localStorage.setItem(REMIND_KEY, String(Date.now() + 3 * 24 * 60 * 60 * 1000));
        setShowInstallReminder(false);
      }
      setInstallPromptEvent(null);
    } catch (error) {
      void logAppError(error, 'app.pwa.install');
      addToast(t('app.install.unavailable'), 'error');
    }
  }, [addToast, installPromptEvent, t]);

  const handleInstallRemindLater = useCallback(() => {
    window.localStorage.setItem(REMIND_KEY, String(Date.now() + 3 * 24 * 60 * 60 * 1000));
    setShowInstallReminder(false);
  }, []);

  const handleInstallDismiss = useCallback(() => {
    window.localStorage.setItem(DISMISS_KEY, 'true');
    setShowInstallReminder(false);
  }, []);

  const showInstallDialog =
    showInstallReminder && !!installPromptEvent && !isStandalone && canShowNativeInstall();

  return {
    installPromptEvent,
    isStandalone,
    isIos,
    showInstallDialog,
    handleInstallPWA,
    handleInstallRemindLater,
    handleInstallDismiss,
  };
};
