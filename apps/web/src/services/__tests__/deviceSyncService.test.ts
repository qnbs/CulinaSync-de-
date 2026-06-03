import { describe, expect, it } from 'vitest';
import { parseDeviceSyncTransferString } from '../deviceSyncService';

describe('deviceSyncService', () => {
  it('parst gueltige Transfer-Strings', () => {
    const payload = {
      v: 1 as const,
      exportedAt: '2026-06-02T12:00:00.000Z',
      pantry: [{ id: 1, name: 'Milch', quantity: 1, unit: 'l', createdAt: 1, updatedAt: 2 }],
      recipes: [],
    };
    const token = `culinasync-device-sync:v1:${btoa(JSON.stringify(payload))}`;
    const parsed = parseDeviceSyncTransferString(token);
    expect(parsed.pantry).toHaveLength(1);
    expect(parsed.recipes).toHaveLength(0);
  });

  it('lehnt ungueltige Prefixe ab', () => {
    expect(() => parseDeviceSyncTransferString('invalid')).toThrow();
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
    const token = `culinasync-device-sync:v1:${btoa(JSON.stringify(payload))}`;
    expect(() => parseDeviceSyncTransferString(token)).toThrow('invalid-payload');
  });
});
