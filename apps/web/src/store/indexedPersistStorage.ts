import { openStateDexie, stateDexie } from './stateDexie';

type PersistStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const DEBOUNCE_MS = 1000;

const noopStorage: PersistStorage = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
};

let pending: { key: string; value: string } | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const flushPending = async (): Promise<void> => {
  if (!pending) {
    return;
  }
  const payload = pending;
  pending = null;
  await openStateDexie();
  await stateDexie.kv.put({ key: payload.key, value: payload.value });
};

const scheduleFlush = (): void => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void flushPending();
  }, DEBOUNCE_MS);
};

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      void flushPending();
    }
  });
}

const migrateLegacyLocalStorage = async (key: string): Promise<string | null> => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    const legacy = window.localStorage.getItem(key);
    if (legacy !== null) {
      window.localStorage.removeItem(key);
      await openStateDexie();
      await stateDexie.kv.put({ key, value: legacy });
      return legacy;
    }
  } catch {
    return null;
  }
  return null;
};

const storage: PersistStorage =
  typeof indexedDB !== 'undefined'
    ? {
        getItem: async (key) => {
          await openStateDexie();
          const row = await stateDexie.kv.get(key);
          if (row) {
            return row.value;
          }
          return migrateLegacyLocalStorage(key);
        },
        setItem: async (key, value) => {
          pending = { key, value };
          scheduleFlush();
        },
        removeItem: async (key) => {
          pending = null;
          if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
          }
          await openStateDexie();
          await stateDexie.kv.delete(key);
          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              window.localStorage.removeItem(key);
            } catch {
              /* ignore */
            }
          }
        },
      }
    : noopStorage;

export default storage;
