import { AppSettings } from '@/types';

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
});

export const loadSettings = (): AppSettings => {
  try {
    const storedSettings = window.localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      // Merge with defaults to handle new settings being added in updates
      const parsed = JSON.parse(storedSettings);
      return { 
          ...getDefaultSettings(), 
          ...parsed, 
          aiPreferences: {
              ...getDefaultSettings().aiPreferences, 
              ...(parsed.aiPreferences || {})
            } 
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
