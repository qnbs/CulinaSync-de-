export interface UsdaFoodEntry {
  key: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
  allergens: string[];
}

// Compact local nutrient/allergen lookup inspired by USDA references.
export const usdaLocalFoods: UsdaFoodEntry[] = [
  { key: 'milch', caloriesPer100g: 64, proteinPer100g: 3.3, fatPer100g: 3.6, carbsPer100g: 4.8, allergens: ['milk'] },
  { key: 'joghurt', caloriesPer100g: 61, proteinPer100g: 3.5, fatPer100g: 3.3, carbsPer100g: 4.7, allergens: ['milk'] },
  { key: 'käse', caloriesPer100g: 356, proteinPer100g: 25, fatPer100g: 27, carbsPer100g: 2, allergens: ['milk'] },
  { key: 'ei', caloriesPer100g: 143, proteinPer100g: 13, fatPer100g: 10, carbsPer100g: 1.1, allergens: ['egg'] },
  { key: 'weizen', caloriesPer100g: 327, proteinPer100g: 12.6, fatPer100g: 1.5, carbsPer100g: 71, allergens: ['gluten'] },
  { key: 'mehl', caloriesPer100g: 364, proteinPer100g: 10.3, fatPer100g: 1, carbsPer100g: 76, allergens: ['gluten'] },
  { key: 'nudel', caloriesPer100g: 371, proteinPer100g: 13, fatPer100g: 1.5, carbsPer100g: 75, allergens: ['gluten'] },
  { key: 'brot', caloriesPer100g: 265, proteinPer100g: 9, fatPer100g: 3.2, carbsPer100g: 49, allergens: ['gluten'] },
  { key: 'soja', caloriesPer100g: 446, proteinPer100g: 36, fatPer100g: 20, carbsPer100g: 30, allergens: ['soy'] },
  { key: 'tofu', caloriesPer100g: 144, proteinPer100g: 17.3, fatPer100g: 8.7, carbsPer100g: 2.8, allergens: ['soy'] },
  { key: 'erdnuss', caloriesPer100g: 567, proteinPer100g: 26, fatPer100g: 49, carbsPer100g: 16, allergens: ['peanut'] },
  { key: 'mandel', caloriesPer100g: 579, proteinPer100g: 21, fatPer100g: 50, carbsPer100g: 22, allergens: ['tree_nut'] },
  { key: 'haselnuss', caloriesPer100g: 628, proteinPer100g: 15, fatPer100g: 61, carbsPer100g: 17, allergens: ['tree_nut'] },
  { key: 'walnuss', caloriesPer100g: 654, proteinPer100g: 15, fatPer100g: 65, carbsPer100g: 14, allergens: ['tree_nut'] },
  { key: 'sesam', caloriesPer100g: 573, proteinPer100g: 17, fatPer100g: 50, carbsPer100g: 23, allergens: ['sesame'] },
  { key: 'garnele', caloriesPer100g: 99, proteinPer100g: 24, fatPer100g: 0.3, carbsPer100g: 0.2, allergens: ['shellfish'] },
  { key: 'lachs', caloriesPer100g: 208, proteinPer100g: 20, fatPer100g: 13, carbsPer100g: 0, allergens: ['fish'] },
  { key: 'fisch', caloriesPer100g: 145, proteinPer100g: 20, fatPer100g: 6, carbsPer100g: 0, allergens: ['fish'] },
  { key: 'sellerie', caloriesPer100g: 16, proteinPer100g: 0.7, fatPer100g: 0.2, carbsPer100g: 3, allergens: ['celery'] },
  { key: 'senf', caloriesPer100g: 66, proteinPer100g: 4.4, fatPer100g: 4.4, carbsPer100g: 5.8, allergens: ['mustard'] },
  { key: 'tomate', caloriesPer100g: 18, proteinPer100g: 0.9, fatPer100g: 0.2, carbsPer100g: 3.9, allergens: [] },
  { key: 'zwiebel', caloriesPer100g: 40, proteinPer100g: 1.1, fatPer100g: 0.1, carbsPer100g: 9.3, allergens: [] },
  { key: 'kartoffel', caloriesPer100g: 77, proteinPer100g: 2, fatPer100g: 0.1, carbsPer100g: 17, allergens: [] },
  { key: 'hähnchen', caloriesPer100g: 239, proteinPer100g: 27, fatPer100g: 14, carbsPer100g: 0, allergens: [] },
  { key: 'huhn', caloriesPer100g: 239, proteinPer100g: 27, fatPer100g: 14, carbsPer100g: 0, allergens: [] },
  { key: 'rind', caloriesPer100g: 250, proteinPer100g: 26, fatPer100g: 15, carbsPer100g: 0, allergens: [] },
  { key: 'reis', caloriesPer100g: 365, proteinPer100g: 7.1, fatPer100g: 0.7, carbsPer100g: 80, allergens: [] },
  { key: 'bohne', caloriesPer100g: 347, proteinPer100g: 21, fatPer100g: 1.2, carbsPer100g: 63, allergens: [] },
];
