import { describe, expect, it } from 'vitest';

import { decryptBackup, encryptBackup } from '../syncService';
import type { FullBackupData } from '../../types';

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
});