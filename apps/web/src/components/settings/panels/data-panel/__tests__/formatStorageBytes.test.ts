import type { TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';
import { formatStorageBytes } from '../formatStorageBytes';

describe('formatStorageBytes', () => {
  const t = vi.fn((key: string) => {
    const map: Record<string, string> = {
      'settings.data.storage.zeroBytes': '0 B',
      'settings.data.storage.units.bytes': 'B',
      'settings.data.storage.units.kb': 'KB',
      'settings.data.storage.units.mb': 'MB',
      'settings.data.storage.units.gb': 'GB',
    };
    return map[key] ?? key;
  }) as unknown as TFunction;

  it('returns zero label for empty usage', () => {
    expect(formatStorageBytes(0, t)).toBe('0 B');
  });

  it('formats kilobytes', () => {
    expect(formatStorageBytes(2048, t)).toContain('KB');
  });
});
