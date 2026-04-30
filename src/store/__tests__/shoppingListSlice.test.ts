import { describe, expect, it } from 'vitest';
import reducer, {
  collapseAll,
  expandAll,
  setAiModalOpen,
  setBulkAddModalOpen,
  setEditingCategory,
  setEditingItem,
  setExportOpen,
  setShoppingMode,
  toggleCategoryCollapse,
  toggleCompletedVisible,
} from '../slices/shoppingListSlice';
import type { ShoppingListItem } from '../../types';

const initialState = {
  status: 'idle',
  isAiModalOpen: false,
  isBulkAddModalOpen: false,
  editingItem: null,
  editingCategory: null,
  isCompletedVisible: true,
  isExportOpen: false,
  isShoppingMode: false,
  collapsedCategories: [],
  isGenerating: false,
  error: null,
} as const;

const SAMPLE_ITEM: ShoppingListItem = {
  id: 1,
  name: 'Milch',
  quantity: 1,
  unit: 'Liter',
  category: 'Milchprodukte',
  isChecked: false,
  sortOrder: 0,
};

describe('shoppingListSlice', () => {
  it('returns initial state for unknown action', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toMatchObject(initialState);
  });

  describe('modal flags', () => {
    it('setAiModalOpen toggles AI modal', () => {
      const open = reducer(undefined, setAiModalOpen(true));
      expect(open.isAiModalOpen).toBe(true);
      expect(reducer(open, setAiModalOpen(false)).isAiModalOpen).toBe(false);
    });

    it('setBulkAddModalOpen toggles bulk add modal', () => {
      const open = reducer(undefined, setBulkAddModalOpen(true));
      expect(open.isBulkAddModalOpen).toBe(true);
    });

    it('setExportOpen toggles export dropdown', () => {
      expect(reducer(undefined, setExportOpen(true)).isExportOpen).toBe(true);
    });
  });

  describe('editing state', () => {
    it('setEditingItem stores and clears item', () => {
      const set = reducer(undefined, setEditingItem(SAMPLE_ITEM));
      expect(set.editingItem).toEqual(SAMPLE_ITEM);
      const cleared = reducer(set, setEditingItem(null));
      expect(cleared.editingItem).toBeNull();
    });

    it('setEditingCategory stores rename operation', () => {
      const set = reducer(undefined, setEditingCategory({ oldName: 'A', newName: 'B' }));
      expect(set.editingCategory).toEqual({ oldName: 'A', newName: 'B' });
      expect(reducer(set, setEditingCategory(null)).editingCategory).toBeNull();
    });
  });

  describe('toggleCompletedVisible', () => {
    it('flips visibility state', () => {
      const hidden = reducer(undefined, toggleCompletedVisible());
      expect(hidden.isCompletedVisible).toBe(false);
      const visible = reducer(hidden, toggleCompletedVisible());
      expect(visible.isCompletedVisible).toBe(true);
    });
  });

  describe('setShoppingMode', () => {
    it('enables and disables shopping mode', () => {
      const on = reducer(undefined, setShoppingMode(true));
      expect(on.isShoppingMode).toBe(true);
      const off = reducer(on, setShoppingMode(false));
      expect(off.isShoppingMode).toBe(false);
    });
  });

  describe('category collapse', () => {
    it('toggleCategoryCollapse adds a category', () => {
      const result = reducer(undefined, toggleCategoryCollapse('Milchprodukte'));
      expect(result.collapsedCategories).toContain('Milchprodukte');
    });

    it('toggleCategoryCollapse removes an already-collapsed category', () => {
      const collapsed = reducer(undefined, toggleCategoryCollapse('Obst'));
      const expanded = reducer(collapsed, toggleCategoryCollapse('Obst'));
      expect(expanded.collapsedCategories).not.toContain('Obst');
    });

    it('collapseAll merges categories without duplicates', () => {
      const state = { ...initialState, collapsedCategories: ['A'] };
      const result = reducer(state, collapseAll(['A', 'B', 'C']));
      expect(result.collapsedCategories).toEqual(expect.arrayContaining(['A', 'B', 'C']));
      expect(result.collapsedCategories.filter(c => c === 'A')).toHaveLength(1);
    });

    it('expandAll empties collapsedCategories', () => {
      const state = { ...initialState, collapsedCategories: ['X', 'Y'] };
      const result = reducer(state, expandAll());
      expect(result.collapsedCategories).toHaveLength(0);
    });
  });
});
