import { decryptBackup, encryptBackup } from './syncService';
import { getFullData } from './exportService';
import { mergeBackupWithConflictResolution, type BackupMergeResult } from './backupMergeService';

export type VaultMergeResult = BackupMergeResult;

/**
 * AES-GCM Snapshot (Format wie `syncService.encryptBackup`) — für Offline-Transfer ohne Cloud.
 */
export async function downloadEncryptedVault(passphrase: string, filename = 'culinasync-vault.csb'): Promise<void> {
  const data = await getFullData();
  const encrypted = await encryptBackup(data, passphrase);
  const blob = new Blob([new Uint8Array(encrypted)], { type: 'application/octet-stream' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

export const mergeVaultPayload = mergeBackupWithConflictResolution;

export async function mergeEncryptedVaultFile(file: File, passphrase: string): Promise<VaultMergeResult> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const payload = await decryptBackup(buffer, passphrase);
  return mergeBackupWithConflictResolution(payload);
}
