import type { Recipe } from '../types';
import { usdaLocalFoods } from '../data/usdaLocal';

export interface NutritionAllergyReport {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  allergens: string[];
  matchedIngredients: number;
  totalIngredients: number;
}

const allergenLabels: Record<string, string> = {
  milk: 'Milch',
  egg: 'Ei',
  gluten: 'Gluten',
  soy: 'Soja',
  peanut: 'Erdnuss',
  tree_nut: 'Schalenfruechte',
  sesame: 'Sesam',
  fish: 'Fisch',
  shellfish: 'Krebstiere',
  celery: 'Sellerie',
  mustard: 'Senf',
};

const parseQuantityToGrams = (quantity: string, unit: string): number => {
  const normalizedQuantity = quantity.replace(',', '.').trim();
  const parsed = parseFloat(normalizedQuantity);
  const value = Number.isFinite(parsed) ? parsed : 100;

  const unitLower = unit.toLowerCase();
  if (unitLower === 'g') return value;
  if (unitLower === 'kg') return value * 1000;
  if (unitLower === 'mg') return value / 1000;
  if (unitLower === 'ml') return value;
  if (unitLower === 'l') return value * 1000;
  if (unitLower === 'cl') return value * 10;
  if (unitLower.includes('stk') || unitLower.includes('stueck') || unitLower.includes('stück')) return value * 80;

  return value;
};

export const analyzeRecipeNutritionAndAllergens = (recipe: Recipe): NutritionAllergyReport => {
  const ingredients = recipe.ingredients.flatMap((group) => group.items);

  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  let matchedIngredients = 0;

  const allergenSet = new Set<string>();

  for (const ingredient of ingredients) {
    const ingredientName = ingredient.name.toLowerCase();
    const lookup = usdaLocalFoods.find((entry) => ingredientName.includes(entry.key));
    if (!lookup) continue;

    matchedIngredients += 1;
    const grams = parseQuantityToGrams(ingredient.quantity || '100', ingredient.unit || 'g');
    const factor = grams / 100;

    calories += lookup.caloriesPer100g * factor;
    protein += lookup.proteinPer100g * factor;
    fat += lookup.fatPer100g * factor;
    carbs += lookup.carbsPer100g * factor;

    lookup.allergens.forEach((allergen) => allergenSet.add(allergen));
  }

  const servings = Math.max(1, parseInt(recipe.servings, 10) || 1);

  return {
    calories: calories / servings,
    protein: protein / servings,
    fat: fat / servings,
    carbs: carbs / servings,
    allergens: Array.from(allergenSet).map((key) => allergenLabels[key] || key),
    matchedIngredients,
    totalIngredients: ingredients.length,
  };
};
