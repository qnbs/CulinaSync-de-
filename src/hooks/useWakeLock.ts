import { useState, useEffect, useCallback } from 'react';

export const useWakeLock = (): [boolean, () => Promise<void>, () => Promise<void>] => {
  const [isLocked, setIsLocked] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && !wakeLock) {
      try {
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);
        setIsLocked(true);
        lock.addEventListener('release', () => {
          setIsLocked(false);
          setWakeLock(null);
        });
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
        setIsLocked(false);
      }
    }
  }, [wakeLock]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      setIsLocked(false);
    }
  }, [wakeLock]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (wakeLock && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [wakeLock, requestWakeLock, releaseWakeLock]);

  return [isLocked, requestWakeLock, releaseWakeLock];
};
