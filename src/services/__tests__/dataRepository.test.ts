import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FullBackupData } from '../../types';

const transactionMock = vi.fn((...args: unknown[]) => {
  const cb = args[args.length - 1];
  if (typeof cb === 'function') {
    return (cb as () => Promise<void>)();
  }
  return Promise.resolve();
});
const pantryClear = vi.fn();
const pantryBulkAdd = vi.fn();
const recipesClear = vi.fn();
const recipesBulkAdd = vi.fn();
const mealPlanClear = vi.fn();
const mealPlanBulkAdd = vi.fn();
const shoppingClear = vi.fn();
const shoppingBulkAdd = vi.fn();

vi.mock('../pantryMatcherService', () => ({
  updatePantryMatches: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../dbInstance', () => ({
  db: {
    transaction: (...args: unknown[]) => transactionMock(...args),
    pantry: { clear: pantryClear, bulkAdd: pantryBulkAdd },
    recipes: { clear: recipesClear, bulkAdd: recipesBulkAdd },
    mealPlan: { clear: mealPlanClear, bulkAdd: mealPlanBulkAdd },
    shoppingList: { clear: shoppingClear, bulkAdd: shoppingBulkAdd },
  },
}));

describe('dataRepository importData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears stores and bulkAdds backup payload', async () => {
    const { importData } = await import('../repositories/dataRepository');
    const data: FullBackupData = {
      pantry: [{ id: 1, name: 'A', quantity: 1, unit: 'g', category: 'x', createdAt: 1, updatedAt: 1 }],
      recipes: [],
      mealPlan: [],
      shoppingList: [],
    };

    await importData(data);

    expect(transactionMock).toHaveBeenCalled();
    expect(pantryClear).toHaveBeenCalled();
    expect(pantryBulkAdd).toHaveBeenCalledWith(data.pantry);
    expect(recipesClear).toHaveBeenCalled();
    expect(mealPlanClear).toHaveBeenCalled();
    expect(shoppingClear).toHaveBeenCalled();
  });

  it('skips bulkAdd when arrays empty', async () => {
    const { importData } = await import('../repositories/dataRepository');
    await importData({ pantry: [], recipes: [], mealPlan: [], shoppingList: [] });

    expect(pantryBulkAdd).not.toHaveBeenCalled();
    expect(recipesBulkAdd).not.toHaveBeenCalled();
    expect(mealPlanBulkAdd).not.toHaveBeenCalled();
    expect(shoppingBulkAdd).not.toHaveBeenCalled();
  });
});
