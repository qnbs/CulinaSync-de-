import { AppSettings } from '../types';
import { migrateLegacySettings } from './settingsMigration';
import { PERSISTED_SETTINGS_KEY } from './settingsKeys';
import { getDefaultSettings, mergeWithDefaults } from './settingsMerge';

export { SETTINGS_KEY, PERSISTED_SETTINGS_KEY } from './settingsKeys';
export { getDefaultSettings, mergeWithDefaults } from './settingsMerge';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const parseJson = (value: string): unknown => JSON.parse(value);

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
      }),
  );
  return mergeWithDefaults(hydrated);
};

// Used by i18n.ts to detect the persisted language before the Redux store
// is ready, and by tests to verify persistence priority.
// Legacy `culinaSyncSettings` is migrated into Redux Persist by
// migrateLegacySettings (store bootstrap + this call for non-store callers).
// Priority: Redux Persist key → application defaults.
export const loadSettings = (): AppSettings => {
  try {
    migrateLegacySettings();
    return loadPersistedSettings() ?? getDefaultSettings();
  } catch (error) {
    console.error('[CulinaSync] Failed to load settings from localStorage', error);
    return getDefaultSettings();
  }
};
