/**
 * Encrypted storage for Nextcloud app password (R-008).
 * Server/user/path stay in sessionStorage only — see useDataPanelSync.
 */
import { retry } from './retryUtils';
import {
  PBKDF2_ITERATIONS_CURRENT,
  PBKDF2_ITERATIONS_SYNC_CREDENTIALS_V2,
} from './cryptoConstants';

const DB_NAME = 'culinasync_secure';
const STORE_NAME = 'keys';
const KEY_ID = 'nextcloud_app_password';
/** v3 = 600k PBKDF2; v2 blobs remain decryptable with 250k. */
const ENCRYPTION_VERSION = 3;
const ENCRYPTION_VERSION_LEGACY = 2;

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

const toArrayBuffer = (value: Uint8Array): ArrayBuffer =>
  value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;

const deriveEncryptionKey = async (salt: Uint8Array, iterations: number): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(getFingerprint()),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
};

const encryptSecret = async (plaintext: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEncryptionKey(salt, PBKDF2_ITERATIONS_CURRENT);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    textEncoder.encode(plaintext),
  );

  return JSON.stringify({
    version: ENCRYPTION_VERSION,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
  } satisfies EncryptedPayload);
};

const decryptSecret = async (storedValue: string): Promise<string | null> => {
  try {
    const parsed = JSON.parse(storedValue) as EncryptedPayload;
    if (
      !hasWebCrypto() ||
      (parsed.version !== ENCRYPTION_VERSION && parsed.version !== ENCRYPTION_VERSION_LEGACY)
    ) {
      return null;
    }
    const salt = fromBase64(parsed.salt);
    const iv = fromBase64(parsed.iv);
    const ciphertext = fromBase64(parsed.ciphertext);
    const iterations =
      parsed.version === ENCRYPTION_VERSION
        ? PBKDF2_ITERATIONS_CURRENT
        : PBKDF2_ITERATIONS_SYNC_CREDENTIALS_V2;
    const key = await deriveEncryptionKey(salt, iterations);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(ciphertext),
    );
    return textDecoder.decode(decrypted);
  } catch {
    return null;
  }
};

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
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

export const saveNextcloudAppPassword = async (password: string): Promise<void> => {
  if (!password.trim()) {
    return deleteNextcloudAppPassword();
  }
  await retry(async () => {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      id: KEY_ID,
      value: await encryptSecret(password),
      updatedAt: Date.now(),
    });
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        idb.close();
        resolve();
      };
      tx.onerror = () => {
        idb.close();
        reject(tx.error);
      };
    });
  }, 3, 500);
};

export const loadNextcloudAppPassword = async (): Promise<string | null> => {
  try {
    return await retry(async () => {
      const idb = await openDB();
      const tx = idb.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(KEY_ID);
      return new Promise<string | null>((resolve, reject) => {
        request.onsuccess = () => {
          idb.close();
          const raw = request.result?.value as string | undefined;
          if (!raw) {
            resolve(null);
            return;
          }
          void decryptSecret(raw).then(resolve);
        };
        request.onerror = () => {
          idb.close();
          reject(request.error);
        };
      });
    }, 3, 500);
  } catch {
    return null;
  }
};

export const deleteNextcloudAppPassword = async (): Promise<void> => {
  await retry(async () => {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(KEY_ID);
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        idb.close();
        resolve();
      };
      tx.onerror = () => {
        idb.close();
        reject(tx.error);
      };
    });
  }, 3, 500);
};
