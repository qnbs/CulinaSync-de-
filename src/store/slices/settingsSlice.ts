import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../../types';
import { getDefaultSettings } from '../../services/settingsService';

// Redux Persist rehydrates the real persisted state via the REHYDRATE action.
// The defaults here are only used for a brand-new install with no stored data.
const initialState: AppSettings = getDefaultSettings();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (_state, action: PayloadAction<AppSettings>) => action.payload,
    setPantrySort: (state, action: PayloadAction<AppSettings['pantry']['defaultSort']>) => {
      state.pantry.defaultSort = action.payload;
    },
    setPantryGrouping: (state, action: PayloadAction<boolean>) => {
      state.pantry.isGrouped = action.payload;
    },
  },
});

export const { updateSettings, setPantrySort, setPantryGrouping } = settingsSlice.actions;

export default settingsSlice.reducer;