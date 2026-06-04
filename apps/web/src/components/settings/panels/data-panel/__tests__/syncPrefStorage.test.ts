import { beforeEach, describe, expect, it } from 'vitest';
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
});
