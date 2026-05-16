import type { FullBackupData } from '../types';
import { db } from './dbInstance';
import { decryptBackup, encryptBackup } from './syncService';
import { getFullData } from './exportService';
import { updatePantryMatches } from './pantryMatcherService';

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

export type VaultMergeResult = {
  skippedOlderPantry: number;
  skippedOlderRecipes: number;
  mergedMealPlan: number;
  mergedShopping: number;
};

/** Führt Import mit Timestamp-Vorrang für Vorrat/Rezepte ein; Plan & Einkauf per bulkPut. */
export async function mergeVaultPayload(data: FullBackupData): Promise<VaultMergeResult> {
  let skippedOlderPantry = 0;
  let skippedOlderRecipes = 0;

  await db.transaction('rw', db.pantry, db.recipes, db.mealPlan, db.shoppingList, async () => {
    for (const item of data.pantry ?? []) {
      if (item.id === undefined) continue;
      const existing = await db.pantry.get(item.id);
      const incoming = item.updatedAt ?? 0;
      const current = existing?.updatedAt ?? 0;
      if (existing && incoming <= current) {
        skippedOlderPantry += 1;
        continue;
      }
      await db.pantry.put(item);
    }

    for (const recipe of data.recipes ?? []) {
      if (recipe.id === undefined) continue;
      const existing = await db.recipes.get(recipe.id);
      const incoming = recipe.updatedAt ?? 0;
      const current = existing?.updatedAt ?? 0;
      if (existing && incoming <= current) {
        skippedOlderRecipes += 1;
        continue;
      }
      await db.recipes.put(recipe);
    }

    if (data.mealPlan && data.mealPlan.length > 0) {
      await db.mealPlan.bulkPut(data.mealPlan);
    }
    if (data.shoppingList && data.shoppingList.length > 0) {
      await db.shoppingList.bulkPut(data.shoppingList);
    }
  });

  await updatePantryMatches();
  return {
    skippedOlderPantry,
    skippedOlderRecipes,
    mergedMealPlan: data.mealPlan?.length ?? 0,
    mergedShopping: data.shoppingList?.length ?? 0,
  };
}

export async function mergeEncryptedVaultFile(file: File, passphrase: string): Promise<VaultMergeResult> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const payload = await decryptBackup(buffer, passphrase);
  return mergeVaultPayload(payload);
}
