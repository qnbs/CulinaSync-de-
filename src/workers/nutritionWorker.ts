import type { Recipe } from '../types';
import { analyzeRecipeNutritionAndAllergens } from '../services/nutritionAllergyService';

const workerScope = self as typeof globalThis;

workerScope.addEventListener('message', (event: MessageEvent<{ id: number; recipe: Recipe }>) => {
  try {
    const result = analyzeRecipeNutritionAndAllergens(event.data.recipe);
    workerScope.postMessage({ id: event.data.id, result });
  } catch (error) {
    workerScope.postMessage({
      id: event.data.id,
      error: error instanceof Error ? error.message : 'Naehrwertberechnung fehlgeschlagen.',
    });
  }
});

export {};