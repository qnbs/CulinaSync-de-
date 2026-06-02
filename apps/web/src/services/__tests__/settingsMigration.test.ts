import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PERSISTED_SETTINGS_KEY, SETTINGS_KEY } from '../settingsKeys';
import { migrateLegacySettings } from '../settingsMigration';

describe('settingsMigration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('ueberspringt Migration wenn Persist-Schluessel existiert', () => {
    window.localStorage.setItem(PERSISTED_SETTINGS_KEY, '{"_persist":"{}"}');
    window.localStorage.setItem(SETTINGS_KEY, '{"language":"de"}');

    migrateLegacySettings();

    expect(window.localStorage.getItem(SETTINGS_KEY)).not.toBeNull();
    expect(window.sessionStorage.getItem('culina_migration_v1_done')).toBe('1');
  });

  it('migriert Legacy-Settings in Redux-Persist-Format', () => {
    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ language: 'en', shoppingList: { autoCategorize: true } }),
    );

    migrateLegacySettings();

    const persistedRaw = window.localStorage.getItem(PERSISTED_SETTINGS_KEY);
    expect(persistedRaw).toBeTruthy();
    expect(window.localStorage.getItem(SETTINGS_KEY)).toBeNull();

    const payload = JSON.parse(persistedRaw!) as Record<string, string>;
    expect(payload.language).toBe(JSON.stringify('en'));
    expect(window.sessionStorage.getItem('culina_migration_v1_done')).toBe('1');
  });

  it('ist idempotent in derselben Session', () => {
    migrateLegacySettings();
    window.localStorage.setItem(SETTINGS_KEY, '{"language":"de"}');
    migrateLegacySettings();
    expect(window.localStorage.getItem(SETTINGS_KEY)).not.toBeNull();
  });
});
