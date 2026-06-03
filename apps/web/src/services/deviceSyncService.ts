import { z } from 'zod';
import type { FullBackupData, PantryItem, Recipe } from '../types';
import { getFullData } from './exportService';
import { mergeBackupWithConflictResolution, type BackupMergeResult } from './backupMergeService';

const DEVICE_SYNC_PREFIX = 'culinasync-device-sync:v1:';
const MAX_QR_PAYLOAD_CHARS = 2800;
const MAX_ITEMS_PER_TABLE = 40;

const MAX_SYNC_NAME_LEN = 500;

// QNBS-v3: QR/LAN-Transfer — Zod-Gate wie geminiService, begrenzt Payload-Größe und Form
const pantryItemSyncSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(MAX_SYNC_NAME_LEN),
  quantity: z.number(),
  unit: z.string().max(64),
  expiryDate: z.string().optional(),
  category: z.string().max(128).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  minQuantity: z.number().optional(),
  notes: z.string().max(2000).optional(),
});

const recipeSyncSchema = z
  .object({
    id: z.number().optional(),
    recipeTitle: z.string().min(1).max(MAX_SYNC_NAME_LEN),
    ingredients: z.array(z.unknown()).default([]),
  })
  .passthrough();

const deviceSyncPayloadSchema = z.object({
  v: z.literal(1),
  exportedAt: z.string().min(1).max(64),
  pantry: z.array(pantryItemSyncSchema).max(MAX_ITEMS_PER_TABLE),
  recipes: z.array(recipeSyncSchema).max(MAX_ITEMS_PER_TABLE),
});

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
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(json);
  } catch {
    throw new Error('invalid-json');
  }
  const result = deviceSyncPayloadSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new Error('invalid-payload');
  }
  return {
    v: result.data.v,
    exportedAt: result.data.exportedAt,
    pantry: result.data.pantry as PantryItem[],
    recipes: result.data.recipes as unknown as Recipe[],
  };
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
