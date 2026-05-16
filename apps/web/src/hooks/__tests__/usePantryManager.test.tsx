import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { usePantryManager } from '../usePantryManager';
import { createTestStore } from '@/test/createTestStore';
import type { PantryItem } from '@/types';
import { useLiveQuery } from 'dexie-react-hooks';

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

vi.mock('../useDebounce', () => ({
  useDebounce: <T,>(v: T) => v,
}));

vi.mock('../../components/PantryListItem', () => ({
  getExpiryStatus: vi.fn((expiry?: string) => {
    if (expiry === 'EXP') return 'expired';
    if (expiry === 'NEAR') return 'nearing';
    return 'all';
  }),
}));

const pantryDbMocks = vi.hoisted(() => ({
  pantryUpdate: vi.fn(),
  pantryDelete: vi.fn(),
  bulkDelete: vi.fn(),
}));

vi.mock('../../services/dbInstance', () => ({
  db: {
    pantry: {
      update: (...args: unknown[]) => pantryDbMocks.pantryUpdate(...args),
      delete: pantryDbMocks.pantryDelete,
      bulkDelete: pantryDbMocks.bulkDelete,
    },
    transaction: vi.fn((_m: string, _t: unknown, fn: () => Promise<void>) => fn()),
  },
}));

vi.mock('../../services/repositories/pantryRepository', () => ({
  addOrUpdatePantryItem: vi.fn(),
  addPantryItemsToShoppingList: vi.fn().mockResolvedValue(1),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const mockPantry: PantryItem[] = [
  { id: 1, name: 'Apfel', quantity: 1, unit: 'Stk', category: 'Obst', createdAt: 1, updatedAt: 1, expiryDate: 'EXP' },
  { id: 2, name: 'Banane', quantity: 2, unit: 'Stk', category: 'Obst', createdAt: 1, updatedAt: 1 },
  { id: 3, name: 'Milch', quantity: 1, unit: 'l', category: 'Kühlung', createdAt: 1, updatedAt: 1 },
];

describe('usePantryManager', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLiveQuery).mockReturnValue(mockPantry);
    store = createTestStore();
  });

  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;

  it('filtert nach Textsuche (Debouncing durch Mock pass-through)', () => {
    const { result } = renderHook(() => usePantryManager(), { wrapper });
    act(() => {
      result.current.setSearchTerm('mil');
    });
    expect(result.current.filteredItems.map((i) => i.name)).toEqual(['Milch']);
  });

  it('filtert nach Ablaufstatus expired', () => {
    const { result } = renderHook(() => usePantryManager(), { wrapper });
    act(() => {
      result.current.setExpiryFilter('expired');
    });
    expect(result.current.filteredItems.map((i) => i.id)).toEqual([1]);
  });

  it('gruppiert gefilterte Items wenn isGrouped aktiv', () => {
    const { result } = renderHook(() => usePantryManager(), { wrapper });
    act(() => {
      result.current.setIsGrouped(true);
    });
    expect(result.current.groupedItems?.Obst?.map((i) => i.name)).toEqual(['Apfel', 'Banane']);
    expect(result.current.groupedItems?.Kühlung?.map((i) => i.name)).toEqual(['Milch']);
  });

  it('toggleSelectItem verwaltet Auswahl', () => {
    const { result } = renderHook(() => usePantryManager(), { wrapper });
    act(() => {
      result.current.toggleSelectItem(1);
    });
    expect(result.current.selectedItems).toEqual([1]);
    act(() => {
      result.current.toggleSelectItem(1);
    });
    expect(result.current.selectedItems).toEqual([]);
  });

  it('adjustQuantity bei Menge 0 oeffnet Entfernen-Pending', () => {
    const { result } = renderHook(() => usePantryManager(), { wrapper });
    const item = mockPantry[2];
    act(() => {
      void result.current.adjustQuantity(item, -1);
    });
    expect(result.current.pendingAction).toEqual({ type: 'removeItem', item });
  });

  it('confirmPendingAction removeItem loescht in DB', async () => {
    const { result } = renderHook(() => usePantryManager(), { wrapper });
    const item = mockPantry[0];
    act(() => {
      void result.current.adjustQuantity(item, -item.quantity);
    });
    await act(async () => {
      await result.current.confirmPendingAction();
    });
    expect(pantryDbMocks.pantryDelete).toHaveBeenCalledWith(item.id);
  });

  it('handleQuickAdd ruft addOrUpdatePantryItem auf', async () => {
    const { addOrUpdatePantryItem } = await import('../../services/repositories/pantryRepository');
    vi.mocked(addOrUpdatePantryItem).mockResolvedValueOnce({
      status: 'added',
      item: { id: 9, name: 'Honig', quantity: 1, unit: 'g', category: 'x', createdAt: 1, updatedAt: 1 },
    });
    const { result } = renderHook(() => usePantryManager(), { wrapper });
    await act(async () => {
      await result.current.handleQuickAdd('Honig 500g');
    });
    expect(addOrUpdatePantryItem).toHaveBeenCalled();
  });

  it('handleSearchTermChange setzt Voice-Suche zurueck', () => {
    store = createTestStore({
      ui: {
        currentPage: 'pantry',
        toasts: [],
        focusAction: null,
        initialSelectedId: null,
        voiceAction: { type: 'SEARCH', payload: 'Alt#' },
      },
    });
    const { result } = renderHook(() => usePantryManager(), { wrapper });
    expect(result.current.searchTerm).toContain('Alt');
    act(() => {
      result.current.setSearchTerm('neu');
    });
    expect(store.getState().ui.voiceAction).toBeNull();
  });

  it('handleAddToShoppingList nutzt Repository', async () => {
    const { addPantryItemsToShoppingList } = await import('../../services/repositories/pantryRepository');
    const { result } = renderHook(() => usePantryManager(), { wrapper });
    await act(async () => {
      await result.current.handleAddToShoppingList(mockPantry[0]);
    });
    await waitFor(() => {
      expect(addPantryItemsToShoppingList).toHaveBeenCalledWith([1]);
    });
  });
});
