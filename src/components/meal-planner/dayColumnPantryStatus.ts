import type { Recipe } from '../../types';

/** Vorratsabgleich fuer eine geplante Mahlzeit (reiner Helper fuer Tests und DayColumn). */
export function getMealPlanSlotPantryStatus(recipe: Recipe | undefined): {
  status: 'unknown' | 'ok' | 'partial' | 'missing';
  have: number;
  total: number;
} {
  if (!recipe || typeof recipe.pantryMatchPercentage === 'undefined' || typeof recipe.ingredientCount === 'undefined') {
    return { status: 'unknown', have: 0, total: 0 };
  }
  const { pantryMatchPercentage, ingredientCount } = recipe;
  const have = Math.round(ingredientCount * (pantryMatchPercentage / 100));
  let status: 'ok' | 'partial' | 'missing' = 'missing';
  if (pantryMatchPercentage === 100) status = 'ok';
  else if (pantryMatchPercentage >= 70) status = 'partial';
  return { status, have, total: ingredientCount };
}
