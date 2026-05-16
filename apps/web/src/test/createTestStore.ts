import { combineReducers, configureStore } from '@reduxjs/toolkit';
import uiReducer from '@/store/slices/uiSlice';
import settingsReducer from '@/store/slices/settingsSlice';
import shoppingListReducer from '@/store/slices/shoppingListSlice';
import { aiCloudApi } from '@/store/aiCloudApi';
import { getDefaultSettings } from '@/services/settingsService';

const testRootReducer = combineReducers({
  ui: uiReducer,
  settings: settingsReducer,
  shoppingList: shoppingListReducer,
  [aiCloudApi.reducerPath]: aiCloudApi.reducer,
});

type TestRootState = ReturnType<typeof testRootReducer>;
type TestPreloaded = Partial<TestRootState>;

export function createTestStore(preloaded?: TestPreloaded) {
  return configureStore({
    reducer: testRootReducer,
    middleware: (gDM) => gDM().concat(aiCloudApi.middleware),
    preloadedState: {
      settings: getDefaultSettings(),
      ...preloaded,
    },
  });
}
