/** Canonical meal-slot IDs stored in Dexie (German literals for backward compatibility). */
export const MEAL_TYPES = ['Frühstück', 'Mittagessen', 'Abendessen'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const DEFAULT_MEAL_TYPE: MealType = 'Abendessen';
