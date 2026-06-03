import { useEffect } from 'react';
import { logAppError } from '../services/errorLoggingService';

export const useAppBadge = (uncheckedShoppingCount: number | undefined): void => {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('setAppBadge' in navigator)) {
      return;
    }

    const nav = navigator as Navigator & {
      setAppBadge?: (count: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };

    const apply = async () => {
      try {
        if (uncheckedShoppingCount === undefined) return;
        if (uncheckedShoppingCount > 0) {
          await nav.setAppBadge?.(Math.min(uncheckedShoppingCount, 99));
        } else {
          await nav.clearAppBadge?.();
        }
      } catch (error) {
        void logAppError(error, 'pwa.app-badge');
      }
    };

    void apply();
  }, [uncheckedShoppingCount]);
};
