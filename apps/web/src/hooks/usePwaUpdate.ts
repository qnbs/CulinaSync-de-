import { useCallback, useEffect, useState } from 'react';
import { applyPwaUpdate, skipWaitingServiceWorker } from '../services/pwaRegistration';

export const usePwaUpdate = () => {
  const [showUpdateReadyNotice, setShowUpdateReadyNotice] = useState(false);

  useEffect(() => {
    const handleUpdateReady = () => setShowUpdateReadyNotice(true);
    window.addEventListener('culinasync:pwa-update-ready', handleUpdateReady);
    return () => window.removeEventListener('culinasync:pwa-update-ready', handleUpdateReady);
  }, []);

  const handleReloadForUpdate = useCallback(async () => {
    setShowUpdateReadyNotice(false);
    await skipWaitingServiceWorker();
    await applyPwaUpdate(true);
  }, []);

  const dismissUpdateNotice = useCallback(() => setShowUpdateReadyNotice(false), []);

  return {
    showUpdateReadyNotice,
    handleReloadForUpdate,
    dismissUpdateNotice,
  };
};
