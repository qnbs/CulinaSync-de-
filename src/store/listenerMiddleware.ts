import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { addToast } from './slices/uiSlice';
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
  matcher: isAnyOf(
    clearListAsync.rejected,
    generateFromPlanAsync.rejected,
    addItemAsync.rejected,
    addItemsAsync.rejected,
    renameCategoryAsync.rejected,
    moveToPantryAsync.rejected
    ),
  effect: (action, listenerApi) => {
    const errorMessage = typeof action.error === 'object'
      && action.error !== null
      && 'message' in action.error
      && typeof action.error.message === 'string'
      ? action.error.message
      : null;

    if (typeof action.payload === 'string') {
      listenerApi.dispatch(addToast({ message: action.payload, type: 'error' }));
    } else if (errorMessage) {
      listenerApi.dispatch(addToast({ message: errorMessage, type: 'error' }));
    }
  },
});