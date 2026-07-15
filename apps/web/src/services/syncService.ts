import { importData } from './repositories/dataRepository';
import { mergeBackupWithConflictResolution } from './backupMergeService';
import { logAppError } from './errorLoggingService';
import type { ResolvedSyncTarget } from './syncTarget';
import { downloadEncryptedBlob, uploadEncryptedBlob } from './syncTransport';
import type { FullBackupData } from '../types';
import { parseFullBackupData } from './backupSchemas';

export type SyncRestoreMode = 'replace' | 'merge';

const LEGACY_SALT = new TextEncoder().encode('culinasync-salt');
const BACKUP_FORMAT_HEADER = new Uint8Array([67, 83, 66, 50]);
const BACKUP_SALT_LENGTH = 16;
const BACKUP_IV_LENGTH = 12;

// Crypto helpers (AES-GCM, passwortbasiert)
async function getKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const normalizedSalt = salt.slice();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: normalizedSalt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

const hasVersionedBackupHeader = (blob: Uint8Array) => BACKUP_FORMAT_HEADER.every((value, index) => blob[index] === value);

export async function encryptBackup(data: FullBackupData, password: string): Promise<Uint8Array> {
  const salt = window.crypto.getRandomValues(new Uint8Array(BACKUP_SALT_LENGTH));
  const key = await getKeyFromPassword(password, salt);
  const iv = window.crypto.getRandomValues(new Uint8Array(BACKUP_IV_LENGTH));
  const enc = new TextEncoder();
  const json = JSON.stringify(data);
  const ciphertext = new Uint8Array(
    await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(json)
    )
  );
  // Format v2: [CSB2 header (4 bytes)] + [Salt (16 bytes)] + [IV (12 bytes)] + [Ciphertext]
  const result = new Uint8Array(BACKUP_FORMAT_HEADER.length + salt.length + iv.length + ciphertext.length);
  result.set(BACKUP_FORMAT_HEADER, 0);
  result.set(salt, BACKUP_FORMAT_HEADER.length);
  result.set(iv, BACKUP_FORMAT_HEADER.length + salt.length);
  result.set(ciphertext, BACKUP_FORMAT_HEADER.length + salt.length + iv.length);
  return result;
}

export async function decryptBackup(blob: Uint8Array, password: string): Promise<FullBackupData> {
  const isVersionedBackup = blob.length > BACKUP_FORMAT_HEADER.length + BACKUP_SALT_LENGTH + BACKUP_IV_LENGTH && hasVersionedBackupHeader(blob);
  const saltOffset = isVersionedBackup ? BACKUP_FORMAT_HEADER.length : 0;
  const salt = isVersionedBackup ? blob.slice(saltOffset, saltOffset + BACKUP_SALT_LENGTH) : LEGACY_SALT;
  const ivOffset = isVersionedBackup ? saltOffset + BACKUP_SALT_LENGTH : 0;
  const ciphertextOffset = ivOffset + BACKUP_IV_LENGTH;
  const key = await getKeyFromPassword(password, salt);
  const iv = blob.slice(ivOffset, ciphertextOffset);
  const ciphertext = blob.slice(ciphertextOffset);
  const dec = new TextDecoder();
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
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
    const encrypted = await downloadEncryptedBlob(target.url, target.auth);
    const data = await decryptBackup(encrypted, password);
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

export const getLastSyncTimestamp = (): number | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem('culinaSyncLastSyncAt');
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};
