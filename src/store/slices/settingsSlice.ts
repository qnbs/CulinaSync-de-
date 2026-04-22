import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../../types';
import { loadSettings } from '../../services/settingsService';

const initialState: AppSettings = loadSettings();

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