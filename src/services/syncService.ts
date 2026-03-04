import { exportFullDataAsJson } from './exportService';
import { importData } from './repositories/dataRepository';
import type { FullBackupData } from '../types';

// Crypto helpers (AES-GCM, passwortbasiert)
async function getKeyFromPassword(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
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
      salt: enc.encode('culinasync-salt'),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptBackup(data: FullBackupData, password: string): Promise<Uint8Array> {
  const key = await getKeyFromPassword(password);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const json = JSON.stringify(data);
  const ciphertext = new Uint8Array(
    await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(json)
    )
  );
  // Format: [IV (12 bytes)] + [Ciphertext]
  const result = new Uint8Array(iv.length + ciphertext.length);
  result.set(iv, 0);
  result.set(ciphertext, iv.length);
  return result;
}

export async function decryptBackup(blob: Uint8Array, password: string): Promise<FullBackupData> {
  const key = await getKeyFromPassword(password);
  const iv = blob.slice(0, 12);
  const ciphertext = blob.slice(12);
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
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: data
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
