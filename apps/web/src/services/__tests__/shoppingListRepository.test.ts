import { beforeEach, describe, expect, it, vi } from 'vitest';

const shoppingListAdd = vi.fn().mockResolvedValue(101);
const shoppingListUpdate = vi.fn().mockResolvedValue(undefined);
const shoppingListDelete = vi.fn().mockResolvedValue(undefined);
const shoppingListClear = vi.fn().mockResolvedValue(undefined);
const shoppingListCount = vi.fn().mockResolvedValue(3);
const shoppingListModify = vi.fn().mockResolvedValue(2);

const pantryAdd = vi.fn().mockResolvedValue(1);
const pantryUpdate = vi.fn().mockResolvedValue(undefined);
const pantryFirst = vi.fn().mockResolvedValue(null);

const equalsIgnoreCaseFirst = vi.fn();
const categoryLast = vi.fn();
const isCheckedEquals = vi.fn();

vi.mock('../retryUtils', () => ({
  retry: async <T>(fn: () => Promise<T>) => fn(),
}));

vi.mock('../utils', () => ({
  getCategoryForItem: vi.fn(() => 'Gemüse'),
  scaleIngredientQuantity: vi.fn((q: string) => q),
}));

vi.mock('../dbInstance', () => ({
  db: {
    transaction: vi.fn((_mode: string, ...args: unknown[]) => {
      const fn = args[args.length - 1];
      return typeof fn === 'function' ? (fn as () => Promise<unknown>)() : Promise.resolve();
    }),
    shoppingList: {
      where: vi.fn((field: string) => {
        if (field === 'name') {
          return { equalsIgnoreCase: vi.fn(() => ({ and: vi.fn(() => ({ first: equalsIgnoreCaseFirst })) })) };
        }
        if (field === 'category') {
          return {
            equals: vi.fn(() => ({ last: categoryLast, modify: shoppingListModify })),
          };
        }
        if (field === 'isChecked') {
          return { equals: isCheckedEquals };
        }
        return {
          equals: vi.fn(() => ({ modify: shoppingListModify })),
          between: vi.fn(),
          anyOf: vi.fn(),
        };
      }),
      add: shoppingListAdd,
      update: shoppingListUpdate,
      delete: shoppingListDelete,
      clear: shoppingListClear,
      count: shoppingListCount,
    },
    pantry: {
      where: vi.fn(() => ({
        equalsIgnoreCase: vi.fn(() => ({ first: pantryFirst })),
      })),
      add: pantryAdd,
      update: pantryUpdate,
      toArray: vi.fn().mockResolvedValue([]),
    },
    mealPlan: {
      where: vi.fn(() => ({
        between: vi.fn(() => ({
          filter: vi.fn(() => ({ toArray: vi.fn().mockResolvedValue([]) })),
        })),
      })),
    },
    recipes: {
      where: vi.fn(() => ({
        anyOf: vi.fn(() => ({ toArray: vi.fn().mockResolvedValue([]) })),
      })),
      get: vi.fn(),
    },
  },
}));

