import { beforeEach, describe, expect, it, vi } from 'vitest';

const pantryFirst = vi.fn();
const pantryUpdate = vi.fn();
const pantryAdd = vi.fn().mockResolvedValue(55);
const whereMock = vi.fn(() => ({
  equalsIgnoreCase: vi.fn(() => ({ first: pantryFirst })),
}));

vi.mock('../retryUtils', () => ({
  retry: async <T>(fn: () => Promise<T>) => fn(),
}));

vi.mock('../dbInstance', () => ({
  db: {
    transaction: vi.fn((_mode: string, _tables: unknown, fn: () => Promise<unknown>) => fn()),
    pantry: {
      where: whereMock,
      update: pantryUpdate,
      add: pantryAdd,
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
