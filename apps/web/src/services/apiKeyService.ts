import { retry } from "./retryUtils";
/**
 * API Key Management Service
 * 
 * Stores the user-provided Gemini API key encrypted in IndexedDB when Web Crypto is available.
 * Falls back to legacy obfuscation only on platforms without crypto support.
 * NEVER stores keys in localStorage, sessionStorage, or the build bundle.
 */

const DB_NAME = 'culinasync_secure';
const STORE_NAME = 'keys';
const KEY_ID = 'gemini_api_key';
const ENCRYPTION_VERSION = 2;
const PBKDF2_ITERATIONS = 250000;

type EncryptedPayload = {
  version: number;
  salt: string;
  iv: string;
  ciphertext: string;
};

const getFingerprint = (): string => {
  const nav = navigator;
  return btoa(`${nav.userAgent}${nav.language}${screen.width}${screen.height}`).slice(0, 32);
};

const legacyObfuscate = (plaintext: string): string => {
  const fp = getFingerprint();
  const encoded = Array.from(plaintext).map((char, i) =>
    String.fromCharCode(char.charCodeAt(0) ^ fp.charCodeAt(i % fp.length))
  ).join('');
  return btoa(encoded);
};

const legacyDeobfuscate = (ciphertext: string): string => {
  const fp = getFingerprint();
  const decoded = atob(ciphertext);
  return Array.from(decoded).map((char, i) =>
    String.fromCharCode(char.charCodeAt(0) ^ fp.charCodeAt(i % fp.length))
  ).join('');
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const hasWebCrypto = () => typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';

const toBase64 = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes));
};

const fromBase64 = (value: string): Uint8Array => {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const toArrayBuffer = (value: Uint8Array): ArrayBuffer => {
  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
};

const deriveEncryptionKey = async (salt: Uint8Array): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(getFingerprint()),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
};

const encryptApiKey = async (plaintext: string): Promise<string> => {
  if (!hasWebCrypto()) {
    return legacyObfuscate(plaintext);
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEncryptionKey(salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    textEncoder.encode(plaintext)
  );

  const payload: EncryptedPayload = {
    version: ENCRYPTION_VERSION,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
  };

  return JSON.stringify(payload);
};

const isEncryptedPayload = (value: unknown): value is EncryptedPayload => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Partial<EncryptedPayload>;
  return payload.version === ENCRYPTION_VERSION
    && typeof payload.salt === 'string'
    && typeof payload.iv === 'string'
    && typeof payload.ciphertext === 'string';
};

const decryptStoredValue = async (storedValue: string): Promise<{ key: string; legacy: boolean }> => {
  try {
    const parsed = JSON.parse(storedValue) as unknown;
    if (isEncryptedPayload(parsed) && hasWebCrypto()) {
      const salt = fromBase64(parsed.salt);
      const iv = fromBase64(parsed.iv);
      const ciphertext = fromBase64(parsed.ciphertext);
      const key = await deriveEncryptionKey(salt);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: toArrayBuffer(iv) },
        key,
        toArrayBuffer(ciphertext)
      );

      return { key: textDecoder.decode(decrypted), legacy: false };
    }
  } catch {
    // Fall back to legacy decoding below.
  }

  return { key: legacyDeobfuscate(storedValue), legacy: true };
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
    store.put({ id: KEY_ID, value: await encryptApiKey(key), updatedAt: Date.now() });
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
              decryptStoredValue(request.result.value)
                .then(({ key, legacy }) => {
                  if (legacy && hasWebCrypto()) {
                    void saveApiKey(key).catch(() => undefined);
                  }
                  resolve(key);
                })
                .catch(() => resolve(null));
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
