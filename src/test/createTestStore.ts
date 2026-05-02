import { combineReducers, configureStore } from '@reduxjs/toolkit';
import uiReducer from '@/store/slices/uiSlice';
import settingsReducer from '@/store/slices/settingsSlice';
import shoppingListReducer from '@/store/slices/shoppingListSlice';
import { getDefaultSettings } from '@/services/settingsService';

const testRootReducer = combineReducers({
  ui: uiReducer,
  settings: settingsReducer,
  shoppingList: shoppingListReducer,
});

type TestRootState = ReturnType<typeof testRootReducer>;
type TestPreloaded = Partial<TestRootState>;

export function createTestStore(preloaded?: TestPreloaded) {
  return configureStore({
    reducer: testRootReducer,
    preloadedState: {
      settings: getDefaultSettings(),
      ...preloaded,
    },
  });
}
