import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { Page } from '../../types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UiState {
  currentPage: Page;
  isCommandPaletteOpen: boolean;
  toasts: Toast[];
  focusAction: string | null;
  initialSelectedId: number | null;
  voiceAction: { type: string; payload: any } | null;
}

const initialState: UiState = {
  currentPage: 'pantry',
  isCommandPaletteOpen: false,
  toasts: [],
  focusAction: null,
  initialSelectedId: null,
  voiceAction: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<{ page: Page; focusTarget?: string }>) => {
      state.currentPage = action.payload.page;
      state.initialSelectedId = null;
      if (action.payload.focusTarget) {
        state.focusAction = action.payload.focusTarget;
      }
    },
    navigateToItem: (state, action: PayloadAction<{ page: 'recipes' | 'pantry'; id: number }>) => {
        state.initialSelectedId = action.payload.id;
        state.currentPage = action.payload.page;
        state.isCommandPaletteOpen = false;
    },
    setCommandPaletteOpen: (state, action: PayloadAction<boolean>) => {
      state.isCommandPaletteOpen = action.payload;
    },
    addToast: {
        reducer: (state, action: PayloadAction<Toast>) => {
            state.toasts.push(action.payload);
        },
        prepare: (payload: { message: string, type?: 'success' | 'error' | 'info'}) => {
            return { payload: { id: nanoid(), type: 'success', ...payload } }
        }
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    setFocusAction: (state, action: PayloadAction<string | null>) => {
        state.focusAction = action.payload;
    },
    setVoiceAction: (state, action: PayloadAction<{type: string, payload: any} | null>) => {
        state.voiceAction = action.payload;
    },
    clearInitialSelectedId: (state) => {
        state.initialSelectedId = null;
    }
  },
});

export const { 
    setCurrentPage, 
    navigateToItem, 
    setCommandPaletteOpen, 
    addToast, 
    removeToast, 
    setFocusAction,
    setVoiceAction,
    clearInitialSelectedId
} = uiSlice.actions;

export default uiSlice.reducer;