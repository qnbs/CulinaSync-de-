import { db } from '../../../services/dbInstance';
import type { AppSettings, PantryItem } from '../../../types';

export interface AiChefContext {
  pantryItems: PantryItem[];
  aiPreferences: AppSettings['aiPreferences'];
}

export const loadAiChefContext = async (aiPreferences: AppSettings['aiPreferences']): Promise<AiChefContext> => {
  const pantryItems = await db.pantry.toArray();
  return {
    pantryItems,
    aiPreferences,
  };
};