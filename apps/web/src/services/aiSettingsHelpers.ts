import type { AppSettings } from '../types';
import { loadSettings } from './settingsService';

export const shouldPreferLocalAi = (settings: AppSettings): boolean => {
  if (!settings.localAi.enabled) return false;
  if (settings.localAi.localOnlyMode) return true;
  return settings.aiPreferences.routingMode !== 'cloud-first';
};

export const shouldAllowCloudAi = (settings: AppSettings): boolean => {
  if (settings.localAi.localOnlyMode) return false;
  if (!settings.localAi.allowCloudFallback && settings.aiPreferences.routingMode !== 'cloud-first') {
    return false;
  }
  return settings.aiPreferences.routingMode === 'cloud-first' || settings.localAi.allowCloudFallback;
};

export const getActiveSettingsForAi = (): AppSettings => loadSettings();
