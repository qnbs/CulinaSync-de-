import type { FullBackupData, PantryItem, Recipe } from '../types';
import { getFullData } from './exportService';
import { mergeBackupWithConflictResolution, type BackupMergeResult } from './backupMergeService';

const DEVICE_SYNC_PREFIX = 'culinasync-device-sync:v1:';
const MAX_QR_PAYLOAD_CHARS = 2800;
const MAX_ITEMS_PER_TABLE = 40;

export type DeviceSyncPayload = {
  v: 1;
  exportedAt: string;
  pantry: PantryItem[];
  recipes: Recipe[];
};

const trimForQr = (data: FullBackupData): DeviceSyncPayload => ({
  v: 1,
  exportedAt: data.exportedAt ?? new Date().toISOString(),
  pantry: (data.pantry ?? []).slice(0, MAX_ITEMS_PER_TABLE),
  recipes: (data.recipes ?? [])
    .slice(0, MAX_ITEMS_PER_TABLE)
    .map((recipe) => ({
      ...recipe,
      imageUrl: undefined,
    })),
});

export const buildDeviceSyncTransferString = async (): Promise<{ token: string; fitsQr: boolean }> => {
  const full = await getFullData();
  const payload = trimForQr(full);
  const token = `${DEVICE_SYNC_PREFIX}${btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}`;
  return { token, fitsQr: token.length <= MAX_QR_PAYLOAD_CHARS };
};

export const parseDeviceSyncTransferString = (raw: string): DeviceSyncPayload => {
  const trimmed = raw.trim();
  if (!trimmed.startsWith(DEVICE_SYNC_PREFIX)) {
    throw new Error('invalid-format');
  }
  const encoded = trimmed.slice(DEVICE_SYNC_PREFIX.length);
  const json = decodeURIComponent(escape(atob(encoded)));
  const parsed = JSON.parse(json) as DeviceSyncPayload;
  if (parsed.v !== 1 || !Array.isArray(parsed.pantry) || !Array.isArray(parsed.recipes)) {
    throw new Error('invalid-payload');
  }
  return parsed;
};

export const applyDeviceSyncPayload = async (payload: DeviceSyncPayload): Promise<BackupMergeResult> => {
  const backup: FullBackupData = {
    pantry: payload.pantry,
    recipes: payload.recipes,
    mealPlan: [],
    shoppingList: [],
    exportedAt: payload.exportedAt,
  };
  return mergeBackupWithConflictResolution(backup);
};

export const renderDeviceSyncQrDataUrl = async (token: string): Promise<string> => {
  const { default: QRCode } = await import('qrcode');
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 280,
  });
};
