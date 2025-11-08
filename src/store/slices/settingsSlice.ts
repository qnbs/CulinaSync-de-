import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../../types';
import { loadSettings, saveSettings } from '../../services/settingsService';

const initialState: AppSettings = loadSettings();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<AppSettings>) => {
      saveSettings(action.payload);
      return action.payload;
    },
    setPantrySort: (state, action: PayloadAction<AppSettings['pantry']['defaultSort']>) => {
      state.pantry.defaultSort = action.payload;
      saveSettings(state);
    },
    setPantryGrouping: (state, action: PayloadAction<boolean>) => {
      state.pantry.isGrouped = action.payload;
      saveSettings(state);
    },
  },
});

export const { updateSettings, setPantrySort, setPantryGrouping } = settingsSlice.actions;

export default settingsSlice.reducer;