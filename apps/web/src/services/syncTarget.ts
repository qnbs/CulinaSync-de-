import type { NextcloudSyncConfig } from './nextcloudSyncAdapter';
import { buildNextcloudAuth, buildNextcloudBackupUrl, validateNextcloudConfig } from './nextcloudSyncAdapter';
import type { SyncAuth } from './syncTransport';

export type SyncProviderId = 'generic' | 'nextcloud';

export type ResolvedSyncTarget = {
  url: string;
  auth?: SyncAuth;
};

export const resolveGenericSyncTarget = (url: string, token?: string): ResolvedSyncTarget => ({
  url: url.trim(),
  auth: token?.trim() ? { type: 'bearer', token: token.trim() } : undefined,
});

export const resolveNextcloudSyncTarget = (config: NextcloudSyncConfig): ResolvedSyncTarget => {
  validateNextcloudConfig(config);
  return {
    url: buildNextcloudBackupUrl(config),
    auth: buildNextcloudAuth(config),
  };
};
