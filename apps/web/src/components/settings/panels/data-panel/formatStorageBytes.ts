import type { TFunction } from 'i18next';

export const formatStorageBytes = (bytes: number, t: TFunction, decimals = 2): string => {
  if (!bytes) return t('settings.data.storage.zeroBytes');
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    t('settings.data.storage.units.bytes'),
    t('settings.data.storage.units.kb'),
    t('settings.data.storage.units.mb'),
    t('settings.data.storage.units.gb'),
  ];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};
