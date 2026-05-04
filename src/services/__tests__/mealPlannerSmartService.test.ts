import { describe, expect, it } from 'vitest';
import type { MealPlanItem, PantryItem, Recipe } from '@/types';
import {
  buildAutoPlanSuggestionsFromExpiring,
  getSoonExpiringPantryNames,
} from '../mealPlannerSmartService';

const baseRecipe = (over: Partial<Recipe> & { id: number }): Recipe =>
  ({
    id: over.id,
    recipeTitle: over.recipeTitle ?? 'R',
    shortDescription: '',
    prepTime: '0',
    cookTime: '0',
    totalTime: '0',
    servings: '2',
    difficulty: 'einfach',
    ingredients: over.ingredients ?? [{ sectionTitle: '', items: [{ quantity: '1', unit: 'g', name: 'Tomate' }] }],
    instructions: [],
    nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
    tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
    expertTips: [],
    pantryMatchPercentage: over.pantryMatchPercentage,
    isFavorite: over.isFavorite,
  }) as Recipe;

describe('mealPlannerSmartService', () => {
  describe('getSoonExpiringPantryNames', () => {
    it('filtert Artikel mit Ablauf innerhalb des Fensters', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const in2 = new Date(today);
      in2.setDate(in2.getDate() + 2);
      const items: PantryItem[] = [
        {
          id: 1,
          name: 'Milch',
          quantity: 1,
          unit: 'l',
          expiryDate: in2.toISOString().split('T')[0],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      const set = getSoonExpiringPantryNames(items, 4);
      expect(set.has('milch')).toBe(true);
    });

    it('ignoriert ungueltige oder fehlende expiries', () => {
      const items: PantryItem[] = [
        { id: 1, name: 'X', quantity: 1, unit: 'x', createdAt: Date.now(), updatedAt: Date.now() },
      ];
      expect(getSoonExpiringPantryNames(items).size).toBe(0);
    });
  });

  describe('buildAutoPlanSuggestionsFromExpiring', () => {
    const monday = new Date(Date.UTC(2026, 4, 4, 12, 0, 0));

    it('liefert leer wenn keine Rezepte oder keine expire-Namen', () => {
      expect(buildAutoPlanSuggestionsFromExpiring([monday], {}, [], new Set())).toEqual([]);
      expect(
        buildAutoPlanSuggestionsFromExpiring([monday], {}, [baseRecipe({ id: 1 })], new Set()),
      ).toEqual([]);
    });

    it('schlaegt Abendessen fuer freien Slot vor', () => {
      const recipes = [
        baseRecipe({
          id: 10,
          ingredients: [{ sectionTitle: '', items: [{ quantity: '1', unit: '', name: 'Tomate' }] }],
        }),
      ];
      const expiring = new Set(['tomate']);
      const mealsByDate: Record<string, MealPlanItem> = {};
      const week = [monday];

      const suggestions = buildAutoPlanSuggestionsFromExpiring(week, mealsByDate, recipes, expiring);
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions[0]).toMatchObject({
        date: '2026-05-04',
        mealType: 'Abendessen',
        recipeId: 10,
      });
    });

    it('ueberspringt Tage die bereits einen Abendessen-Slot haben', () => {
      const recipes = [
        baseRecipe({
          id: 20,
          ingredients: [{ sectionTitle: '', items: [{ quantity: '1', unit: '', name: 'Tomate' }] }],
        }),
      ];
      const slotKey = '2026-05-04-Abendessen';
      const mealsByDate: Record<string, MealPlanItem> = {
        [slotKey]: { id: 1, date: '2026-05-04', mealType: 'Abendessen', recipeId: 99 },
      };
      const expiring = new Set(['tomate']);
      const week = [monday];

      expect(buildAutoPlanSuggestionsFromExpiring(week, mealsByDate, recipes, expiring)).toEqual([]);
    });
  });
});
