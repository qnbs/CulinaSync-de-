import { describe, expect, it, vi } from 'vitest';

vi.mock('../../data/usdaLocal', () => ({
  usdaLocalFoods: [
    {
      key: 'milch',
      caloriesPer100g: 64,
      proteinPer100g: 3.3,
      fatPer100g: 3.6,
      carbsPer100g: 4.8,
      allergens: ['milk'],
    },
    {
      key: 'testdummy',
      caloriesPer100g: 10,
      proteinPer100g: 1,
      fatPer100g: 0,
      carbsPer100g: 1,
      allergens: ['unknown_allergen_xyz'],
    },
  ],
}));

import { analyzeRecipeNutritionAndAllergens } from '../nutritionAllergyService';
import type { Recipe } from '../../types';

const baseRecipe = (overrides: Partial<Recipe> = {}): Recipe =>
  ({
    recipeTitle: 'Test',
    shortDescription: '',
    prepTime: '',
    cookTime: '',
    totalTime: '',
    servings: '2',
    difficulty: 'Einfach',
    ingredients: [
      {
        sectionTitle: '',
        items: [
          { name: 'Vollmilch', quantity: '200', unit: 'ml' },
          { name: 'Mehl', quantity: '0,5', unit: 'kg' },
          { name: 'Salz', quantity: '1', unit: 'g' },
          { name: 'Unbekanntes', quantity: 'x', unit: 'foo' },
        ],
      },
    ],
    instructions: ['Mix'],
    nutritionPerServing: { calories: '', protein: '', fat: '', carbs: '' },
    tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
    expertTips: [],
    ...overrides,
  }) as Recipe;

// QNBS-v3: Branch-Coverage Nutrition/Allergene | Einheiten + Raw-Allergen-Fallback ohne USDA-Label
describe('nutritionAllergyService coverage', () => {
  it('rechnet Einheiten und Allergene pro Portion', () => {
    const report = analyzeRecipeNutritionAndAllergens(baseRecipe());
    expect(report.totalIngredients).toBe(4);
    expect(report.matchedIngredients).toBeGreaterThan(0);
    expect(report.calories).toBeGreaterThan(0);
    expect(report.allergens.some((a) => /milch|milk/i.test(a))).toBe(true);
  });

  it('servings NaN → Divisor 1; mg/cl/l/stk-Zweige', () => {
    const report = analyzeRecipeNutritionAndAllergens(
      baseRecipe({
        servings: 'n/a',
        ingredients: [
          {
            sectionTitle: '',
            items: [
              { name: 'Milch', quantity: '500', unit: 'mg' },
              { name: 'Milch', quantity: '2', unit: 'cl' },
              { name: 'Milch', quantity: '1', unit: 'l' },
              { name: 'Ei', quantity: '2', unit: 'Stk' },
            ],
          },
        ],
      }),
    );
    expect(report.calories).toBeGreaterThan(0);
    expect(report.matchedIngredients).toBeGreaterThan(0);
  });

  it('unbekannte Allergen-Keys bleiben raw; unmatched Ingredient ohne Match', () => {
    const unmatched = analyzeRecipeNutritionAndAllergens(
      baseRecipe({
        ingredients: [{ sectionTitle: '', items: [{ name: 'xyz-never', quantity: '1', unit: 'g' }] }],
      }),
    );
    expect(unmatched.matchedIngredients).toBe(0);
    expect(unmatched.allergens).toEqual([]);

    const raw = analyzeRecipeNutritionAndAllergens(
      baseRecipe({
        ingredients: [{ sectionTitle: '', items: [{ name: 'testdummy food', quantity: '100', unit: 'g' }] }],
      }),
    );
    expect(raw.matchedIngredients).toBe(1);
    expect(raw.allergens).toContain('unknown_allergen_xyz');
  });
});
