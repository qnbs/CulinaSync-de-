import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FullBackupData } from '../../types';

const pantryGet = vi.fn();
const pantryPut = vi.fn();
const recipesGet = vi.fn();
const recipesPut = vi.fn();
const mealPlanBulkPut = vi.fn();
const shoppingListBulkPut = vi.fn();
const updatePantryMatches = vi.fn().mockResolvedValue(undefined);

vi.mock('../dbInstance', () => ({
  db: {
    transaction: vi.fn((_mode: string, ...args: unknown[]) => {
      const fn = args[args.length - 1];
      return typeof fn === 'function' ? (fn as () => Promise<unknown>)() : Promise.resolve();
    }),
    pantry: { get: pantryGet, put: pantryPut },
    recipes: { get: recipesGet, put: recipesPut },
    mealPlan: { bulkPut: mealPlanBulkPut },
    shoppingList: { bulkPut: shoppingListBulkPut },
  },
}));

vi.mock('../pantryMatcherService', () => ({
  updatePantryMatches,
}));

vi.mock('../exportService', () => ({
  getFullData: vi.fn(),
}));

vi.mock('../syncService', () => ({
  encryptBackup: vi.fn(),
  decryptBackup: vi.fn(),
}));

describe('snapshotVaultService mergeVaultPayload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pantryGet.mockResolvedValue(undefined);
    recipesGet.mockResolvedValue(undefined);
  });

  it('merged neuere Pantry- und Rezept-Eintraege', async () => {
    const { mergeVaultPayload } = await import('../snapshotVaultService');
    const data: FullBackupData = {
      pantry: [{ id: 1, name: 'Milch', quantity: 2, unit: 'L', category: 'X', createdAt: 1, updatedAt: 100 }],
      recipes: [
        {
          id: 2,
          recipeTitle: 'Neu',
          shortDescription: '',
          prepTime: '1',
          cookTime: '1',
          totalTime: '1',
          servings: '1',
          difficulty: 'leicht',
          ingredients: [],
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
          updatedAt: 200,
        },
      ],
      mealPlan: [{ id: 1, date: '2026-06-02', mealType: 'Mittagessen', recipeId: 2 }],
      shoppingList: [{ id: 1, name: 'Brot', quantity: 1, unit: 'Stk', category: 'X', isChecked: false, sortOrder: 0 }],
    };

    const result = await mergeVaultPayload(data);

    expect(pantryPut).toHaveBeenCalled();
    expect(recipesPut).toHaveBeenCalled();
    expect(mealPlanBulkPut).toHaveBeenCalled();
    expect(shoppingListBulkPut).toHaveBeenCalled();
    expect(updatePantryMatches).toHaveBeenCalled();
    expect(result.mergedMealPlan).toBe(1);
    expect(result.mergedShopping).toBe(1);
  });

  it('ueberspringt aeltere Pantry-Eintraege', async () => {
    pantryGet.mockResolvedValueOnce({
      id: 1,
      name: 'Milch',
      quantity: 1,
      unit: 'L',
      category: 'X',
      createdAt: 1,
      updatedAt: 500,
    });

    const { mergeVaultPayload } = await import('../snapshotVaultService');
    const result = await mergeVaultPayload({
      pantry: [{ id: 1, name: 'Milch', quantity: 9, unit: 'L', category: 'X', createdAt: 1, updatedAt: 10 }],
      recipes: [],
      mealPlan: [],
      shoppingList: [],
    });

    expect(pantryPut).not.toHaveBeenCalled();
    expect(result.skippedOlderPantry).toBe(1);
  });
});
