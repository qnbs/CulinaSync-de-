import { describe, expect, it } from 'vitest';
import type { Recipe } from '../../types';
import { analyzeRecipeNutritionAndAllergens } from '../nutritionAllergyService';

const baseRecipe = (items: Recipe['ingredients'][0]['items']): Recipe => ({
  id: 1,
  recipeTitle: 'Test',
  shortDescription: '',
  prepTime: '10',
  cookTime: '20',
  totalTime: '30',
  servings: '2',
  difficulty: 'leicht',
  ingredients: [{ sectionTitle: 'Haupt', items }],
  instructions: [],
  nutritionPerServing: { calories: '0', protein: '0', carbs: '0', fat: '0' },
  tags: {
    course: [],
    cuisine: [],
    occasion: [],
    mainIngredient: [],
    prepMethod: [],
    diet: [],
  },
  expertTips: [],
});

describe('nutritionAllergyService', () => {
  it('berechnet Naehrwerte und Allergene pro Portion', () => {
    const report = analyzeRecipeNutritionAndAllergens(
      baseRecipe([
        { name: 'Milch', quantity: '200', unit: 'ml' },
        { name: 'Nudeln', quantity: '100', unit: 'g' },
        { name: 'Unbekanntes Kraut', quantity: '1', unit: 'Bund' },
      ]),
    );

    expect(report.matchedIngredients).toBe(2);
    expect(report.totalIngredients).toBe(3);
    expect(report.calories).toBeGreaterThan(0);
    expect(report.allergens).toContain('Milch');
    expect(report.allergens).toContain('Gluten');
  });

  it('skaliert Mengen fuer kg und Stueck-Einheiten', () => {
    const report = analyzeRecipeNutritionAndAllergens(
      baseRecipe([
        { name: 'Reis', quantity: '1', unit: 'kg' },
        { name: 'Ei', quantity: '2', unit: 'Stück' },
      ]),
    );

    expect(report.matchedIngredients).toBe(2);
    expect(report.allergens).toContain('Ei');
  });
});
