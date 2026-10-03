import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readSyncPref, writeSyncPref } from '../syncPrefStorage';

describe('syncPrefStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('migrates legacy localStorage to sessionStorage', () => {
    localStorage.setItem('culinaSyncNextcloudServer', 'https://cloud.test');
    expect(readSyncPref('culinaSyncNextcloudServer')).toBe('https://cloud.test');
    expect(sessionStorage.getItem('culinaSyncNextcloudServer')).toBe('https://cloud.test');
    expect(localStorage.getItem('culinaSyncNextcloudServer')).toBeNull();
  });

  it('writeSyncPref stores in session only', () => {
    writeSyncPref('culinaSyncNextcloudUser', 'chef');
    expect(sessionStorage.getItem('culinaSyncNextcloudUser')).toBe('chef');
    expect(localStorage.getItem('culinaSyncNextcloudUser')).toBeNull();
  });

  it('readSyncPref nutzt session und Fallback', () => {
    sessionStorage.setItem('k', 'from-session');
    expect(readSyncPref('k')).toBe('from-session');
    expect(readSyncPref('missing', 'fb')).toBe('fb');
  });

  it('ignoriert Storage-Fehler', () => {
    const getItem = vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readSyncPref('x', 'safe')).toBe('safe');
    getItem.mockRestore();
    const setItem = vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => writeSyncPref('y', 'z')).not.toThrow();
    setItem.mockRestore();
  });
});
