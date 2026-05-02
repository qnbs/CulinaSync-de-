import type { AppSettings } from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

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
