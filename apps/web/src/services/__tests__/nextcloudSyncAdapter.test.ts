import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  buildNextcloudAuth,
  buildNextcloudBackupUrl,
  validateNextcloudConfig,
} from '../nextcloudSyncAdapter';

describe('nextcloudSyncAdapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('baut WebDAV-URL und Basic-Auth', () => {
    const config = {
      serverUrl: 'https://cloud.example.com/',
      username: 'chef',
      appPassword: 'secret-token',
      remotePath: 'backups/sync.csb',
    };
    expect(buildNextcloudBackupUrl(config)).toBe(
      'https://cloud.example.com/remote.php/dav/files/chef/backups/sync.csb',
    );
    expect(buildNextcloudAuth(config)).toEqual({
      type: 'basic',
      username: 'chef',
      password: 'secret-token',
    });
  });

  it('validiert Pflichtfelder', () => {
    expect(() =>
      validateNextcloudConfig({ serverUrl: '', username: 'a', appPassword: 'b' }),
    ).toThrow('nextcloud-missing-server');
  });

  it('probeNextcloudConnection akzeptiert 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    const { probeNextcloudConnection } = await import('../nextcloudSyncAdapter');
    await expect(
      probeNextcloudConnection({
        serverUrl: 'https://cloud.example.com',
        username: 'u',
        appPassword: 'p',
      }),
    ).resolves.toBe(true);
  });
});
