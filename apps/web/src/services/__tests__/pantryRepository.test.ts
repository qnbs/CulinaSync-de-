import { beforeEach, describe, expect, it, vi } from 'vitest';

const pantryFirst = vi.fn();
const pantryUpdate = vi.fn();
const pantryAdd = vi.fn().mockResolvedValue(55);
const pantryDelete = vi.fn().mockResolvedValue(1);
const shoppingListToArray = vi.fn().mockResolvedValue([]);
const whereMock = vi.fn(() => ({
  equalsIgnoreCase: vi.fn(() => ({ first: pantryFirst })),
}));

vi.mock('../retryUtils', () => ({
  retry: async <T>(fn: () => Promise<T>) => fn(),
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
    pantry: {
      where: whereMock,
      update: pantryUpdate,
      add: pantryAdd,
    },
    shoppingList: {
      toArray: shoppingListToArray,
    },
  },
}));

vi.mock('../utils', () => ({
  getCategoryForItem: vi.fn(() => 'Backwaren'),
}));

describe('pantryRepository addOrUpdatePantryItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pantryFirst.mockReset();
  });

  it('aktualisiert Menge wenn Name existiert', async () => {
    pantryFirst.mockResolvedValue({
      id: 10,
      name: 'Mehl',
      quantity: 100,
      unit: 'g',
      createdAt: 1,
      updatedAt: 1,
    });
    const { addOrUpdatePantryItem } = await import('../repositories/pantryRepository');
    const out = await addOrUpdatePantryItem({ name: 'mehl', quantity: 50, unit: 'g' });
    expect(out.status).toBe('updated');
    expect(out.item.quantity).toBe(150);
    expect(pantryUpdate).toHaveBeenCalledWith(10, expect.objectContaining({ quantity: 150 }));
    expect(pantryAdd).not.toHaveBeenCalled();
  });

  it('legt neuen Eintrag an wenn Name fehlt', async () => {
    pantryFirst.mockResolvedValue(undefined);
    const { addOrUpdatePantryItem } = await import('../repositories/pantryRepository');
    const out = await addOrUpdatePantryItem({ name: 'Zucker', quantity: 1, unit: 'kg', category: 'Süss' });
    expect(out.status).toBe('added');
    expect(pantryAdd).toHaveBeenCalled();
    expect(out.item.id).toBe(55);
  });
});

describe('pantryRepository weitere Operationen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removeItemFromPantry gibt true zurueck wenn geloescht', async () => {
    whereMock.mockReturnValue({
      equalsIgnoreCase: vi.fn(() => ({ delete: pantryDelete })),
    } as unknown as ReturnType<typeof whereMock>);
    const { removeItemFromPantry } = await import('../repositories/pantryRepository');
    const ok = await removeItemFromPantry('Mehl');
    expect(ok).toBe(true);
    expect(pantryDelete).toHaveBeenCalled();
  });

  it('removeItemFromPantry gibt false wenn nichts geloescht', async () => {
    pantryDelete.mockResolvedValueOnce(0);
    whereMock.mockReturnValue({
      equalsIgnoreCase: vi.fn(() => ({ delete: pantryDelete })),
    } as unknown as ReturnType<typeof whereMock>);
    const { removeItemFromPantry } = await import('../repositories/pantryRepository');
    expect(await removeItemFromPantry('Unbekannt')).toBe(false);
  });

  it('addPantryItemsToShoppingList zaehlt neue Eintraege', async () => {
    const pantryItems = [
      { id: 3, name: 'Butter', quantity: 1, unit: 'Stk', category: 'Milch', createdAt: 1, updatedAt: 1 },
    ];
    whereMock.mockImplementation(((field: string) => {
      if (field === 'id') {
        return {
          anyOf: vi.fn(() => ({ toArray: vi.fn().mockResolvedValue(pantryItems) })),
        };
      }
      return { equalsIgnoreCase: vi.fn(() => ({ first: pantryFirst })) };
    }) as typeof whereMock);
    shoppingListToArray.mockResolvedValueOnce([]);
    const { addPantryItemsToShoppingList } = await import('../repositories/pantryRepository');
    const count = await addPantryItemsToShoppingList([3]);
    expect(count).toBe(1);
  });
});
