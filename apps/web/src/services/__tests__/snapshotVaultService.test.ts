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

const getFullData = vi.fn();
const encryptBackup = vi.fn();
const decryptBackup = vi.fn();

vi.mock('../exportService', () => ({
  getFullData: (...args: unknown[]) => getFullData(...args),
}));

vi.mock('../syncService', () => ({
  encryptBackup: (...args: unknown[]) => encryptBackup(...args),
  decryptBackup: (...args: unknown[]) => decryptBackup(...args),
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

describe('snapshotVaultService download/merge encrypted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('downloadEncryptedVault erzeugt Download-Anchor', async () => {
    getFullData.mockResolvedValue({ pantry: [], recipes: [] });
    encryptBackup.mockResolvedValue(new Uint8Array([1, 2, 3]));
    const click = vi.fn();
    const revoke = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:vault'),
      revokeObjectURL: revoke,
    });
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click,
    } as unknown as HTMLAnchorElement);

    const { downloadEncryptedVault } = await import('../snapshotVaultService');
    await downloadEncryptedVault('secret', 'test.csb');

    expect(encryptBackup).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalledWith('blob:vault');
    createElement.mockRestore();
  });

  it('mergeEncryptedVaultFile entschluesselt und merged', async () => {
    decryptBackup.mockResolvedValue({
      pantry: [],
      recipes: [],
      mealPlan: [],
      shoppingList: [],
    });
    const file = new File([new Uint8Array([9, 9])], 'vault.csb');
    const { mergeEncryptedVaultFile } = await import('../snapshotVaultService');
    const result = await mergeEncryptedVaultFile(file, 'secret');
    expect(decryptBackup).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
