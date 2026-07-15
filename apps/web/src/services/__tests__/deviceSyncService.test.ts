import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseDeviceSyncTransferString } from '../deviceSyncService';

const getFullData = vi.fn();
const mergeBackupWithConflictResolution = vi.fn();

vi.mock('../exportService', () => ({
  getFullData: (...args: unknown[]) => getFullData(...args),
}));

vi.mock('../backupMergeService', () => ({
  mergeBackupWithConflictResolution: (...args: unknown[]) => mergeBackupWithConflictResolution(...args),
}));

describe('deviceSyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parst gueltige Transfer-Strings', () => {
    const payload = {
      v: 1 as const,
      exportedAt: '2026-06-02T12:00:00.000Z',
      pantry: [{ id: 1, name: 'Milch', quantity: 1, unit: 'l', createdAt: 1, updatedAt: 2 }],
      recipes: [],
    };
    const token = `culinasync-device-sync:v1:${btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}`;
    const parsed = parseDeviceSyncTransferString(token);
    expect(parsed.pantry).toHaveLength(1);
    expect(parsed.recipes).toHaveLength(0);
  });

  it('lehnt ungueltige Prefixe ab', () => {
    expect(() => parseDeviceSyncTransferString('invalid')).toThrow('invalid-format');
  });

  it('lehnt Payloads mit zu vielen Eintraegen ab', () => {
    const pantry = Array.from({ length: 41 }, (_, i) => ({
      name: `Item ${i}`,
      quantity: 1,
      unit: 'g',
      createdAt: 1,
      updatedAt: 2,
    }));
    const payload = { v: 1 as const, exportedAt: '2026-06-03T00:00:00.000Z', pantry, recipes: [] };
    const token = `culinasync-device-sync:v1:${btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}`;
    expect(() => parseDeviceSyncTransferString(token)).toThrow('invalid-payload');
  });

  it('lehnt ungueltiges Base64/JSON ab', () => {
    expect(() => parseDeviceSyncTransferString('culinasync-device-sync:v1:%%%')).toThrow();
    expect(() =>
      parseDeviceSyncTransferString(`culinasync-device-sync:v1:${btoa('not-json')}`),
    ).toThrow('invalid-json');
  });

  it('buildDeviceSyncTransferString liefert Token und fitsQr', async () => {
    getFullData.mockResolvedValue({
      pantry: [{ id: 1, name: 'Eier', quantity: 6, unit: 'Stk', category: 'X', createdAt: 1, updatedAt: 2 }],
      recipes: [],
      mealPlan: [],
      shoppingList: [],
      exportedAt: '2026-07-15T12:00:00.000Z',
    });
    const { buildDeviceSyncTransferString } = await import('../deviceSyncService');
    const { token, fitsQr } = await buildDeviceSyncTransferString();
    expect(fitsQr).toBe(true);
    expect(parseDeviceSyncTransferString(token).pantry?.[0]?.name).toBe('Eier');
  });

  it('applyDeviceSyncPayload merged via Backup-Service', async () => {
    mergeBackupWithConflictResolution.mockResolvedValue({
      mergedMealPlan: 0,
      mergedShopping: 0,
      skippedOlderPantry: 0,
      skippedOlderRecipes: 0,
    });
    const { applyDeviceSyncPayload } = await import('../deviceSyncService');
    await applyDeviceSyncPayload({
      v: 1,
      exportedAt: '2026-07-15T12:00:00.000Z',
      pantry: [{ id: 1, name: 'Milch', quantity: 1, unit: 'l', createdAt: 1, updatedAt: 2 }],
      recipes: [],
    });
    expect(mergeBackupWithConflictResolution).toHaveBeenCalled();
  });
});
