import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { addToast } from './slices/uiSlice';
import { generateRecipeIdeasAsync, generateFullRecipeAsync } from './slices/aiChefSlice';
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
    generateRecipeIdeasAsync.rejected, 
    generateFullRecipeAsync.rejected,
    clearListAsync.rejected,
    generateFromPlanAsync.rejected,
    addItemAsync.rejected,
    addItemsAsync.rejected,
    renameCategoryAsync.rejected,
    moveToPantryAsync.rejected
    ),
  effect: (action, listenerApi) => {
    if (action.payload) {
      listenerApi.dispatch(addToast({ message: action.payload as string, type: 'error' }));
    } else if (action.error.message) {
      listenerApi.dispatch(addToast({ message: action.error.message, type: 'error' }));
    }
  },
});