import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import uiReducer from './slices/uiSlice';
import settingsReducer from './slices/settingsSlice';
import aiChefReducer from './slices/aiChefSlice';
import shoppingListReducer from './slices/shoppingListSlice';
import { listenerMiddleware } from './listenerMiddleware';

const settingsPersistConfig = {
  key: 'settings',
  storage,
};

const persistedSettingsReducer = persistReducer(settingsPersistConfig, settingsReducer);

const rootReducer = combineReducers({
  ui: uiReducer,
  settings: persistedSettingsReducer,
  aiChef: aiChefReducer,
  shoppingList: shoppingListReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).prepend(listenerMiddleware.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;