import { retry } from "./retryUtils";
import { logAppError } from "./errorLoggingService";
/**
 * API Key Management Service
 *
 * Stores the user-provided Gemini API key in IndexedDB (never localStorage,
 * sessionStorage, or the build bundle). Two protection modes:
 *  - 'device'     — default. AES-GCM key derived (PBKDF2) from a device
 *                   fingerprint. This is OBFUSCATION, not real protection:
 *                   anyone with access to this browser/profile can recover it.
 *  - 'passphrase' — opt-in. AES-GCM key derived from a user passphrase that is
 *                   never stored. Real encryption; the key is unrecoverable
 *                   without the passphrase (must be unlocked once per session).
 *
 * Decryption failures are surfaced (typed state), never silently swallowed into
 * a legacy-obfuscation fall-through that would hand back a garbage "key".
 */

const DB_NAME = 'culinasync_secure';
const STORE_NAME = 'keys';
const KEY_ID = 'gemini_api_key';
const ENCRYPTION_VERSION = 3;
const PBKDF2_ITERATIONS = 250000;

type KeyMode = 'device' | 'passphrase';

type EncryptedPayload = {
  version: number;
  mode?: KeyMode; // absent in legacy v2 payloads → treated as 'device'
  salt: string;
  iv: string;
  ciphertext: string;
};

/** Discriminated result so callers can distinguish missing / locked / corrupt. */
export type ApiKeyState =
  | { status: 'ok'; key: string }
  | { status: 'missing' }
  | { status: 'locked' } // passphrase-protected key present but not unlocked this session
  | { status: 'error' }; // stored but decryption failed (corrupt / wrong environment)

type DecryptOutcome =
  | { status: 'ok'; key: string; upgrade: boolean }
  | { status: 'legacy'; key: string }
  | { status: 'locked' }
  | { status: 'error'; version?: number };

// In-memory only — the passphrase is never persisted. Cleared on delete/reload.
let sessionPassphrase: string | null = null;

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

// QNBS-v3: PBKDF2-Passwort aus Passphrase ODER Fingerprint | echte vs. Obfuskations-Verschlüsselung | password-Parameter statt hartverdrahtetem Fingerprint (§2.9)
const deriveEncryptionKey = async (salt: Uint8Array, password: string): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
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

const encryptApiKey = async (plaintext: string, passphrase?: string): Promise<string> => {
  if (!hasWebCrypto()) {
    return legacyObfuscate(plaintext);
  }

  const mode: KeyMode = passphrase ? 'passphrase' : 'device';
  const password = passphrase ?? getFingerprint();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEncryptionKey(salt, password);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    textEncoder.encode(plaintext)
  );

  const payload: EncryptedPayload = {
    version: ENCRYPTION_VERSION,
    mode,
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
  return (payload.version === 2 || payload.version === 3)
    && typeof payload.salt === 'string'
    && typeof payload.iv === 'string'
    && typeof payload.ciphertext === 'string'
    && (payload.mode === undefined || payload.mode === 'device' || payload.mode === 'passphrase');
};

const decryptStoredValue = async (storedValue: string): Promise<DecryptOutcome> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(storedValue);
  } catch {
    // Not JSON → a genuinely legacy (pre-encryption) obfuscated string.
    return { status: 'legacy', key: legacyDeobfuscate(storedValue) };
  }

  if (!isEncryptedPayload(parsed) || !hasWebCrypto()) {
    return { status: 'legacy', key: legacyDeobfuscate(storedValue) };
  }

  const mode: KeyMode = parsed.mode ?? 'device';
  const password = mode === 'passphrase' ? sessionPassphrase : getFingerprint();
  if (password === null) {
    return { status: 'locked' };
  }

  try {
    const salt = fromBase64(parsed.salt);
    const iv = fromBase64(parsed.iv);
    const ciphertext = fromBase64(parsed.ciphertext);
    const key = await deriveEncryptionKey(salt, password);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(ciphertext)
    );
    return { status: 'ok', key: textDecoder.decode(decrypted), upgrade: parsed.version < ENCRYPTION_VERSION };
  } catch {
    // Surface the failure — do NOT fall back to legacy deobfuscation, which
    // would hand back garbage that then fails opaquely as an "invalid API key".
    return { status: 'error', version: parsed.version };
  }
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

const getStoredValue = (): Promise<string | null> =>
  retry(async () => {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(KEY_ID);
    return new Promise<string | null>((resolve, reject) => {
      request.onsuccess = () => { idb.close(); resolve((request.result?.value as string | undefined) ?? null); };
      request.onerror = () => { idb.close(); reject(request.error); };
    });
  }, 3, 500);

/**
 * @param key plaintext API key
 * @param passphrase optional — when provided, the key is encrypted with real
 *        (passphrase-derived) encryption instead of device obfuscation.
 */
export const saveApiKey = async (key: string, passphrase?: string): Promise<void> => {
  const value = await encryptApiKey(key, passphrase);
  await retry(async () => {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id: KEY_ID, value, updatedAt: Date.now() });
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => { idb.close(); resolve(); };
      tx.onerror = () => { idb.close(); reject(tx.error); };
    });
  }, 3, 500);
  if (passphrase) {
    sessionPassphrase = passphrase; // keep unlocked for the rest of the session
  }
};

/** Full state — lets the UI distinguish missing vs locked vs corrupt. */
export const loadApiKeyState = async (): Promise<ApiKeyState> => {
  let stored: string | null;
  try {
    stored = await getStoredValue();
  } catch (error) {
    void logAppError(error, 'apiKeyService.read');
    return { status: 'error' };
  }
  if (!stored) {
    return { status: 'missing' };
  }

  const outcome = await decryptStoredValue(stored);
  switch (outcome.status) {
    case 'ok':
      if (outcome.upgrade && hasWebCrypto()) {
        void saveApiKey(outcome.key).catch(() => undefined); // upgrade v2 → v3 (device)
      }
      return { status: 'ok', key: outcome.key };
    case 'legacy':
      if (hasWebCrypto()) {
        void saveApiKey(outcome.key).catch(() => undefined); // migrate legacy → encrypted
      }
      return { status: 'ok', key: outcome.key };
    case 'locked':
      return { status: 'locked' };
    default:
      void logAppError('API key decryption failed', 'apiKeyService.decrypt', { version: outcome.version });
      return { status: 'error' };
  }
};

export const loadApiKey = async (): Promise<string | null> => {
  const state = await loadApiKeyState();
  return state.status === 'ok' ? state.key : null;
};

/**
 * Unlock a passphrase-protected key for this session. Returns true if the
 * passphrase decrypts the stored key, false otherwise (session stays locked).
 */
export const unlockApiKey = async (passphrase: string): Promise<boolean> => {
  const previous = sessionPassphrase;
  sessionPassphrase = passphrase;
  const state = await loadApiKeyState();
  if (state.status === 'ok') {
    return true;
  }
  sessionPassphrase = previous;
  return false;
};

export const deleteApiKey = async (): Promise<void> => {
  sessionPassphrase = null;
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

/** True only when a usable (decryptable) key is available right now. */
export const hasApiKey = async (): Promise<boolean> => {
  const state = await loadApiKeyState();
  return state.status === 'ok';
};

/** Lightweight status probe for UI (never exposes the key material). */
export const getApiKeyStatus = async (): Promise<ApiKeyState['status']> => {
  const state = await loadApiKeyState();
  return state.status;
};
