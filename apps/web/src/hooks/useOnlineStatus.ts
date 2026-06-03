import { useEffect, useState } from 'react';

const readNavigatorOnline = (): boolean =>
  typeof navigator === 'undefined' ? true : navigator.onLine;

// QNBS-v3: Zentraler Online-Status für PWA-Offline-Banner und Reconnect-Toasts
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(readNavigatorOnline);

  useEffect(() => {
    const syncOnlineState = () => setIsOnline(readNavigatorOnline());
    // QNBS-v3: Initial-Sync — Playwright/offline-first load; Events können vor Listener-Attach feuern
    syncOnlineState();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncOnlineState();
      }
    };
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        syncOnlineState();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  return isOnline;
}
