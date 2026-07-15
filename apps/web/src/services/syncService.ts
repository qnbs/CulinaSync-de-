import { importData } from './repositories/dataRepository';
import { mergeBackupWithConflictResolution } from './backupMergeService';
import { logAppError } from './errorLoggingService';
import type { ResolvedSyncTarget } from './syncTarget';
import { downloadEncryptedBlob, uploadEncryptedBlob } from './syncTransport';
import type { FullBackupData } from '../types';
import { parseFullBackupData } from './backupSchemas';
import {
  PBKDF2_ITERATIONS_BACKUP_LEGACY,
  PBKDF2_ITERATIONS_CURRENT,
} from './cryptoConstants';

export type SyncRestoreMode = 'replace' | 'merge';

const LEGACY_SALT = new TextEncoder().encode('culinasync-salt');
/** CSB2: random salt + 100k PBKDF2 (legacy versioned). */
const BACKUP_FORMAT_HEADER_V2 = new Uint8Array([67, 83, 66, 50]);
/** CSB3: random salt + OWASP 600k PBKDF2 (current). */
const BACKUP_FORMAT_HEADER_V3 = new Uint8Array([67, 83, 66, 51]);
const BACKUP_SALT_LENGTH = 16;
const BACKUP_IV_LENGTH = 12;

async function getKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const normalizedSalt = salt.slice();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: normalizedSalt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

const headerMatches = (blob: Uint8Array, header: Uint8Array) =>
  header.every((value, index) => blob[index] === value);

export async function encryptBackup(data: FullBackupData, password: string): Promise<Uint8Array> {
  const salt = window.crypto.getRandomValues(new Uint8Array(BACKUP_SALT_LENGTH));
  const key = await getKeyFromPassword(password, salt, PBKDF2_ITERATIONS_CURRENT);
  const iv = window.crypto.getRandomValues(new Uint8Array(BACKUP_IV_LENGTH));
  const enc = new TextEncoder();
  const json = JSON.stringify(data);
  const ciphertext = new Uint8Array(
    await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(json)),
  );
  // QNBS-v3: CSB3 — 600k PBKDF2 | CSB2/Legacy bleiben decrypt-fähig
  const header = BACKUP_FORMAT_HEADER_V3;
  const result = new Uint8Array(header.length + salt.length + iv.length + ciphertext.length);
  result.set(header, 0);
  result.set(salt, header.length);
  result.set(iv, header.length + salt.length);
  result.set(ciphertext, header.length + salt.length + iv.length);
  return result;
}

export async function decryptBackup(blob: Uint8Array, password: string): Promise<FullBackupData> {
  const isV3 =
    blob.length > BACKUP_FORMAT_HEADER_V3.length + BACKUP_SALT_LENGTH + BACKUP_IV_LENGTH &&
    headerMatches(blob, BACKUP_FORMAT_HEADER_V3);
  const isV2 =
    !isV3 &&
    blob.length > BACKUP_FORMAT_HEADER_V2.length + BACKUP_SALT_LENGTH + BACKUP_IV_LENGTH &&
    headerMatches(blob, BACKUP_FORMAT_HEADER_V2);
  const isVersionedBackup = isV2 || isV3;
  const headerLen = isV3
    ? BACKUP_FORMAT_HEADER_V3.length
    : isV2
      ? BACKUP_FORMAT_HEADER_V2.length
      : 0;
  const saltOffset = isVersionedBackup ? headerLen : 0;
  const salt = isVersionedBackup ? blob.slice(saltOffset, saltOffset + BACKUP_SALT_LENGTH) : LEGACY_SALT;
  const ivOffset = isVersionedBackup ? saltOffset + BACKUP_SALT_LENGTH : 0;
  const ciphertextOffset = ivOffset + BACKUP_IV_LENGTH;
  const iterations = isV3 ? PBKDF2_ITERATIONS_CURRENT : PBKDF2_ITERATIONS_BACKUP_LEGACY;
  const key = await getKeyFromPassword(password, salt, iterations);
  const iv = blob.slice(ivOffset, ciphertextOffset);
  const ciphertext = blob.slice(ciphertextOffset);
  const dec = new TextDecoder();
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );
  const raw: unknown = JSON.parse(dec.decode(decrypted));
  return parseFullBackupData(raw);
}

// --- High-level Sync-API (generic WebDAV URL + Nextcloud via ResolvedSyncTarget) ---
export async function syncUpload(password: string, target: ResolvedSyncTarget) {
  try {
    const data = await (await import('./exportService')).getFullData();
    const encrypted = await encryptBackup(data, password);
    await uploadEncryptedBlob(target.url, encrypted, target.auth);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('culinaSyncLastSyncAt', String(Date.now()));
    }
  } catch (error) {
    void logAppError(error, 'sync.upload');
    throw error;
  }
}

export async function syncDownload(
  password: string,
  target: ResolvedSyncTarget,
  mode: SyncRestoreMode = 'replace',
) {
  try {
    const blob = await downloadEncryptedBlob(target.url, target.auth);
    const data = await decryptBackup(blob, password);
    if (mode === 'merge') {
      await mergeBackupWithConflictResolution(data);
    } else {
      await importData(data);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('culinaSyncLastSyncAt', String(Date.now()));
    }
  } catch (error) {
    void logAppError(error, 'sync.download');
    throw error;
  }
}

export function getLastSyncTimestamp(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem('culinaSyncLastSyncAt');
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}
