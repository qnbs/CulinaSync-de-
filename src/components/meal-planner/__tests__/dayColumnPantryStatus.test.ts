import { describe, expect, it } from 'vitest';
import { getMealPlanSlotPantryStatus } from '../dayColumnPantryStatus';
import type { Recipe } from '@/types';

const baseRecipe = (): Recipe => ({
  recipeTitle: 'X',
  shortDescription: '',
  prepTime: '0',
  cookTime: '0',
  totalTime: '0',
  servings: '2',
  difficulty: 'einfach',
  ingredients: [],
  instructions: [],
  nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
  tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
  expertTips: [],
});

describe('getMealPlanSlotPantryStatus', () => {
  it('unknown ohne Rezept', () => {
    expect(getMealPlanSlotPantryStatus(undefined)).toEqual({ status: 'unknown', have: 0, total: 0 });
  });

  it('unknown ohne pantryMatchPercentage', () => {
    expect(getMealPlanSlotPantryStatus(baseRecipe())).toEqual({ status: 'unknown', have: 0, total: 0 });
  });

  it('ok bei 100 Prozent Abgleich', () => {
    const r = { ...baseRecipe(), pantryMatchPercentage: 100, ingredientCount: 10 };
    expect(getMealPlanSlotPantryStatus(r)).toEqual({ status: 'ok', have: 10, total: 10 });
  });

  it('partial ab 70 Prozent', () => {
    const r = { ...baseRecipe(), pantryMatchPercentage: 80, ingredientCount: 5 };
    expect(getMealPlanSlotPantryStatus(r)).toEqual({ status: 'partial', have: 4, total: 5 });
  });

  it('missing unter 70 Prozent', () => {
    const r = { ...baseRecipe(), pantryMatchPercentage: 50, ingredientCount: 8 };
    expect(getMealPlanSlotPantryStatus(r)).toEqual({ status: 'missing', have: 4, total: 8 });
  });
});
