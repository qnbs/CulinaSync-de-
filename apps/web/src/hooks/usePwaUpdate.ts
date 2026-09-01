import { useCallback, useEffect, useRef, useState } from 'react';
import { applyPwaUpdate, skipWaitingServiceWorker } from '../services/pwaRegistration';

const FIRST_RUN_UPDATE_DELAY_MS = 1000;

type UsePwaUpdateOptions = {
  /** When true (intro gates visible), queue SW update toast until gates dismiss. */
  deferForIntro?: boolean;
};

export const usePwaUpdate = (options?: UsePwaUpdateOptions) => {
  const deferForIntro = options?.deferForIntro ?? false;
  const [showUpdateReadyNotice, setShowUpdateReadyNotice] = useState(false);
  const [queuedUpdate, setQueuedUpdate] = useState(false);
  const deferredByIntroRef = useRef(false);
  const showNoticeRef = useRef(false);

  useEffect(() => {
    showNoticeRef.current = showUpdateReadyNotice;
  }, [showUpdateReadyNotice]);

  useEffect(() => {
    const handleUpdateReady = () => {
      if (showNoticeRef.current) {
        return;
      }
      if (deferForIntro) {
        deferredByIntroRef.current = true;
      }
      setQueuedUpdate(true);
    };
    window.addEventListener('culinasync:pwa-update-ready', handleUpdateReady);
    return () => window.removeEventListener('culinasync:pwa-update-ready', handleUpdateReady);
  }, [deferForIntro]);

  // QNBS-v3: First-run chrome — intro gates first; SW update after dismiss or 1s when no gates
  useEffect(() => {
    if (deferForIntro || !queuedUpdate) {
      return;
    }

    const delayMs = deferredByIntroRef.current ? 0 : FIRST_RUN_UPDATE_DELAY_MS;
    const timer = window.setTimeout(() => {
      deferredByIntroRef.current = false;
      setQueuedUpdate(false);
      setShowUpdateReadyNotice(true);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [deferForIntro, queuedUpdate]);

  const handleReloadForUpdate = useCallback(async () => {
    setShowUpdateReadyNotice(false);
    await skipWaitingServiceWorker();
    await applyPwaUpdate(true);
  }, []);

  const dismissUpdateNotice = useCallback(() => {
    setShowUpdateReadyNotice(false);
    setQueuedUpdate(false);
  }, []);

  return {
    showUpdateReadyNotice,
    handleReloadForUpdate,
    dismissUpdateNotice,
  };
};
