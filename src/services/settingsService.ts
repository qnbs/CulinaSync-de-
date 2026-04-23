import { AppSettings } from '../types';

export const SETTINGS_KEY = 'culinaSyncSettings';
export const PERSISTED_SETTINGS_KEY = 'persist:settings';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const parseJson = (value: string): unknown => JSON.parse(value);

const mergeWithDefaults = (parsed: unknown): AppSettings => {
  const defaults = getDefaultSettings();
  const source = isRecord(parsed) ? parsed : {};

  return {
    ...defaults,
    ...source,
    aiPreferences: { ...defaults.aiPreferences, ...(isRecord(source.aiPreferences) ? source.aiPreferences : {}) },
    pantry: { ...defaults.pantry, ...(isRecord(source.pantry) ? source.pantry : {}) },
    recipeBook: { ...defaults.recipeBook, ...(isRecord(source.recipeBook) ? source.recipeBook : {}) },
    shoppingList: { ...defaults.shoppingList, ...(isRecord(source.shoppingList) ? source.shoppingList : {}) },
    speechSynthesis: { ...defaults.speechSynthesis, ...(isRecord(source.speechSynthesis) ? source.speechSynthesis : {}) },
    appearance: { ...defaults.appearance, ...(isRecord(source.appearance) ? source.appearance : {}) },
  };
};

const loadPersistedSettings = (): AppSettings | null => {
  const persistedSettings = window.localStorage.getItem(PERSISTED_SETTINGS_KEY);

  if (!persistedSettings) {
    return null;
  }

  const parsedPersistedSettings = parseJson(persistedSettings);
  if (!isRecord(parsedPersistedSettings)) {
    return null;
  }

  const hydratedSettings = Object.fromEntries(
    Object.entries(parsedPersistedSettings)
      .filter(([key]) => key !== '_persist')
      .map(([key, value]) => {
        if (typeof value !== 'string') {
          return [key, value];
        }

        try {
          return [key, parseJson(value)];
        } catch {
          return [key, value];
        }
      })
  );

  return mergeWithDefaults(hydratedSettings);
};

export const getDefaultSettings = (): AppSettings => ({
  language: 'de',
  displayName: 'Mein Haushalt',
  defaultServings: 2,
  weekStart: 'Monday',
  aiPreferences: {
    dietaryRestrictions: [],
    preferredCuisines: [],
    customInstruction: '',
    creativityLevel: 0.7,
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
    highContrast: false,
    kitchenMode: false,
    largeText: false,
  },
});

export const loadSettings = (): AppSettings => {
  try {
    const persistedSettings = loadPersistedSettings();
    if (persistedSettings) {
      return persistedSettings;
    }

    const storedSettings = window.localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      return mergeWithDefaults(parseJson(storedSettings));
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage", error);
  }
  return getDefaultSettings();
};