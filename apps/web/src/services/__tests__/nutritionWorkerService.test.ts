import { describe, expect, it } from 'vitest';
import type { Recipe } from '../../types';
import { analyzeRecipeNutritionInWorker } from '../nutritionWorkerService';

const minimalRecipe: Recipe = {
  id: 1,
  recipeTitle: 'Test',
  shortDescription: '',
  prepTime: '10',
  cookTime: '20',
  totalTime: '30',
  servings: '1',
  difficulty: 'leicht',
  ingredients: [{ sectionTitle: 'Haupt', items: [{ name: 'Tomate', quantity: '100', unit: 'g' }] }],
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
};

describe('nutritionWorkerService', () => {
  it('faellt auf synchrone Analyse zurueck wenn Worker nicht verfuegbar', async () => {
    const originalWorker = globalThis.Worker;
    // @ts-expect-error Test: Worker absichtlich deaktiviert
    globalThis.Worker = undefined;

    const report = await analyzeRecipeNutritionInWorker(minimalRecipe);
    expect(report.matchedIngredients).toBe(1);
    expect(report.calories).toBeGreaterThan(0);

    globalThis.Worker = originalWorker;
  });
});
