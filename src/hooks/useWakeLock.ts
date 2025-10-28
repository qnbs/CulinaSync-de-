import { useState, useEffect, useCallback, useRef } from 'react';

type WakeLockSentinel = EventTarget & {
  released: boolean;
  type: 'screen';
  release: () => Promise<void>;
};

export const useWakeLock = (): [boolean, () => Promise<void>, () => Promise<void>] => {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && !wakeLockRef.current) {
      try {
        const lock = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current = lock;
        setIsLocked(true);
        console.log('Wake Lock is active.');
        lock.addEventListener('release', () => {
          console.log('Wake Lock was released.');
          setIsLocked(false);
          wakeLockRef.current = null;
        });
      } catch (err: any) {
        console.error(`Wake Lock Error: ${err.name}, ${err.message}`);
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
