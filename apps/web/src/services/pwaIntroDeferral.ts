import { INTRO_GATES_ENABLED } from '../config/featureFlags';

const ONBOARDED_KEY = 'culinaSyncOnboarded';

export type DeferredPwaToast = {
  message: string;
  type: 'success' | 'error' | 'info';
};

const deferredToasts: DeferredPwaToast[] = [];

/** Matches first-run intro detection in App (`!culinaSyncOnboarded`). */
export const isFirstRunIntroPending = (): boolean => {
  if (!INTRO_GATES_ENABLED) {
    return false;
  }
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  return !window.localStorage.getItem(ONBOARDED_KEY);
};

export const deferOrEmitPwaToast = (
  emit: (toast: DeferredPwaToast) => void,
  toast: DeferredPwaToast,
): void => {
  if (isFirstRunIntroPending()) {
    deferredToasts.push(toast);
    return;
  }
  emit(toast);
};

export const flushDeferredPwaToasts = (emit: (toast: DeferredPwaToast) => void): void => {
  if (deferredToasts.length === 0) {
    return;
  }
  const pending = deferredToasts.splice(0, deferredToasts.length);
  for (const toast of pending) {
    emit(toast);
  }
};

export const clearDeferredPwaToastsForTests = (): void => {
  deferredToasts.length = 0;
};
