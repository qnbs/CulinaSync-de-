type PwaUpdateFn = (reloadPage?: boolean) => Promise<void>;

let applyUpdateFn: PwaUpdateFn | null = null;

export const setPwaUpdateHandler = (fn: PwaUpdateFn | null): void => {
  applyUpdateFn = fn;
};

export const applyPwaUpdate = async (reloadPage = true): Promise<void> => {
  if (!applyUpdateFn) {
    if (reloadPage) {
      window.location.reload();
    }
    return;
  }
  await applyUpdateFn(reloadPage);
};

export const skipWaitingServiceWorker = async (): Promise<void> => {
  const registration = await navigator.serviceWorker?.getRegistration();
  if (!registration?.waiting) {
    return;
  }
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
};
