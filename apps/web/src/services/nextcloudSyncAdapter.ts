import { SYNC_ERROR_CODES } from './syncErrorCodes';
import type { SyncAuth } from './syncTransport';

export type NextcloudSyncConfig = {
  serverUrl: string;
  username: string;
  appPassword: string;
  remotePath?: string;
};

const DEFAULT_REMOTE_FILE = 'culinasync-backup.csb';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

// QNBS-v3: Nextcloud Files WebDAV — remote.php/dav/files/{user}/{path}
export const buildNextcloudBackupUrl = (config: NextcloudSyncConfig): string => {
  const base = trimTrailingSlash(config.serverUrl.trim());
  const user = encodeURIComponent(config.username.trim());
  const fileName = (config.remotePath?.trim() || DEFAULT_REMOTE_FILE).replace(/^\/+/, '');
  return `${base}/remote.php/dav/files/${user}/${fileName}`;
};

export const buildNextcloudAuth = (config: NextcloudSyncConfig): SyncAuth => ({
  type: 'basic',
  username: config.username.trim(),
  password: config.appPassword,
});

export const validateNextcloudConfig = (config: NextcloudSyncConfig): void => {
  if (!config.serverUrl.trim()) {
    throw new Error(SYNC_ERROR_CODES.nextcloudMissingServer);
  }
  if (!config.username.trim()) {
    throw new Error(SYNC_ERROR_CODES.nextcloudMissingUser);
  }
  if (!config.appPassword.trim()) {
    throw new Error(SYNC_ERROR_CODES.nextcloudMissingPassword);
  }
  try {
    const parsed = new URL(config.serverUrl.trim());
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error(SYNC_ERROR_CODES.nextcloudInvalidProtocol);
    }
  } catch {
    throw new Error(SYNC_ERROR_CODES.nextcloudInvalidUrl);
  }
};

export const probeNextcloudConnection = async (config: NextcloudSyncConfig): Promise<boolean> => {
  validateNextcloudConfig(config);
  const url = buildNextcloudBackupUrl(config);
  const encoded = btoa(`${config.username.trim()}:${config.appPassword}`);
  const res = await fetch(url, {
    method: 'PROPFIND',
    headers: {
      Authorization: `Basic ${encoded}`,
      Depth: '0',
    },
  });
  if (res.ok || res.status === 404) {
    return true;
  }
  throw new Error(SYNC_ERROR_CODES.nextcloudProbeFailed);
};
