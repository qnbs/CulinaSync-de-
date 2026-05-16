import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useShoppingList } from '../useShoppingList';
import { createTestStore } from '@/test/createTestStore';
import { setFocusAction, setVoiceAction } from '@/store/slices/uiSlice';
import { setEditingCategory } from '@/store/slices/shoppingListSlice';
import type { ShoppingListItem } from '@/types';

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (fn: () => unknown) => fn(),
}));

// QNBS-v3: stabile DB-/Export-Mocks für confirmPendingAction-Pfade (Dexie-Thunks)
const slTest = vi.hoisted(() => {
  const mockItems: ShoppingListItem[] = [
    {
      id: 1,
      name: 'Milch',
      quantity: 1,
      unit: 'l',
      isChecked: false,
      recipeId: undefined,
      category: 'Kühlung',
      sortOrder: 10,
    },
    {
      id: 2,
      name: 'Brot',
      quantity: 1,
      unit: 'Stk',
      isChecked: true,
      recipeId: undefined,
      category: 'Backwaren',
      sortOrder: 20,
    },
    {
      id: 3,
      name: 'Ohne Kategorie',
      quantity: 1,
      unit: 'Stk',
      isChecked: false,
      recipeId: undefined,
      category: '',
      sortOrder: 30,
    },
  ];
  const shoppingListDelete = vi.fn().mockResolvedValue(undefined);
  const db = {
    shoppingList: {
      orderBy: () => ({
        toArray: () => mockItems,
      }),
      delete: shoppingListDelete,
    },
    transaction: vi.fn((_mode: string, _stores: unknown, fn: () => Promise<void>) => fn()),
    pantry: { toArray: () => [] },
    recipes: { toArray: () => [] },
  };
  const exportShoppingListToPdf = vi.fn().mockResolvedValue(undefined);
  const exportShoppingListToCsv = vi.fn().mockResolvedValue(undefined);
  const exportShoppingListToJson = vi.fn().mockResolvedValue(undefined);
  const exportShoppingListToMarkdown = vi.fn().mockResolvedValue(undefined);
  const exportShoppingListToTxt = vi.fn().mockResolvedValue(undefined);
  return {
    mockItems,
    shoppingListDelete,
    db,
    exportShoppingListToPdf,
    exportShoppingListToCsv,
    exportShoppingListToJson,
    exportShoppingListToMarkdown,
    exportShoppingListToTxt,
  };
});

vi.mock('../../services/dbInstance', () => ({
  db: slTest.db,
}));

vi.mock('../../services/exportService', () => ({
  exportShoppingListToPdf: slTest.exportShoppingListToPdf,
  exportShoppingListToCsv: slTest.exportShoppingListToCsv,
  exportShoppingListToJson: slTest.exportShoppingListToJson,
  exportShoppingListToMarkdown: slTest.exportShoppingListToMarkdown,
  exportShoppingListToTxt: slTest.exportShoppingListToTxt,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'de' },
  }),
}));

vi.mock('@/services/repositories/shoppingListRepository', () => ({
  updateShoppingListItem: vi.fn().mockResolvedValue(undefined),
  clearShoppingList: vi.fn().mockResolvedValue(3),
  moveCheckedToPantry: vi.fn().mockResolvedValue(2),
  renameShoppingListCategory: vi.fn().mockResolvedValue(undefined),
  addShoppingListItem: vi.fn().mockResolvedValue({ status: 'added' as const, item: {} as ShoppingListItem }),
  batchAddShoppingListItems: vi.fn().mockResolvedValue({ added: 1, updated: 0 }),
  generateListFromMealPlan: vi.fn().mockResolvedValue({ added: 0, existing: 0 }),
}));

