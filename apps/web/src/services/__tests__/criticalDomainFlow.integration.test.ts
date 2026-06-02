import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Integration: Vorrat → Essensplan → Einkaufsliste (gemockte Dexie-Schicht).
 */

const mealPlanAdd = vi.fn().mockResolvedValue(1);
const recipesGet = vi.fn();
const pantryToArray = vi.fn().mockResolvedValue([]);
const shoppingAdd = vi.fn().mockResolvedValue(101);
const shoppingUpdate = vi.fn();
const shoppingWhereUnchecked = vi.fn();

vi.mock('../retryUtils', () => ({
  retry: async <T>(fn: () => Promise<T>) => fn(),
}));

vi.mock('../utils', () => ({
  getCategoryForItem: vi.fn(() => 'Sonstiges'),
  scaleIngredientQuantity: vi.fn((q: string) => q),
}));

vi.mock('../pantryMatcherService', () => ({
  updatePantryMatches: vi.fn(),
}));

vi.mock('../dbInstance', () => ({
  db: {
    transaction: vi.fn((_mode: string, ...args: unknown[]) => {
      const fn = args[args.length - 1];
      return typeof fn === 'function' ? (fn as () => Promise<unknown>)() : Promise.resolve();
    }),
    mealPlan: {
      add: mealPlanAdd,
      get: vi.fn(),
      where: vi.fn(() => ({
        between: vi.fn(() => ({
          filter: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue([
              { date: '2026-06-10', recipeId: 5, isCooked: false, mealType: 'Abendessen' },
            ]),
          })),
        })),
      })),
    },
    recipes: {
      get: recipesGet,
      where: vi.fn(() => ({
        anyOf: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue([
            {
              id: 5,
              servings: '2',
              ingredients: [
                {
                  sectionTitle: 'Haupt',
                  items: [{ name: 'Nudeln', quantity: '200', unit: 'g' }],
                },
              ],
            },
          ]),
        })),
      })),
    },
    pantry: { toArray: pantryToArray },
    shoppingList: {
      where: vi.fn((field: string | Record<string, unknown>) => {
        if (typeof field === 'object' && field !== null) {
          return { toArray: vi.fn().mockResolvedValue([]) };
        }
        if (field === 'name') {
          return {
            equalsIgnoreCase: vi.fn(() => ({
              and: vi.fn(() => ({ first: vi.fn().mockResolvedValue(undefined) })),
            })),
          };
        }
        if (field === 'category') {
          return { equals: vi.fn(() => ({ last: vi.fn().mockResolvedValue(undefined) })) };
        }
        return { equals: shoppingWhereUnchecked };
      }),
      add: shoppingAdd,
      update: shoppingUpdate,
    },
  },
}));

describe('critical domain flow (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shoppingWhereUnchecked.mockReturnValue({
      toArray: vi.fn().mockResolvedValue([]),
    });
  });

  it('plant Mahlzeit und generiert Einkaufsliste aus Plan', async () => {
    const { addRecipeToMealPlan } = await import('../repositories/mealPlanRepository');
    const mealId = await addRecipeToMealPlan({
      date: '2026-06-10',
      mealType: 'Abendessen',
      recipeId: 5,
    });
    expect(mealId).toBe(1);

    const { generateListFromMealPlan } = await import('../repositories/shoppingListRepository');
    const out = await generateListFromMealPlan();
    expect(out.added).toBe(1);
    expect(shoppingAdd).toHaveBeenCalled();
  });

  it('fügt fehlende Rezept-Zutaten zur Liste hinzu', async () => {
    recipesGet.mockResolvedValueOnce({
      id: 5,
      ingredients: [
        { sectionTitle: 'Haupt', items: [{ name: 'Basilikum', quantity: '1', unit: 'Bund' }] },
      ],
    });
    shoppingWhereUnchecked.mockReturnValue({
      toArray: vi.fn().mockResolvedValue([]),
    });
    const { addMissingIngredientsToShoppingList } = await import('../repositories/recipeRepository');
    const count = await addMissingIngredientsToShoppingList(5);
    expect(count).toBe(1);
  });
});
