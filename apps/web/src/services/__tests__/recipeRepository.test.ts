import { beforeEach, describe, expect, it, vi } from 'vitest';

const recipesAdd = vi.fn().mockResolvedValue(42);
const recipesUpdate = vi.fn().mockResolvedValue(undefined);
const recipesDelete = vi.fn().mockResolvedValue(undefined);
const recipesGet = vi.fn();

const mealPlanWhereDelete = vi.fn().mockResolvedValue(0);
const shoppingListModify = vi.fn().mockResolvedValue(1);

const pantryToArray = vi.fn().mockResolvedValue([]);
const shoppingListToArray = vi.fn().mockResolvedValue([]);

vi.mock('../retryUtils', () => ({
  retry: async <T>(fn: () => Promise<T>) => fn(),
}));

vi.mock('../pantryMatcherService', () => ({
  updatePantryMatches: vi.fn(),
}));

vi.mock('../repositories/shoppingListRepository', () => ({
  addShoppingListItem: vi.fn().mockResolvedValue({ status: 'added', item: { id: 1 } }),
}));

vi.mock('../dbInstance', () => ({
  db: {
    transaction: vi.fn((_mode: string, ...args: unknown[]) => {
      const fn = args[args.length - 1];
      return typeof fn === 'function' ? (fn as () => Promise<unknown>)() : Promise.resolve();
    }),
    recipes: {
      add: recipesAdd,
      update: recipesUpdate,
      delete: recipesDelete,
      get: recipesGet,
      toArray: vi.fn().mockResolvedValue([]),
      bulkAdd: vi.fn().mockResolvedValue([]),
    },
    mealPlan: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({ delete: mealPlanWhereDelete })),
      })),
    },
    shoppingList: {
      where: vi.fn((query: unknown) => {
        if (typeof query === 'object' && query !== null) {
          return { toArray: shoppingListToArray };
        }
        return {
          equals: vi.fn(() => ({ modify: shoppingListModify })),
        };
      }),
    },
    pantry: {
      toArray: pantryToArray,
    },
  },
}));

describe('recipeRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shoppingListToArray.mockResolvedValue([]);
  });

  it('addRecipe setzt isFavorite und updatedAt', async () => {
    const { addRecipe } = await import('../repositories/recipeRepository');
    const id = await addRecipe({
      recipeTitle: 'Test',
      shortDescription: '',
      ingredients: [],
      instructions: [],
      servings: '2',
      prepTime: '10',
      cookTime: '20',
      totalTime: '30',
      difficulty: 'leicht',
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
    });
    expect(id).toBe(42);
    expect(recipesAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        recipeTitle: 'Test',
        isFavorite: false,
        updatedAt: expect.any(Number),
      }),
    );
  });

  it('updateRecipeImage setzt imageUrl und updatedAt', async () => {
    const { updateRecipeImage } = await import('../repositories/recipeRepository');
    await updateRecipeImage(7, 'data:image/png;base64,abc');
    expect(recipesUpdate).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ imageUrl: 'data:image/png;base64,abc', updatedAt: expect.any(Number) }),
    );
  });

  it('setRecipeFavorite aktualisiert Flag', async () => {
    const { setRecipeFavorite } = await import('../repositories/recipeRepository');
    await setRecipeFavorite(7, true);
    expect(recipesUpdate).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ isFavorite: true, updatedAt: expect.any(Number) }),
    );
  });

  it('deleteRecipe entfernt Rezept und verknuepfte Plan-/Listen-Refs', async () => {
    const { deleteRecipe } = await import('../repositories/recipeRepository');
    await deleteRecipe(3);
    expect(recipesDelete).toHaveBeenCalledWith(3);
    expect(mealPlanWhereDelete).toHaveBeenCalled();
    expect(shoppingListModify).toHaveBeenCalledWith({ recipeId: undefined });
  });

  it('addMissingIngredientsToShoppingList gibt 0 ohne Rezept', async () => {
    recipesGet.mockResolvedValueOnce(undefined);
    const { addMissingIngredientsToShoppingList } = await import('../repositories/recipeRepository');
    const count = await addMissingIngredientsToShoppingList(99);
    expect(count).toBe(0);
  });

  it('addMissingIngredientsToShoppingList fuegt fehlende Zutaten hinzu', async () => {
    recipesGet.mockResolvedValueOnce({
      id: 1,
      recipeTitle: 'Salat',
      ingredients: [
        {
          sectionTitle: 'Haupt',
          items: [{ name: 'Gurke', quantity: '2', unit: 'Stk' }],
        },
      ],
    });
    pantryToArray.mockResolvedValueOnce([]);

    const { addMissingIngredientsToShoppingList } = await import('../repositories/recipeRepository');
    const { addShoppingListItem } = await import('../repositories/shoppingListRepository');
    const count = await addMissingIngredientsToShoppingList(1);
    expect(count).toBe(1);
    expect(addShoppingListItem).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Gurke', recipeId: 1 }),
    );
  });

  it('addMissingIngredientsToShoppingList: qty0 / pantry ausreichend / bereits auf Liste', async () => {
    recipesGet.mockResolvedValueOnce({
      id: 1,
      recipeTitle: 'Mix',
      ingredients: [
        {
          sectionTitle: '',
          items: [
            { name: 'Salz', quantity: '0', unit: 'g' },
            { name: 'Mehl', quantity: '100', unit: 'g' },
            { name: 'Milch', quantity: '1', unit: 'l' },
          ],
        },
      ],
    });
    pantryToArray.mockResolvedValueOnce([
      { id: 1, name: 'Mehl', quantity: 500, unit: 'g', category: 'x', createdAt: 1, updatedAt: 1 },
    ]);
    shoppingListToArray.mockResolvedValueOnce([{ id: 2, name: 'Milch', isChecked: false }]);

    const { addMissingIngredientsToShoppingList } = await import('../repositories/recipeRepository');
    const { addShoppingListItem } = await import('../repositories/shoppingListRepository');
    const count = await addMissingIngredientsToShoppingList(1);
    expect(count).toBe(0);
    expect(addShoppingListItem).not.toHaveBeenCalled();
  });

  it('syncSeedRecipes ohne neue Seeds und mit neuen Seeds', async () => {
    vi.resetModules();
    vi.doMock('../../data/recipes/index', () => ({
      allSeedRecipes: [
        { seedId: 'seed-a', recipeTitle: 'A', ingredients: [], instructions: [] },
        { seedId: 'seed-b', recipeTitle: 'B', ingredients: [], instructions: [] },
      ],
    }));

    const { db } = await import('../dbInstance');
    const { updatePantryMatches } = await import('../pantryMatcherService');
    vi.mocked(db.recipes.toArray).mockResolvedValueOnce([
      { id: 1, seedId: 'seed-a', recipeTitle: 'A' },
      { id: 2, seedId: 'seed-b', recipeTitle: 'B' },
    ] as never);

    const { syncSeedRecipes } = await import('../repositories/recipeRepository');
    await syncSeedRecipes();
    expect(updatePantryMatches).not.toHaveBeenCalled();

    vi.mocked(db.recipes.toArray).mockResolvedValueOnce([
      { id: 1, seedId: 'seed-a', recipeTitle: 'A' },
    ] as never);
    vi.mocked(db.recipes.bulkAdd).mockResolvedValueOnce([12] as never);
    await syncSeedRecipes();
    expect(updatePantryMatches).toHaveBeenCalledWith([12]);
  });
});
