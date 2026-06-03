import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  decryptBackup,
  encryptBackup,
  getLastSyncTimestamp,
  syncDownload,
  syncUpload,
} from '../syncService';
import type { FullBackupData } from '../../types';

const uploadEncryptedBlob = vi.fn();
const downloadEncryptedBlob = vi.fn();
const getFullData = vi.fn();
const importData = vi.fn();
const mergeBackupWithConflictResolution = vi.fn();
const logAppError = vi.fn();

vi.mock('../syncTransport', () => ({
  uploadEncryptedBlob: (...args: unknown[]) => uploadEncryptedBlob(...args),
  downloadEncryptedBlob: (...args: unknown[]) => downloadEncryptedBlob(...args),
}));

vi.mock('../exportService', () => ({
  getFullData: (...args: unknown[]) => getFullData(...args),
}));

vi.mock('../repositories/dataRepository', () => ({
  importData: (...args: unknown[]) => importData(...args),
}));

vi.mock('../backupMergeService', () => ({
  mergeBackupWithConflictResolution: (...args: unknown[]) =>
    mergeBackupWithConflictResolution(...args),
}));

vi.mock('../errorLoggingService', () => ({
  logAppError: (...args: unknown[]) => logAppError(...args),
}));

const LEGACY_SALT = new TextEncoder().encode('culinasync-salt');

async function createLegacyBackup(data: FullBackupData, password: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: LEGACY_SALT,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(JSON.stringify(data))
    )
  );
  const result = new Uint8Array(iv.length + ciphertext.length);
  result.set(iv, 0);
  result.set(ciphertext, iv.length);
  return result;
}

describe('syncService backup encryption', () => {
  const sampleBackup: FullBackupData = {
    pantry: [],
    recipes: [],
    mealPlan: [],
    shoppingList: [],
    exportedAt: '2026-04-22T10:00:00.000Z',
  };

  it('round-trips encrypted backups with the new salted format', async () => {
    const encrypted = await encryptBackup(sampleBackup, 's3cure-password');

    expect(Array.from(encrypted.slice(0, 4))).toEqual([67, 83, 66, 50]);
    await expect(decryptBackup(encrypted, 's3cure-password')).resolves.toEqual(sampleBackup);
  });

  it('uses a fresh salt so repeated exports differ for the same payload', async () => {
    const first = await encryptBackup(sampleBackup, 's3cure-password');
    const second = await encryptBackup(sampleBackup, 's3cure-password');

    expect(first).not.toEqual(second);
    await expect(decryptBackup(first, 's3cure-password')).resolves.toEqual(sampleBackup);
    await expect(decryptBackup(second, 's3cure-password')).resolves.toEqual(sampleBackup);
  });

  it('keeps decrypting legacy backups created with the fixed salt format', async () => {
    const legacyBackup = await createLegacyBackup(sampleBackup, 'legacy-password');

    await expect(decryptBackup(legacyBackup, 'legacy-password')).resolves.toEqual(sampleBackup);
  });

  it('lehnt falsches Passwort beim neuen Format ab', async () => {
    const encrypted = await encryptBackup(sampleBackup, 'correct');
    await expect(decryptBackup(encrypted, 'wrong')).rejects.toThrow();
  });
});

describe('syncService high-level API', () => {
  const target = { url: 'https://cloud.example/backup.enc', auth: { type: 'bearer' as const, token: 't' } };
  const sampleBackup: FullBackupData = {
    pantry: [],
    recipes: [],
    mealPlan: [],
    shoppingList: [],
    exportedAt: '2026-06-03T12:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    getFullData.mockResolvedValue(sampleBackup);
    uploadEncryptedBlob.mockResolvedValue(undefined);
    downloadEncryptedBlob.mockResolvedValue(new Uint8Array());
    importData.mockResolvedValue(undefined);
    mergeBackupWithConflictResolution.mockResolvedValue(undefined);
  });

  it('syncUpload encrypts payload and stores last sync timestamp', async () => {
    await syncUpload('pw', target);

    expect(getFullData).toHaveBeenCalled();
    expect(uploadEncryptedBlob).toHaveBeenCalledWith(
      target.url,
      expect.any(Uint8Array),
      target.auth,
    );
    expect(getLastSyncTimestamp()).toEqual(expect.any(Number));
  });

  it('syncDownload replace mode imports decrypted data', async () => {
    const encrypted = await encryptBackup(sampleBackup, 'pw');
    downloadEncryptedBlob.mockResolvedValue(encrypted);

    await syncDownload('pw', target, 'replace');

    expect(importData).toHaveBeenCalledWith(sampleBackup);
    expect(mergeBackupWithConflictResolution).not.toHaveBeenCalled();
    expect(getLastSyncTimestamp()).toEqual(expect.any(Number));
  });

  it('syncDownload merge mode uses conflict resolver', async () => {
    const encrypted = await encryptBackup(sampleBackup, 'pw');
    downloadEncryptedBlob.mockResolvedValue(encrypted);

    await syncDownload('pw', target, 'merge');

    expect(mergeBackupWithConflictResolution).toHaveBeenCalledWith(sampleBackup);
    expect(importData).not.toHaveBeenCalled();
  });

  it('getLastSyncTimestamp returns null for invalid stored value', () => {
    localStorage.setItem('culinaSyncLastSyncAt', 'not-a-number');
    expect(getLastSyncTimestamp()).toBeNull();
  });

  it('logs and rethrows on upload failure', async () => {
    uploadEncryptedBlob.mockRejectedValue(new Error('network'));
    await expect(syncUpload('pw', target)).rejects.toThrow('network');
    expect(logAppError).toHaveBeenCalled();
  });

  it('logs and rethrows on merge download failure', async () => {
    downloadEncryptedBlob.mockRejectedValue(new Error('timeout'));
    await expect(syncDownload('pw', target, 'merge')).rejects.toThrow('timeout');
    expect(logAppError).toHaveBeenCalled();
  });

  it('syncDownload replace logs decrypt failures', async () => {
    downloadEncryptedBlob.mockResolvedValue(new Uint8Array([1, 2, 3]));
    await expect(syncDownload('pw', target, 'replace')).rejects.toThrow();
    expect(logAppError).toHaveBeenCalled();
  });
});