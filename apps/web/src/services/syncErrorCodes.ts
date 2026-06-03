/** Internal sync error codes — map to i18n in UI via `settings.data.sync.errors.*` */
export const SYNC_ERROR_CODES = {
  uploadFailed: 'upload-failed',
  downloadFailed: 'download-failed',
  nextcloudMissingServer: 'nextcloud-missing-server',
  nextcloudMissingUser: 'nextcloud-missing-user',
  nextcloudMissingPassword: 'nextcloud-missing-password',
  nextcloudInvalidUrl: 'nextcloud-invalid-url',
  nextcloudInvalidProtocol: 'nextcloud-invalid-protocol',
  nextcloudProbeFailed: 'nextcloud-probe-failed',
} as const;

export type SyncErrorCode = (typeof SYNC_ERROR_CODES)[keyof typeof SYNC_ERROR_CODES];

export const isSyncErrorCode = (message: string): boolean =>
  Object.values(SYNC_ERROR_CODES).some((code) => message === code || message.startsWith(`${code}:`));
