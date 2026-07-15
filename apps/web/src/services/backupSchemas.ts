import { z } from 'zod';
import type { FullBackupData } from '../types';

/**
 * Structural Zod gate for encrypted/imported backups.
 * Keeps domain entity shapes loose (arrays of unknown) but rejects non-objects and
 * obvious garbage before Dexie import / merge.
 */
// QNBS-v3: Backup/Vault nach Decrypt validieren | schließt JSON.parse-as-cast Gap (audit P0)
export const fullBackupDataSchema = z
  .object({
    pantry: z.array(z.unknown()).optional(),
    recipes: z.array(z.unknown()).optional(),
    mealPlan: z.array(z.unknown()).optional(),
    shoppingList: z.array(z.unknown()).optional(),
    settings: z.unknown().optional(),
    exportedAt: z.string().optional(),
  })
  .passthrough();

export const parseFullBackupData = (raw: unknown): FullBackupData => {
  const parsed = fullBackupDataSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error('invalid-backup-payload');
  }
  return parsed.data as FullBackupData;
};
