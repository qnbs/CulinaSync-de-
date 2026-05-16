import { importData } from './repositories/dataRepository';
import type { FullBackupData } from '../types';

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
  return JSON.parse(dec.decode(decrypted));
}

// --- Cloud Upload/Download (WebDAV, S3, Custom) ---
// Hier nur Demo: Upload/Download zu/von URL mit fetch (z. B. WebDAV-Server)

export async function uploadEncryptedBackup(url: string, data: Uint8Array, token?: string) {
  const uploadBuffer = new Uint8Array(data);
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: new Blob([uploadBuffer.buffer], { type: 'application/octet-stream' })
  });
  if (!res.ok) throw new Error('Upload fehlgeschlagen');
}

export async function downloadEncryptedBackup(url: string, token?: string): Promise<Uint8Array> {
  const res = await fetch(url, {
    method: 'GET',
    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
  });
  if (!res.ok) throw new Error('Download fehlgeschlagen');
  return new Uint8Array(await res.arrayBuffer());
}

// --- High-level Sync-API ---
export async function syncUpload(password: string, url: string, token?: string) {
  const data = await (await import('./exportService')).getFullData();
  const encrypted = await encryptBackup(data, password);
  await uploadEncryptedBackup(url, encrypted, token);
}

export async function syncDownload(password: string, url: string, token?: string) {
  const encrypted = await downloadEncryptedBackup(url, token);
  const data = await decryptBackup(encrypted, password);
  await importData(data);
}
