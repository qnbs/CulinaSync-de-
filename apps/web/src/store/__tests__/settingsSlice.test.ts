import { describe, expect, it, vi } from 'vitest';

vi.mock('../../services/settingsService', async () => {
  const { getDefaultSettings } = await import('../../services/settingsMerge');
  const defaults = getDefaultSettings();
  const mockSettings = {
    ...defaults,
    displayName: '',
    defaultServings: 4,
    appearance: { ...defaults.appearance, accentColor: 'emerald' as const },
    pantry: { ...defaults.pantry, isGrouped: false },
    shoppingList: { ...defaults.shoppingList, groupCheckedAtBottom: false },
  };
  return {
    loadSettings: () => ({ ...mockSettings }),
    getDefaultSettings: () => ({ ...mockSettings }),
    saveSettings: vi.fn(),
    SETTINGS_KEY: 'culinaSyncSettings',
    PERSISTED_SETTINGS_KEY: 'persist:settings',
    mergeWithDefaults: (await import('../../services/settingsMerge')).mergeWithDefaults,
  };
});

import { getDefaultSettings } from '../../services/settingsMerge';
import reducer, { setPantryGrouping, setPantrySort, updateSettings } from '../slices/settingsSlice';
import type { AppSettings } from '../../types';

const BASE_SETTINGS: AppSettings = {
  ...getDefaultSettings(),
  displayName: '',
  defaultServings: 4,
  appearance: { ...getDefaultSettings().appearance, accentColor: 'emerald' },
  pantry: { ...getDefaultSettings().pantry, isGrouped: false },
  shoppingList: { ...getDefaultSettings().shoppingList, groupCheckedAtBottom: false },
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
