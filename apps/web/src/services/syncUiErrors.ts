import type { TFunction } from 'i18next';
import { isSyncErrorCode } from './syncErrorCodes';

// QNBS-v3: Technische Sync-Codes → i18n — keine rohen Error-Strings in der Settings-UI
export const formatSyncErrorMessage = (error: unknown, t: TFunction): string => {
  if (!(error instanceof Error)) {
    return String(error);
  }
  const message = error.message;
  if (!isSyncErrorCode(message)) {
    return message;
  }
  const [code, status] = message.split(':');
  const key = `settings.data.sync.errors.${code.replace(/-/g, '_')}`;
  const translated = t(key, { status: status ?? '', defaultValue: '' });
  if (translated) {
    return translated;
  }
  return t('settings.data.sync.errors.unknown');
};
