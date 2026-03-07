import { retry } from "./retryUtils";
/**
 * Secure API Key Management Service
 * 
 * Stores the user-provided Gemini API key obfuscated in IndexedDB.
 * NEVER stores keys in localStorage, sessionStorage, or the build bundle.
 */

const DB_NAME = 'culinasync_secure';
const STORE_NAME = 'keys';
const KEY_ID = 'gemini_api_key';

const getFingerprint = (): string => {
  const nav = navigator;
  return btoa(`${nav.userAgent}${nav.language}${screen.width}${screen.height}`).slice(0, 32);
};

const obfuscate = (plaintext: string): string => {
  const fp = getFingerprint();
  const encoded = Array.from(plaintext).map((char, i) =>
    String.fromCharCode(char.charCodeAt(0) ^ fp.charCodeAt(i % fp.length))
  ).join('');
  return btoa(encoded);
};

const deobfuscate = (ciphertext: string): string => {
  const fp = getFingerprint();
  const decoded = atob(ciphertext);
  return Array.from(decoded).map((char, i) =>
    String.fromCharCode(char.charCodeAt(0) ^ fp.charCodeAt(i % fp.length))
  ).join('');
};

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const idb = request.result;
      if (!idb.objectStoreNames.contains(STORE_NAME)) {
        idb.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveApiKey = async (key: string): Promise<void> => {
  await retry(async () => {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id: KEY_ID, value: obfuscate(key), updatedAt: Date.now() });
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => { idb.close(); resolve(); };
      tx.onerror = () => { idb.close(); reject(tx.error); };
    });
  }, 3, 500);
};

export const loadApiKey = async (): Promise<string | null> => {
  try {
    return await retry(async () => {
      const idb = await openDB();
      const tx = idb.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(KEY_ID);
      return new Promise<string | null>((resolve, reject) => {
        request.onsuccess = () => {
          idb.close();
          if (request.result?.value) {
            try {
              resolve(deobfuscate(request.result.value));
            } catch {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
        request.onerror = () => { idb.close(); reject(request.error); };
      });
    }, 3, 500);
  } catch {
    return null;
  }
};

export const deleteApiKey = async (): Promise<void> => {
  await retry(async () => {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(KEY_ID);
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => { idb.close(); resolve(); };
      tx.onerror = () => { idb.close(); reject(tx.error); };
    });
  }, 3, 500);
};

export const hasApiKey = async (): Promise<boolean> => {
  const key = await loadApiKey();
  return key !== null && key.length > 0;
};
