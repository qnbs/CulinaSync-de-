import { describe, expect, it } from 'vitest';
import { parseFullBackupData } from '../backupSchemas';

describe('backupSchemas', () => {
  it('akzeptiert ein gültiges Backup-Objekt', () => {
    const data = parseFullBackupData({
      pantry: [{ name: 'Milch' }],
      recipes: [],
      exportedAt: '2026-07-15T00:00:00.000Z',
    });
    expect(data.pantry).toHaveLength(1);
    expect(data.exportedAt).toContain('2026-07-15');
  });

  it('lehnt Nicht-Objekte ab', () => {
    expect(() => parseFullBackupData(null)).toThrow('invalid-backup-payload');
    expect(() => parseFullBackupData('nope')).toThrow('invalid-backup-payload');
    expect(() => parseFullBackupData(42)).toThrow('invalid-backup-payload');
  });

  it('lehnt falsche Feldtypen ab', () => {
    expect(() => parseFullBackupData({ pantry: 'not-an-array' })).toThrow('invalid-backup-payload');
  });
});
