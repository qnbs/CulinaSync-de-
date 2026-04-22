import { beforeEach, describe, expect, it } from 'vitest';

import { PERSISTED_SETTINGS_KEY, SETTINGS_KEY, getDefaultSettings, loadSettings } from '../settingsService';

describe('settingsService persistence loading', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('prefers redux-persist settings over the legacy settings key', () => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ language: 'de', displayName: 'Legacy Haushalt' }));
    window.localStorage.setItem(PERSISTED_SETTINGS_KEY, JSON.stringify({
      language: JSON.stringify('en'),
      displayName: JSON.stringify('Persistierter Haushalt'),
      aiPreferences: JSON.stringify({ customInstruction: 'Kein Zucker', creativityLevel: 0.4 }),
      appearance: JSON.stringify({ highContrast: true }),
      _persist: JSON.stringify({ version: -1, rehydrated: true }),
    }));

    const settings = loadSettings();

    expect(settings.language).toBe('en');
    expect(settings.displayName).toBe('Persistierter Haushalt');
    expect(settings.aiPreferences.customInstruction).toBe('Kein Zucker');
    expect(settings.aiPreferences.creativityLevel).toBe(0.4);
    expect(settings.appearance.highContrast).toBe(true);
  });

  it('falls back to legacy settings and merges defaults for missing nested fields', () => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      language: 'en',
      shoppingList: { autoCategorize: false },
    }));

    const settings = loadSettings();
    const defaults = getDefaultSettings();

    expect(settings.language).toBe('en');
    expect(settings.shoppingList.autoCategorize).toBe(false);
    expect(settings.shoppingList.defaultSort).toBe(defaults.shoppingList.defaultSort);
    expect(settings.appearance.accentColor).toBe(defaults.appearance.accentColor);
  });
});