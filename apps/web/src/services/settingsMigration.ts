import { SETTINGS_KEY, PERSISTED_SETTINGS_KEY } from './settingsKeys';
import { mergeWithDefaults } from './settingsMerge';

const MIGRATION_DONE_FLAG = 'culina_migration_v1_done';

/**
 * Migrates legacy `culinaSyncSettings` localStorage key into the Redux Persist
 * format (`persist:settings`).  Must be called synchronously before the Redux
 * store is created so that the persisted state is available on first rehydration.
 *
 * Safe to call multiple times – the session flag and the presence check make it
 * idempotent.
 */
export const migrateLegacySettings = (): void => {
  try {
    if (sessionStorage.getItem(MIGRATION_DONE_FLAG)) return;

    if (window.localStorage.getItem(PERSISTED_SETTINGS_KEY)) {
      sessionStorage.setItem(MIGRATION_DONE_FLAG, '1');
      return;
    }

    const legacyRaw = window.localStorage.getItem(SETTINGS_KEY);
    if (!legacyRaw) {
      sessionStorage.setItem(MIGRATION_DONE_FLAG, '1');
      return;
    }

    const parsed = JSON.parse(legacyRaw);
    const migrated = mergeWithDefaults(parsed);

    const payload: Record<string, string> = {
      _persist: JSON.stringify({ version: 1, rehydrated: true }),
    };
    for (const [key, value] of Object.entries(migrated)) {
      payload[key] = JSON.stringify(value);
    }

    window.localStorage.setItem(PERSISTED_SETTINGS_KEY, JSON.stringify(payload));
    window.localStorage.removeItem(SETTINGS_KEY);

    sessionStorage.setItem(MIGRATION_DONE_FLAG, '1');

    if (import.meta.env.DEV) {
      console.debug('[CulinaSync] Legacy settings migrated to Redux Persist.');
    }
  } catch (error) {
    console.error('[CulinaSync] Settings migration failed:', error);
  }
};
