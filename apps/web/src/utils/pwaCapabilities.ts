export type PwaCapabilityId =
  | 'install'
  | 'standalone'
  | 'serviceWorker'
  | 'shareTarget'
  | 'fileHandling'
  | 'appBadge'
  | 'backgroundSync'
  | 'push'
  | 'periodicSync';

export type PwaCapability = {
  id: PwaCapabilityId;
  supported: boolean;
};

const hasStandaloneDisplay = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  const matchStandalone =
    typeof window.matchMedia === 'function' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches);
  return matchStandalone || nav.standalone === true;
};

export const detectPwaCapabilities = (): PwaCapability[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  return [
    { id: 'install', supported: 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window },
    { id: 'standalone', supported: hasStandaloneDisplay() },
    { id: 'serviceWorker', supported: 'serviceWorker' in navigator },
    { id: 'shareTarget', supported: 'share' in navigator },
    { id: 'fileHandling', supported: 'launchQueue' in window },
    { id: 'appBadge', supported: 'setAppBadge' in navigator },
    { id: 'backgroundSync', supported: 'SyncManager' in window },
    { id: 'push', supported: 'PushManager' in window },
    { id: 'periodicSync', supported: 'PeriodicSyncManager' in window },
  ];
};

export const isIosSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
};

export const canShowNativeInstall = (): boolean =>
  typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window;
