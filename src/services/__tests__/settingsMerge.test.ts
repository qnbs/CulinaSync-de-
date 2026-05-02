import { describe, expect, it } from 'vitest';

import { getDefaultSettings, mergeWithDefaults } from '../settingsMerge';

describe('settingsMerge', () => {
  it('mergeWithDefaults fills nested objects from partial source', () => {
    const merged = mergeWithDefaults({
      language: 'en',
      shoppingList: { autoCategorize: false },
    });
    const defaults = getDefaultSettings();

    expect(merged.language).toBe('en');
    expect(merged.shoppingList.autoCategorize).toBe(false);
    expect(merged.shoppingList.defaultSort).toBe(defaults.shoppingList.defaultSort);
    expect(merged.appearance.accentColor).toBe(defaults.appearance.accentColor);
  });

  it('mergeWithDefaults treats non-object as empty source', () => {
    const merged = mergeWithDefaults(null);
    expect(merged).toEqual(getDefaultSettings());
  });
});
