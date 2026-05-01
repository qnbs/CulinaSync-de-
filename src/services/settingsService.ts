import { AppSettings } from '../types';

export const SETTINGS_KEY = 'culinaSyncSettings';
export const PERSISTED_SETTINGS_KEY = 'persist:settings';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const parseJson = (value: string): unknown => JSON.parse(value);

export const mergeWithDefaults = (parsed: unknown): AppSettings => {
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

// Reads the Redux Persist format (per-key JSON strings) and reconstructs
// the full settings object.  Returns null if no persisted state exists.
const loadPersistedSettings = (): AppSettings | null => {
  const raw = window.localStorage.getItem(PERSISTED_SETTINGS_KEY);
  if (!raw) return null;

  const outer = parseJson(raw);
  if (!isRecord(outer)) return null;

  const hydrated = Object.fromEntries(
    Object.entries(outer)
      .filter(([key]) => key !== '_persist')
      .map(([key, value]) => {
        if (typeof value !== 'string') return [key, value];
        try { return [key, parseJson(value)]; }
        catch { return [key, value]; }
      })
  );
  return mergeWithDefaults(hydrated);
};

// Reads the legacy pre-Redux-Persist key used before v0.1.
const loadLegacySettings = (): AppSettings | null => {
  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) return null;
  try { return mergeWithDefaults(parseJson(raw)); }
  catch { return null; }
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

// Used by i18n.ts to detect the persisted language before the Redux store
// is ready, and by tests to verify persistence priority.
// Priority: Redux Persist key → legacy key → application defaults.
export const loadSettings = (): AppSettings => {
  try {
    return loadPersistedSettings() ?? loadLegacySettings() ?? getDefaultSettings();
  } catch (error) {
    console.error('[CulinaSync] Failed to load settings from localStorage', error);
    return getDefaultSettings();
  }
};