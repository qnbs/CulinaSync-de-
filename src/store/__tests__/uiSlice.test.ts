import { describe, expect, it } from 'vitest';
import reducer, {
  addToast,
  clearInitialSelectedId,
  navigateToItem,
  removeToast,
  setCommandPaletteOpen,
  setCurrentPage,
  setFocusAction,
  setVoiceAction,
} from '../slices/uiSlice';

const initialState = {
  currentPage: 'pantry',
  isCommandPaletteOpen: false,
  toasts: [],
  focusAction: null,
  initialSelectedId: null,
  voiceAction: null,
};

describe('uiSlice', () => {
  it('returns initial state for unknown action', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toMatchObject(initialState);
  });

  describe('setCurrentPage', () => {
    it('switches page and clears initialSelectedId', () => {
      const state = { ...initialState, currentPage: 'pantry' as const, initialSelectedId: 42 } as ReturnType<typeof reducer>;
      const result = reducer(state, setCurrentPage({ page: 'recipes' }));
      expect(result.currentPage).toBe('recipes');
      expect(result.initialSelectedId).toBeNull();
    });

    it('sets focusAction when provided', () => {
      const result = reducer(undefined, setCurrentPage({ page: 'pantry', focusTarget: 'quick-add' }));
      expect(result.focusAction).toBe('quick-add');
    });

    it('does not overwrite focusAction when not provided', () => {
      const state = { ...initialState, focusAction: 'existing' } as ReturnType<typeof reducer>;
      const result = reducer(state, setCurrentPage({ page: 'pantry' }));
      expect(result.focusAction).toBe('existing');
    });
  });

  describe('navigateToItem', () => {
    it('sets page, id, and closes command palette', () => {
      const state = { ...initialState, isCommandPaletteOpen: true } as ReturnType<typeof reducer>;
      const result = reducer(state, navigateToItem({ page: 'pantry', id: 7 }));
      expect(result.currentPage).toBe('pantry');
      expect(result.initialSelectedId).toBe(7);
      expect(result.isCommandPaletteOpen).toBe(false);
    });
  });

  describe('setCommandPaletteOpen', () => {
    it('opens and closes the command palette', () => {
      const opened = reducer(undefined, setCommandPaletteOpen(true));
      expect(opened.isCommandPaletteOpen).toBe(true);
      const closed = reducer(opened, setCommandPaletteOpen(false));
      expect(closed.isCommandPaletteOpen).toBe(false);
    });
  });

  describe('addToast / removeToast', () => {
    it('adds a toast with a generated id', () => {
      const result = reducer(undefined, addToast({ message: 'Saved!', type: 'success' }));
      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].message).toBe('Saved!');
      expect(result.toasts[0].type).toBe('success');
      expect(result.toasts[0].id).toBeDefined();
    });

    it('defaults type to success', () => {
      const result = reducer(undefined, addToast({ message: 'Hello' }));
      expect(result.toasts[0].type).toBe('success');
    });

    it('accumulates multiple toasts', () => {
      let state = reducer(undefined, addToast({ message: 'A' }));
      state = reducer(state, addToast({ message: 'B' }));
      expect(state.toasts).toHaveLength(2);
    });

    it('removes a toast by id', () => {
      const withToast = reducer(undefined, addToast({ message: 'X' }));
      const id = withToast.toasts[0].id;
      const result = reducer(withToast, removeToast(id));
      expect(result.toasts).toHaveLength(0);
    });

    it('ignores removeToast for unknown id', () => {
      const withToast = reducer(undefined, addToast({ message: 'Y' }));
      const result = reducer(withToast, removeToast('nonexistent-id'));
      expect(result.toasts).toHaveLength(1);
    });
  });

  describe('setFocusAction / clearInitialSelectedId', () => {
    it('sets and clears focusAction', () => {
      const set = reducer(undefined, setFocusAction('my-target'));
      expect(set.focusAction).toBe('my-target');
      const cleared = reducer(set, setFocusAction(null));
      expect(cleared.focusAction).toBeNull();
    });

    it('clearInitialSelectedId resets to null', () => {
      const state = { ...initialState, initialSelectedId: 99 } as ReturnType<typeof reducer>;
      const result = reducer(state, clearInitialSelectedId());
      expect(result.initialSelectedId).toBeNull();
    });
  });

  describe('setVoiceAction', () => {
    it('sets and clears voiceAction', () => {
      const set = reducer(undefined, setVoiceAction({ type: 'navigate', payload: 'recipes' }));
      expect(set.voiceAction).toEqual({ type: 'navigate', payload: 'recipes' });
      const cleared = reducer(set, setVoiceAction(null));
      expect(cleared.voiceAction).toBeNull();
    });
  });
});