describe('shoppingListRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    equalsIgnoreCaseFirst.mockResolvedValue(undefined);
    categoryLast.mockResolvedValue(undefined);
    isCheckedEquals.mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) });
  });

  it('addShoppingListItem legt neuen Eintrag mit sortOrder an', async () => {
    const { addShoppingListItem } = await import('../repositories/shoppingListRepository');
    const out = await addShoppingListItem({
      name: 'Tomaten',
      quantity: 2,
      unit: 'kg',
      isChecked: false,
    });
    expect(out.status).toBe('added');
    expect(shoppingListAdd).toHaveBeenCalled();
    expect(out.item.id).toBe(101);
  });

  it('addShoppingListItem erhoeht Menge bei bestehendem offenen Eintrag', async () => {
    equalsIgnoreCaseFirst.mockResolvedValue({
      id: 5,
      name: 'Tomaten',
      quantity: 1,
      unit: 'kg',
      isChecked: false,
      category: 'Gemüse',
      sortOrder: 100,
    });
    const { addShoppingListItem } = await import('../repositories/shoppingListRepository');
    const out = await addShoppingListItem({
      name: 'Tomaten',
      quantity: 2,
      unit: 'kg',
      isChecked: false,
    });
    expect(out.status).toBe('updated');
    expect(out.item.quantity).toBe(3);
    expect(shoppingListUpdate).toHaveBeenCalledWith(5, { quantity: 3 });
  });

  it('updateShoppingListItem ignoriert Eintraege ohne id', async () => {
    const { updateShoppingListItem } = await import('../repositories/shoppingListRepository');
    await updateShoppingListItem({
      name: 'X',
      quantity: 1,
      unit: 'Stk',
      isChecked: false,
      category: 'Sonstiges',
      sortOrder: 1,
    });
    expect(shoppingListUpdate).not.toHaveBeenCalled();
  });

  it('clearShoppingList gibt 0 zurueck ohne clear bei leerer Liste', async () => {
    shoppingListCount.mockResolvedValueOnce(0);
    const { clearShoppingList } = await import('../repositories/shoppingListRepository');
    const removed = await clearShoppingList();
    expect(removed).toBe(0);
    expect(shoppingListClear).not.toHaveBeenCalled();
  });

  it('clearShoppingList leert Tabelle wenn count > 0', async () => {
    const { clearShoppingList } = await import('../repositories/shoppingListRepository');
    const removed = await clearShoppingList();
    expect(removed).toBe(3);
    expect(shoppingListClear).toHaveBeenCalled();
  });

  it('moveCheckedToPantry verschiebt abgehakte Items', async () => {
    isCheckedEquals.mockReturnValue({
      toArray: vi.fn().mockResolvedValue([
        { id: 9, name: 'Milch', quantity: 1, unit: 'l', category: 'Milchprodukte', isChecked: true },
      ]),
    });
    const { moveCheckedToPantry } = await import('../repositories/shoppingListRepository');
    const moved = await moveCheckedToPantry();
    expect(moved).toBe(1);
    expect(pantryAdd).toHaveBeenCalled();
    expect(shoppingListDelete).toHaveBeenCalledWith(9);
  });

  it('updateShoppingListItem aktualisiert bei gesetzter id', async () => {
    const { updateShoppingListItem } = await import('../repositories/shoppingListRepository');
    await updateShoppingListItem({
      id: 4,
      name: 'Milch',
      quantity: 2,
      unit: 'l',
      isChecked: false,
      category: 'Milchprodukte',
      sortOrder: 100,
    });
    expect(shoppingListUpdate).toHaveBeenCalledWith(4, expect.objectContaining({ name: 'Milch' }));
  });

  it('renameShoppingListCategory benennt Kategorie um', async () => {
    const { renameShoppingListCategory } = await import('../repositories/shoppingListRepository');
    await renameShoppingListCategory('Alt', 'Neu');
    expect(shoppingListModify).toHaveBeenCalled();
  });

  it('generateListFromMealPlan fuegt fehlende Zutaten hinzu', async () => {
    const upcomingMeals = [
      { date: '2026-06-02', recipeId: 1, isCooked: false, mealType: 'Mittagessen' as const },
    ];
    const mealPlanBetween = vi.fn(() => ({
      filter: vi.fn(() => ({ toArray: vi.fn().mockResolvedValue(upcomingMeals) })),
    }));
    const { db } = await import('../dbInstance');
    vi.mocked(db.mealPlan.where).mockReturnValue({
      between: mealPlanBetween,
    } as unknown as ReturnType<typeof db.mealPlan.where>);

    vi.mocked(db.recipes.where).mockReturnValue({
      anyOf: vi.fn(() => ({
        toArray: vi.fn().mockResolvedValue([
          {
            id: 1,
            servings: '2',
            ingredients: [
              {
                sectionTitle: 'Haupt',
                items: [{ name: 'Pasta', quantity: '200', unit: 'g' }],
              },
            ],
          },
        ]),
      })),
    } as unknown as ReturnType<typeof db.recipes.where>);

    const { generateListFromMealPlan } = await import('../repositories/shoppingListRepository');
    const out = await generateListFromMealPlan();
    expect(out.added).toBe(1);
    expect(shoppingListAdd).toHaveBeenCalled();
  });

  it('batchAddShoppingListItems zaehlt added und updated', async () => {
    equalsIgnoreCaseFirst
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        id: 2,
        name: 'Brot',
        quantity: 1,
        unit: 'Stk',
        isChecked: false,
        category: 'Backwaren',
        sortOrder: 100,
      });
    const { batchAddShoppingListItems } = await import('../repositories/shoppingListRepository');
    const out = await batchAddShoppingListItems([
      { name: 'Eier', quantity: 6, unit: 'Stk' },
      { name: 'Brot', quantity: 1, unit: 'Stk' },
    ]);
    expect(out.added).toBe(1);
    expect(out.updated).toBe(1);
  });

  it('generateListFromMealPlan: pantry/existing/qty0/missing recipe', async () => {
    const upcomingMeals = [
      { date: '2026-06-02', recipeId: 1, isCooked: false, mealType: 'Mittagessen' as const, servings: 4 },
      { date: '2026-06-03', recipeId: 99, isCooked: false, mealType: 'Abendessen' as const },
    ];
    const mealPlanBetween = vi.fn(() => ({
      filter: vi.fn(() => ({ toArray: vi.fn().mockResolvedValue(upcomingMeals) })),
    }));
    const { db } = await import('../dbInstance');
    vi.mocked(db.mealPlan.where).mockReturnValue({
      between: mealPlanBetween,
    } as unknown as ReturnType<typeof db.mealPlan.where>);

    vi.mocked(db.recipes.where).mockReturnValue({
      anyOf: vi.fn(() => ({
        toArray: vi.fn().mockResolvedValue([
          {
            id: 1,
            servings: '2',
            ingredients: [
              {
                sectionTitle: 'Haupt',
                items: [
                  { name: 'Pasta', quantity: '200', unit: 'g' },
                  { name: 'Salz', quantity: '0', unit: 'g' },
                  { name: 'Milch', quantity: '1', unit: 'l' },
                ],
              },
            ],
          },
        ]),
      })),
    } as unknown as ReturnType<typeof db.recipes.where>);

    vi.mocked(db.pantry.toArray).mockResolvedValue([
      { id: 1, name: 'Pasta', quantity: 500, unit: 'g', category: 'x', createdAt: 1, updatedAt: 1 },
    ]);

    isCheckedEquals.mockReturnValue({
      toArray: vi.fn().mockResolvedValue([{ id: 3, name: 'Milch', isChecked: false }]),
    });

    const { generateListFromMealPlan } = await import('../repositories/shoppingListRepository');
    const out = await generateListFromMealPlan();
    expect(out.existing).toBeGreaterThanOrEqual(1);
    expect(out.added).toBe(0);
  });

  it('moveCheckedToPantry merged bestehende Pantry-Menge', async () => {
    isCheckedEquals.mockReturnValue({
      toArray: vi.fn().mockResolvedValue([
        { id: 9, name: 'Milch', quantity: 1, unit: 'l', category: 'Milchprodukte', isChecked: true },
      ]),
    });
    pantryFirst.mockResolvedValueOnce({
      id: 2,
      name: 'Milch',
      quantity: 2,
      unit: 'l',
      category: 'Milchprodukte',
      createdAt: 1,
      updatedAt: 1,
    });
    const { moveCheckedToPantry } = await import('../repositories/shoppingListRepository');
    const moved = await moveCheckedToPantry();
    expect(moved).toBe(1);
    expect(pantryUpdate).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ quantity: 3, updatedAt: expect.any(Number) }),
    );
    expect(pantryAdd).not.toHaveBeenCalled();
  });
});
