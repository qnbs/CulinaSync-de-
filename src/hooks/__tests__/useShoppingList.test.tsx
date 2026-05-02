import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useShoppingList } from '../useShoppingList';
import { createTestStore } from '@/test/createTestStore';
import { setVoiceAction } from '@/store/slices/uiSlice';
import type { ShoppingListItem } from '@/types';

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (fn: () => unknown) => fn(),
}));

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

vi.mock('../../services/dbInstance', () => ({
  db: {
    shoppingList: {
      orderBy: () => ({
        toArray: () => mockItems,
      }),
    },
    pantry: { toArray: () => [] },
    recipes: { toArray: () => [] },
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'de' },
  }),
}));

vi.mock('@/services/repositories/shoppingListRepository', () => ({
  updateShoppingListItem: vi.fn().mockResolvedValue(undefined),
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
});
