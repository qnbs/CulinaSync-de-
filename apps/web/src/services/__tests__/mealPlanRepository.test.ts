import { beforeEach, describe, expect, it, vi } from 'vitest';

const mealPlanAdd = vi.fn().mockResolvedValue(99);
const mealPlanDelete = vi.fn().mockResolvedValue(undefined);
const mealPlanGet = vi.fn();
const mealPlanUpdate = vi.fn().mockResolvedValue(undefined);
const recipesGet = vi.fn();

vi.mock('../retryUtils', () => ({
  retry: async <T>(fn: () => Promise<T>) => fn(),
}));

vi.mock('../utils', () => ({
  scaleIngredientQuantity: vi.fn((q: string) => q),
}));

const pantryFirst = vi.fn();
const pantryUpdate = vi.fn();
const pantryDelete = vi.fn();

vi.mock('../dbInstance', () => ({
  db: {
    transaction: vi.fn((_mode: string, ...args: unknown[]) => {
      const fn = args[args.length - 1];
      return typeof fn === 'function' ? (fn as () => Promise<unknown>)() : Promise.resolve();
    }),
    mealPlan: {
      add: mealPlanAdd,
      delete: mealPlanDelete,
      get: mealPlanGet,
      update: mealPlanUpdate,
    },
    recipes: { get: recipesGet },
    pantry: {
      where: vi.fn(() => ({
        equalsIgnoreCase: vi.fn(() => ({ first: pantryFirst })),
      })),
      delete: pantryDelete,
      update: pantryUpdate,
    },
  },
}));

describe('mealPlanRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addRecipeToMealPlan legt isCooked false ab', async () => {
    const { addRecipeToMealPlan } = await import('../repositories/mealPlanRepository');
    const id = await addRecipeToMealPlan({
      date: '2026-05-01',
      mealType: 'Mittagessen',
      recipeId: 7,
    });
    expect(id).toBe(99);
    expect(mealPlanAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2026-05-01',
        mealType: 'Mittagessen',
        recipeId: 7,
        isCooked: false,
      }),
    );
  });

  it('removeRecipeFromMealPlan loescht per ID', async () => {
    const { removeRecipeFromMealPlan } = await import('../repositories/mealPlanRepository');
    await removeRecipeFromMealPlan(12);
    expect(mealPlanDelete).toHaveBeenCalledWith(12);
  });

  it('markMealAsCooked gibt success false wenn Mahlzeit fehlt', async () => {
    mealPlanGet.mockResolvedValueOnce(undefined);
    const { markMealAsCooked } = await import('../repositories/mealPlanRepository');
    const out = await markMealAsCooked(1);
    expect(out.success).toBe(false);
    expect(out.changes.updated).toEqual([]);
  });

  it('markMealAsCooked ohne Rezept-ID markiert nur gekocht', async () => {
    mealPlanGet.mockResolvedValueOnce({
      id: 3,
      date: '2026-05-02',
      mealType: 'Abendessen',
      note: 'Reste',
    });
    const { markMealAsCooked } = await import('../repositories/mealPlanRepository');
    const out = await markMealAsCooked(3);
    expect(out.success).toBe(true);
    expect(mealPlanUpdate).toHaveBeenCalledWith(3, expect.objectContaining({ isCooked: true }));
    expect(recipesGet).not.toHaveBeenCalled();
  });

  it('markMealAsCooked mit Rezept reduziert Vorrat', async () => {
    mealPlanGet.mockResolvedValueOnce({
      id: 5,
      date: '2026-06-02',
      mealType: 'Mittagessen',
      recipeId: 10,
      servings: 2,
    });
    recipesGet.mockResolvedValueOnce({
      id: 10,
      servings: '2',
      ingredients: [
        { sectionTitle: 'Haupt', items: [{ name: 'Reis', quantity: '200', unit: 'g' }] },
      ],
    });
    pantryFirst.mockResolvedValueOnce({
      id: 20,
      name: 'Reis',
      quantity: 500,
      unit: 'g',
      category: 'Trocken',
      createdAt: 1,
      updatedAt: 1,
    });
    const { markMealAsCooked } = await import('../repositories/mealPlanRepository');
    const out = await markMealAsCooked(5);
    expect(out.success).toBe(true);
    expect(out.changes.updated).toHaveLength(1);
    expect(pantryUpdate).toHaveBeenCalled();
    expect(mealPlanUpdate).toHaveBeenCalledWith(5, expect.objectContaining({ isCooked: true }));
  });

  it('markMealAsCooked loescht Vorrat wenn Menge aufgebraucht', async () => {
    mealPlanGet.mockResolvedValueOnce({
      id: 6,
      date: '2026-06-02',
      mealType: 'Abendessen',
      recipeId: 11,
    });
    recipesGet.mockResolvedValueOnce({
      id: 11,
      servings: '1',
      ingredients: [
        { sectionTitle: 'Haupt', items: [{ name: 'Ei', quantity: '3', unit: 'Stk' }] },
      ],
    });
    pantryFirst.mockResolvedValueOnce({
      id: 21,
      name: 'Ei',
      quantity: 2,
      unit: 'Stk',
      category: 'Kühl',
      createdAt: 1,
      updatedAt: 1,
    });
    const { markMealAsCooked } = await import('../repositories/mealPlanRepository');
    const out = await markMealAsCooked(6);
    expect(out.success).toBe(true);
    expect(out.changes.deleted).toHaveLength(1);
    expect(pantryDelete).toHaveBeenCalledWith(21);
  });
});
