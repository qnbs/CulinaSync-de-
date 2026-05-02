export const MEAL_TYPES = ['Frühstück', 'Mittagessen', 'Abendessen'] as const;
export type MealType = (typeof MEAL_TYPES)[number];
