import { createListenerMiddleware, isAnyOf, type SerializedError } from '@reduxjs/toolkit';
import { addToast, navigateToItem } from './slices/uiSlice';
import { useTransientUiStore } from './transientUiStore';
import {
  clearListAsync,
  generateFromPlanAsync,
  addItemAsync,
  addItemsAsync,
  renameCategoryAsync,
  moveToPantryAsync
} from './slices/shoppingListSlice';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: navigateToItem.match,
  effect: () => {
    useTransientUiStore.getState().setCommandPaletteOpen(false);
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(
    clearListAsync.rejected,
    generateFromPlanAsync.rejected,
    addItemAsync.rejected,
    addItemsAsync.rejected,
    renameCategoryAsync.rejected,
    moveToPantryAsync.rejected
    ),
  effect: (action, listenerApi) => {
    // QNBS-v3: RTK 2.12 no longer propagates isAnyOf narrowing through startListening's
    // matcher option, so type the rejected-thunk shape explicitly | keeps error/payload access | version-robust
    const { payload, error } = action as { payload?: unknown; error?: SerializedError };

    const errorMessage = typeof error === 'object'
      && error !== null
      && 'message' in error
      && typeof error.message === 'string'
      ? error.message
      : null;

    if (typeof payload === 'string') {
      listenerApi.dispatch(addToast({ message: payload, type: 'error' }));
    } else if (errorMessage) {
      listenerApi.dispatch(addToast({ message: errorMessage, type: 'error' }));
    }
  },
});