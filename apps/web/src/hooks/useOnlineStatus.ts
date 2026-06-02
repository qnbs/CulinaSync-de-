import { useEffect, useState } from 'react';

const readNavigatorOnline = (): boolean =>
  typeof navigator === 'undefined' ? true : navigator.onLine;

// QNBS-v3: Zentraler Online-Status für PWA-Offline-Banner und Reconnect-Toasts
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(readNavigatorOnline);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
