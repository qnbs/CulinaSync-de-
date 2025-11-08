import { AppSettings } from '../types';

export const SETTINGS_KEY = 'culinaSyncSettings';

export const getDefaultSettings = (): AppSettings => ({
  displayName: 'Mein Haushalt',
  defaultServings: 2,
  weekStart: 'Monday',
  aiPreferences: {
    dietaryRestrictions: [],
    preferredCuisines: [],
    customInstruction: '',
  },
  pantry: {
    defaultSort: 'name',
    isGrouped: true,
    expiryWarningDays: 3,
  },
  recipeBook: {
    defaultSort: 'newest',
  },
  shoppingList: {
    groupCheckedAtBottom: true,
    defaultSort: 'category',
    autoCategorize: true,
  },
  speechSynthesis: {
    voice: null,
    rate: 1,
    pitch: 1,
  },
  appearance: {
    accentColor: 'amber',
  },
});

export const loadSettings = (): AppSettings => {
  try {
    const storedSettings = window.localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      // Merge with defaults to handle new settings being added in updates
      const parsed = JSON.parse(storedSettings);
      const defaults = getDefaultSettings();
      return { 
          ...defaults, 
          ...parsed, 
          aiPreferences: { ...defaults.aiPreferences, ...(parsed.aiPreferences || {}) },
          pantry: { ...defaults.pantry, ...(parsed.pantry || {}) },
          recipeBook: { ...defaults.recipeBook, ...(parsed.recipeBook || {}) },
          shoppingList: { ...defaults.shoppingList, ...(parsed.shoppingList || {}) },
          speechSynthesis: { ...defaults.speechSynthesis, ...(parsed.speechSynthesis || {}) },
          appearance: { ...defaults.appearance, ...(parsed.appearance || {}) },
        };
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage", error);
  }
  return getDefaultSettings();
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage", error);
  }
};