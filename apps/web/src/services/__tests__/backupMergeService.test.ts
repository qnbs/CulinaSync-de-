import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FullBackupData } from '../../types';

const transactionMock = vi.fn((...args: unknown[]) => {
  const cb = args[args.length - 1];
  if (typeof cb === 'function') {
    return (cb as () => Promise<void>)();
  }
  return Promise.resolve();
});

const pantryGet = vi.fn();
const pantryPut = vi.fn();
const recipesGet = vi.fn();
const recipesPut = vi.fn();
const mealPlanBulkPut = vi.fn();
const shoppingBulkPut = vi.fn();

vi.mock('../pantryMatcherService', () => ({
  updatePantryMatches: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../dbInstance', () => ({
  db: {
    transaction: (...args: unknown[]) => transactionMock(...args),
    pantry: { get: pantryGet, put: pantryPut },
    recipes: { get: recipesGet, put: recipesPut },
    mealPlan: { bulkPut: mealPlanBulkPut },
    shoppingList: { bulkPut: shoppingBulkPut },
  },
}));

describe('backupMergeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ignoriert Eintraege ohne id', async () => {
    const { mergeBackupWithConflictResolution } = await import('../backupMergeService');
    const data: FullBackupData = {
      pantry: [{ name: 'OhneId', quantity: 1, unit: 'l', createdAt: 1, updatedAt: 2 }],
      recipes: [
        {
          recipeTitle: 'OhneId',
          shortDescription: '',
          prepTime: '',
          cookTime: '',
          totalTime: '',
          servings: '1',
          difficulty: '',
          ingredients: [],
          instructions: [],
          nutritionPerServing: { calories: '0', protein: '0', carbs: '0', fat: '0' },
          tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
          expertTips: [],
          updatedAt: 2,
        },
      ],
      mealPlan: [],
      shoppingList: [],
      exportedAt: '2026-06-03T00:00:00.000Z',
    };

    const result = await mergeBackupWithConflictResolution(data);

    expect(pantryPut).not.toHaveBeenCalled();
    expect(recipesPut).not.toHaveBeenCalled();
    expect(result.skippedOlderPantry).toBe(0);
    expect(result.skippedOlderRecipes).toBe(0);
  });

  it('ueberschreibt neuere Vorratseintraege und ueberspringt aeltere', async () => {
    pantryGet.mockResolvedValueOnce({ id: 1, name: 'Alt', quantity: 1, unit: 'l', updatedAt: 10 });
    const { mergeBackupWithConflictResolution } = await import('../backupMergeService');
    const data: FullBackupData = {
      pantry: [{ id: 1, name: 'Neu', quantity: 2, unit: 'l', createdAt: 1, updatedAt: 5 }],
      recipes: [],
      mealPlan: [],
      shoppingList: [],
      exportedAt: '2026-06-02T00:00:00.000Z',
    };

    const result = await mergeBackupWithConflictResolution(data);

    expect(pantryPut).not.toHaveBeenCalled();
    expect(result.skippedOlderPantry).toBe(1);
  });

  it('ueberschreibt neuere Rezepte und ueberspringt aeltere', async () => {
    recipesGet.mockResolvedValueOnce({
      id: 3,
      recipeTitle: 'Alt',
      shortDescription: '',
      prepTime: '',
      cookTime: '',
      totalTime: '',
      servings: '1',
      difficulty: '',
      ingredients: [],
      instructions: [],
      nutritionPerServing: { calories: '0', protein: '0', carbs: '0', fat: '0' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      expertTips: [],
      updatedAt: 100,
    });
    const { mergeBackupWithConflictResolution } = await import('../backupMergeService');
    const data: FullBackupData = {
      pantry: [],
      recipes: [
        {
          id: 3,
          recipeTitle: 'Neu',
          shortDescription: '',
          prepTime: '',
          cookTime: '',
          totalTime: '',
          servings: '1',
          difficulty: '',
          ingredients: [],
          instructions: [],
          nutritionPerServing: { calories: '0', protein: '0', carbs: '0', fat: '0' },
          tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
          expertTips: [],
          updatedAt: 50,
        },
      ],
      mealPlan: [],
      shoppingList: [],
      exportedAt: '2026-06-03T00:00:00.000Z',
    };

    const result = await mergeBackupWithConflictResolution(data);

    expect(recipesPut).not.toHaveBeenCalled();
    expect(result.skippedOlderRecipes).toBe(1);
  });

  it('ueberschreibt neuere Vorratseintraege per LWW', async () => {
    pantryGet.mockResolvedValueOnce({ id: 1, name: 'Alt', quantity: 1, unit: 'l', updatedAt: 5 });
    const { mergeBackupWithConflictResolution } = await import('../backupMergeService');
    const data: FullBackupData = {
      pantry: [{ id: 1, name: 'Neu', quantity: 2, unit: 'l', createdAt: 1, updatedAt: 20 }],
      recipes: [],
      mealPlan: [],
      shoppingList: [],
      exportedAt: '2026-06-03T00:00:00.000Z',
    };

    const result = await mergeBackupWithConflictResolution(data);

    expect(pantryPut).toHaveBeenCalledWith(expect.objectContaining({ name: 'Neu' }));
    expect(result.skippedOlderPantry).toBe(0);
  });

  it('legt fehlende Eintraege an und merged Plan/Einkauf', async () => {
    pantryGet.mockResolvedValueOnce(undefined);
    recipesGet.mockResolvedValueOnce(undefined);
    const { mergeBackupWithConflictResolution } = await import('../backupMergeService');
    const data: FullBackupData = {
      pantry: [{ id: 2, name: 'Brot', quantity: 1, unit: 'Stk', createdAt: 1, updatedAt: 2 }],
      recipes: [{ id: 3, recipeTitle: 'Toast', shortDescription: '', prepTime: '', cookTime: '', totalTime: '', servings: '1', difficulty: '', ingredients: [], instructions: [], nutritionPerServing: { calories: '0', protein: '0', carbs: '0', fat: '0' }, tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] }, expertTips: [], updatedAt: 2 }],
      mealPlan: [{ id: 1, date: '2026-06-02', mealType: 'Abendessen', recipeId: 3 }],
      shoppingList: [{ id: 1, name: 'Brot', quantity: 1, unit: 'Stk', isChecked: false, category: 'Brot', sortOrder: 0 }],
      exportedAt: '2026-06-02T00:00:00.000Z',
    };

    const result = await mergeBackupWithConflictResolution(data);

    expect(pantryPut).toHaveBeenCalled();
    expect(recipesPut).toHaveBeenCalled();
    expect(mealPlanBulkPut).toHaveBeenCalledWith(data.mealPlan);
    expect(shoppingBulkPut).toHaveBeenCalledWith(data.shoppingList);
    expect(result.mergedMealPlan).toBe(1);
    expect(result.mergedShopping).toBe(1);
  });
});
