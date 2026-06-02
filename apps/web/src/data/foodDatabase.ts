import type { PantryCategoryId } from '../utils/categoryLabels';

/** Local food reference data (nutrition + allergen codes). Display names via i18n `foodDatabase.items.*`. */
export interface FoodEntry {
  id: string;
  category: PantryCategoryId;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  allergenCodes?: string[];
}

export const foodDatabase: FoodEntry[] = [
  { id: 'apple', category: 'fruitsVegetables', kcal: 52, protein: 0.3, fat: 0.2, carbs: 11.4 },
  { id: 'banana', category: 'fruitsVegetables', kcal: 89, protein: 1.1, fat: 0.3, carbs: 20.2 },
  { id: 'egg', category: 'dairy', kcal: 155, protein: 13, fat: 11, carbs: 1.1, allergenCodes: ['egg'] },
  { id: 'milk', category: 'dairy', kcal: 64, protein: 3.3, fat: 3.6, carbs: 4.8, allergenCodes: ['milk'] },
  { id: 'bread', category: 'bakery', kcal: 250, protein: 8, fat: 1.2, carbs: 49 },
  { id: 'butter', category: 'fatsOils', kcal: 717, protein: 0.9, fat: 81, carbs: 0.1, allergenCodes: ['milk'] },
  { id: 'cheese', category: 'dairy', kcal: 350, protein: 25, fat: 28, carbs: 1.5, allergenCodes: ['milk'] },
  { id: 'chicken_breast', category: 'meat', kcal: 110, protein: 23, fat: 1.2, carbs: 0 },
  { id: 'salmon', category: 'meat', kcal: 208, protein: 20, fat: 13, carbs: 0 },
  { id: 'rice', category: 'grainsLegumes', kcal: 130, protein: 2.7, fat: 0.3, carbs: 28 },
  { id: 'pasta', category: 'grainsLegumes', kcal: 131, protein: 5, fat: 1.1, carbs: 25 },
  { id: 'tomato', category: 'fruitsVegetables', kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
  { id: 'potato', category: 'fruitsVegetables', kcal: 77, protein: 2, fat: 0.1, carbs: 17 },
  { id: 'almond', category: 'nutsSeeds', kcal: 579, protein: 21, fat: 50, carbs: 22, allergenCodes: ['treeNut'] },
  { id: 'hazelnut', category: 'nutsSeeds', kcal: 628, protein: 15, fat: 61, carbs: 17, allergenCodes: ['treeNut'] },
  { id: 'soy', category: 'grainsLegumes', kcal: 446, protein: 36, fat: 20, carbs: 30, allergenCodes: ['soy'] },
  { id: 'wheat', category: 'grainsLegumes', kcal: 327, protein: 12, fat: 1.5, carbs: 61, allergenCodes: ['gluten'] },
  { id: 'peanut', category: 'nutsSeeds', kcal: 567, protein: 26, fat: 49, carbs: 16, allergenCodes: ['peanut'] },
  { id: 'shrimp', category: 'meat', kcal: 99, protein: 24, fat: 0.3, carbs: 0.2, allergenCodes: ['shellfish'] },
];
