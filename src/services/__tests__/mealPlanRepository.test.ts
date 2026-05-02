import { beforeEach, describe, expect, it, vi } from 'vitest';

const mealPlanAdd = vi.fn().mockResolvedValue(99);
const mealPlanDelete = vi.fn().mockResolvedValue(undefined);
const mealPlanGet = vi.fn();
const mealPlanUpdate = vi.fn().mockResolvedValue(undefined);
const recipesGet = vi.fn();

vi.mock('../retryUtils', () => ({
  retry: async <T>(fn: () => Promise<T>) => fn(),
}));

vi.mock('../dbInstance', () => ({
  db: {
    transaction: vi.fn((_mode: string, _tables: unknown, fn: () => Promise<unknown>) => fn()),
    mealPlan: {
      add: mealPlanAdd,
      delete: mealPlanDelete,
      get: mealPlanGet,
      update: mealPlanUpdate,
    },
    recipes: { get: recipesGet },
    pantry: {
      where: vi.fn(() => ({
        equalsIgnoreCase: vi.fn(() => ({ first: vi.fn().mockResolvedValue(null) })),
      })),
      delete: vi.fn(),
      update: vi.fn(),
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
});
