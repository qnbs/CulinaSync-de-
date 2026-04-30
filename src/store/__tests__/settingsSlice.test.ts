import { describe, expect, it, vi } from 'vitest';

vi.mock('../../services/settingsService', () => ({
  loadSettings: () => ({
    language: 'de',
    displayName: '',
    defaultServings: 4,
    weekStart: 'Monday',
    aiPreferences: { dietaryRestrictions: [], preferredCuisines: [], customInstruction: '', creativityLevel: 0.7 },
    pantry: { defaultSort: 'name', isGrouped: false, expiryWarningDays: 3 },
    recipeBook: { defaultSort: 'newest' },
    shoppingList: { groupCheckedAtBottom: false, defaultSort: 'category', autoCategorize: true },
    speechSynthesis: { voice: null, rate: 1, pitch: 1 },
    appearance: { accentColor: 'emerald', highContrast: false, kitchenMode: false, largeText: false },
  }),
  saveSettings: vi.fn(),
}));

import reducer, { setPantryGrouping, setPantrySort, updateSettings } from '../slices/settingsSlice';
import type { AppSettings } from '../../types';

const BASE_SETTINGS: AppSettings = {
  language: 'de',
  displayName: '',
  defaultServings: 4,
  weekStart: 'Monday',
  aiPreferences: { dietaryRestrictions: [], preferredCuisines: [], customInstruction: '', creativityLevel: 0.7 },
  pantry: { defaultSort: 'name', isGrouped: false, expiryWarningDays: 3 },
  recipeBook: { defaultSort: 'newest' },
  shoppingList: { groupCheckedAtBottom: false, defaultSort: 'category', autoCategorize: true },
  speechSynthesis: { voice: null, rate: 1, pitch: 1 },
  appearance: { accentColor: 'emerald', highContrast: false, kitchenMode: false, largeText: false },
};

describe('settingsSlice', () => {
  it('returns default state on init', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.language).toBe('de');
    expect(state.pantry.defaultSort).toBe('name');
  });

  describe('updateSettings', () => {
    it('replaces the entire settings state', () => {
      const updated: AppSettings = { ...BASE_SETTINGS, language: 'en', defaultServings: 2 };
      const result = reducer(BASE_SETTINGS, updateSettings(updated));
      expect(result.language).toBe('en');
      expect(result.defaultServings).toBe(2);
    });
  });

  describe('setPantrySort', () => {
    it('updates only the pantry sort order', () => {
      const result = reducer(BASE_SETTINGS, setPantrySort('expiryDate'));
      expect(result.pantry.defaultSort).toBe('expiryDate');
      expect(result.language).toBe('de');
    });

    it('accepts all valid sort values', () => {
      for (const sort of ['name', 'expiryDate', 'updatedAt', 'createdAt'] as const) {
        const result = reducer(BASE_SETTINGS, setPantrySort(sort));
        expect(result.pantry.defaultSort).toBe(sort);
      }
    });
  });

  describe('setPantryGrouping', () => {
    it('toggles pantry grouping', () => {
      const enabled = reducer(BASE_SETTINGS, setPantryGrouping(true));
      expect(enabled.pantry.isGrouped).toBe(true);
      const disabled = reducer(enabled, setPantryGrouping(false));
      expect(disabled.pantry.isGrouped).toBe(false);
    });

    it('does not affect other settings fields', () => {
      const result = reducer(BASE_SETTINGS, setPantryGrouping(true));
      expect(result.pantry.defaultSort).toBe('name');
      expect(result.language).toBe('de');
    });
  });
});