describe('useShoppingList', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;

  it('teilt aktive und erledigte Eintraege', () => {
    const { result } = renderHook(() => useShoppingList(), { wrapper });
    expect(result.current.activeItems.map((i) => i.name)).toEqual(['Milch', 'Ohne Kategorie']);
    expect(result.current.completedItems.map((i) => i.name)).toEqual(['Brot']);
  });

  it('gruppiert aktive Eintraege nach Kategorie (leer -> i18n-Schluessel)', () => {
    const { result } = renderHook(() => useShoppingList(), { wrapper });
    expect(Object.keys(result.current.groupedList).sort()).toEqual(['Kühlung', 'shoppingList.categories.misc'].sort());
    expect(result.current.groupedList['shoppingList.categories.misc'].map((i) => i.name)).toEqual(['Ohne Kategorie']);
  });

  it('setzt bei handleClearList ein clear-Pending, wenn die Liste nicht leer ist', () => {
    const { result } = renderHook(() => useShoppingList(), { wrapper });
    act(() => {
      result.current.handleClearList();
    });
    expect(result.current.pendingAction).toEqual({ type: 'clear' });
    expect(result.current.confirmationDialog?.title).toBe('shoppingList.confirm.clearTitle');
  });

  it('CHECK_SHOPPING_ITEM toggelt passenden offenen Eintrag und leert voiceAction', async () => {
    const { updateShoppingListItem } = await import('@/services/repositories/shoppingListRepository');

    renderHook(() => useShoppingList(), { wrapper });

    act(() => {
      store.dispatch(setVoiceAction({ type: 'CHECK_SHOPPING_ITEM', payload: 'milch#' }));
    });

    await waitFor(() => {
      expect(updateShoppingListItem).toHaveBeenCalled();
    });

    expect(store.getState().ui.voiceAction).toBeNull();
    const call = vi.mocked(updateShoppingListItem).mock.calls[0][0];
    expect(call.name).toBe('Milch');
    expect(call.isChecked).toBe(true);
  });

  it('confirmPendingAction: clear ruft clearShoppingList auf', async () => {
    const { clearShoppingList } = await import('@/services/repositories/shoppingListRepository');
    const { result } = renderHook(() => useShoppingList(), { wrapper });

    act(() => {
      result.current.handleClearList();
    });
    await act(async () => {
      await result.current.confirmPendingAction();
    });

    expect(clearShoppingList).toHaveBeenCalled();
  });

  it('confirmPendingAction: export csv laedt exportService dynamisch', async () => {
    const { result } = renderHook(() => useShoppingList(), { wrapper });

    await act(async () => {
      await result.current.handleExport('csv');
    });
    await act(async () => {
      await result.current.confirmPendingAction();
    });

    expect(slTest.exportShoppingListToCsv).toHaveBeenCalledWith(slTest.mockItems);
  });

  it('confirmPendingAction: moveToPantry ruft Repository auf', async () => {
    const { moveCheckedToPantry } = await import('@/services/repositories/shoppingListRepository');
    const { result } = renderHook(() => useShoppingList(), { wrapper });

    act(() => {
      void result.current.handleMoveToPantry();
    });
    await act(async () => {
      await result.current.confirmPendingAction();
    });

    expect(moveCheckedToPantry).toHaveBeenCalled();
  });

  it('confirmPendingAction: deleteItem loescht in der DB', async () => {
    const { result } = renderHook(() => useShoppingList(), { wrapper });

    act(() => {
      result.current.deleteItem(1);
    });
    await act(async () => {
      await result.current.confirmPendingAction();
    });

    expect(slTest.shoppingListDelete).toHaveBeenCalledWith(1);
  });

  it('cancelPendingAction raeumt clear-Fokus auf', async () => {
    const { result } = renderHook(() => useShoppingList(), { wrapper });

    act(() => {
      store.dispatch(setFocusAction('clear'));
    });
    expect(result.current.confirmationDialog?.title).toBe('shoppingList.confirm.clearTitle');

    act(() => {
      result.current.cancelPendingAction();
    });
    expect(store.getState().ui.focusAction).toBeNull();
  });

  it('handleRenameCategory nutzt renameShoppingListCategory', async () => {
    const { renameShoppingListCategory } = await import('@/services/repositories/shoppingListRepository');
    const { result } = renderHook(() => useShoppingList(), { wrapper });

    act(() => {
      store.dispatch(setEditingCategory({ oldName: 'Kühlung', newName: 'NeuKühl' }));
    });
    await act(async () => {
      await result.current.handleRenameCategory();
    });

    expect(renameShoppingListCategory).toHaveBeenCalledWith('Kühlung', 'NeuKühl');
  });
});
