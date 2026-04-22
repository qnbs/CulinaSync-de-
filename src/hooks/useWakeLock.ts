import { useState, useEffect, useCallback, useRef } from 'react';

type WakeLockSentinel = EventTarget & {
  released: boolean;
  type: 'screen';
  release: () => Promise<void>;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinel>;
  };
};

export const useWakeLock = (): [boolean, () => Promise<void>, () => Promise<void>] => {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    const wakeLockNavigator = navigator as WakeLockNavigator;
    if (wakeLockNavigator.wakeLock && !wakeLockRef.current) {
      try {
        const lock = await wakeLockNavigator.wakeLock.request('screen');
        wakeLockRef.current = lock;
        setIsLocked(true);
        console.log('Wake Lock is active.');
        lock.addEventListener('release', () => {
          console.log('Wake Lock was released.');
          setIsLocked(false);
          wakeLockRef.current = null;
        });
      } catch (error) {
        const message = error instanceof Error ? `${error.name}, ${error.message}` : String(error);
        console.error(`Wake Lock Error: ${message}`);
        setIsLocked(false);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsLocked(false);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (wakeLockRef.current && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        // Use a variable to avoid race conditions with the ref
        const lock = wakeLockRef.current;
        wakeLockRef.current = null;
        lock.release();
      }
    };
  }, [requestWakeLock]);

  return [isLocked, requestWakeLock, releaseWakeLock];
};
