import type { FullBackupData } from '../types';
import { db } from './dbInstance';
import { updatePantryMatches } from './pantryMatcherService';

export type BackupMergeResult = {
  skippedOlderPantry: number;
  skippedOlderRecipes: number;
  mergedMealPlan: number;
  mergedShopping: number;
};

// QNBS-v3: Last-Write-Wins (updatedAt) für Vorrat/Rezepte; Plan/Einkauf per bulkPut — Basis für Vault + Geräte-Sync
export async function mergeBackupWithConflictResolution(data: FullBackupData): Promise<BackupMergeResult> {
  let skippedOlderPantry = 0;
  let skippedOlderRecipes = 0;

  await db.transaction('rw', db.pantry, db.recipes, db.mealPlan, db.shoppingList, async () => {
    for (const item of data.pantry ?? []) {
      if (item.id === undefined) {
        continue;
      }
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
      if (recipe.id === undefined) {
        continue;
      }
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
