/** R-008: Nextcloud metadata in sessionStorage (tab-scoped); migrates legacy localStorage once. */
export function readSyncPref(key: string, fallback = ''): string {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const fromSession = sessionStorage.getItem(key);
    if (fromSession !== null) {
      return fromSession;
    }
    const legacy = localStorage.getItem(key);
    if (legacy !== null) {
      sessionStorage.setItem(key, legacy);
      localStorage.removeItem(key);
      return legacy;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

export function writeSyncPref(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
