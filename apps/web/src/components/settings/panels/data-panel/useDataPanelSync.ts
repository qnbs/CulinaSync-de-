import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLastSyncTimestamp, syncDownload, syncUpload } from '../../../../services/syncService';
import { probeNextcloudConnection } from '../../../../services/nextcloudSyncAdapter';
import {
  resolveGenericSyncTarget,
  resolveNextcloudSyncTarget,
  type SyncProviderId,
} from '../../../../services/syncTarget';
import { formatSyncErrorMessage } from '../../../../services/syncUiErrors';
import {
  NEXTCLOUD_PATH_STORAGE_KEY,
  NEXTCLOUD_SERVER_STORAGE_KEY,
  NEXTCLOUD_USER_STORAGE_KEY,
  SYNC_PROVIDER_STORAGE_KEY,
} from './dataPanelConstants';

type ToastFn = (message: string, type: 'success' | 'error' | 'info') => void;

export const useDataPanelSync = (addToast: ToastFn) => {
  const { t } = useTranslation();

  const [syncProvider, setSyncProvider] = useState<SyncProviderId>(() => {
    const stored = localStorage.getItem(SYNC_PROVIDER_STORAGE_KEY);
    return stored === 'nextcloud' ? 'nextcloud' : 'generic';
  });
  const [syncUrl, setSyncUrl] = useState('');
  const [syncPassword, setSyncPassword] = useState('');
  const [syncToken, setSyncToken] = useState('');
  const [nextcloudServer, setNextcloudServer] = useState(
    () => localStorage.getItem(NEXTCLOUD_SERVER_STORAGE_KEY) ?? '',
  );
  const [nextcloudUser, setNextcloudUser] = useState(
    () => localStorage.getItem(NEXTCLOUD_USER_STORAGE_KEY) ?? '',
  );
  const [nextcloudAppPassword, setNextcloudAppPassword] = useState('');
  const [nextcloudRemotePath, setNextcloudRemotePath] = useState(
    () => localStorage.getItem(NEXTCLOUD_PATH_STORAGE_KEY) ?? 'culinasync-backup.csb',
  );
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(() => getLastSyncTimestamp());

  const syncCredentialsReady =
    syncPassword.trim().length > 0 &&
    (syncProvider === 'generic'
      ? syncUrl.trim().length > 0
      : nextcloudServer.trim().length > 0 &&
        nextcloudUser.trim().length > 0 &&
        nextcloudAppPassword.trim().length > 0);

  const persistNextcloudPrefs = useCallback(() => {
    localStorage.setItem(SYNC_PROVIDER_STORAGE_KEY, syncProvider);
    localStorage.setItem(NEXTCLOUD_SERVER_STORAGE_KEY, nextcloudServer);
    localStorage.setItem(NEXTCLOUD_USER_STORAGE_KEY, nextcloudUser);
    localStorage.setItem(NEXTCLOUD_PATH_STORAGE_KEY, nextcloudRemotePath);
  }, [nextcloudRemotePath, nextcloudServer, nextcloudUser, syncProvider]);

  const resolveActiveSyncTarget = useCallback(() => {
    if (syncProvider === 'nextcloud') {
      return resolveNextcloudSyncTarget({
        serverUrl: nextcloudServer,
        username: nextcloudUser,
        appPassword: nextcloudAppPassword,
        remotePath: nextcloudRemotePath,
      });
    }
    return resolveGenericSyncTarget(syncUrl, syncToken || undefined);
  }, [
    nextcloudAppPassword,
    nextcloudRemotePath,
    nextcloudServer,
    nextcloudUser,
    syncProvider,
    syncToken,
    syncUrl,
  ]);

  const handleSyncUpload = useCallback(async () => {
    setSyncStatus(null);
    setSyncLoading(true);
    try {
      persistNextcloudPrefs();
      await syncUpload(syncPassword, resolveActiveSyncTarget());
      setLastSyncAt(getLastSyncTimestamp());
      setSyncStatus(t('settings.data.sync.uploadSuccess'));
    } catch (error) {
      setSyncStatus(`${t('settings.data.sync.uploadError')} ${formatSyncErrorMessage(error, t)}`);
    } finally {
      setSyncLoading(false);
    }
  }, [persistNextcloudPrefs, resolveActiveSyncTarget, syncPassword, t]);

  const handleNextcloudProbe = useCallback(async () => {
    setSyncStatus(null);
    setSyncLoading(true);
    try {
      persistNextcloudPrefs();
      const ok = await probeNextcloudConnection({
        serverUrl: nextcloudServer,
        username: nextcloudUser,
        appPassword: nextcloudAppPassword,
        remotePath: nextcloudRemotePath,
      });
      setSyncStatus(ok ? t('settings.data.sync.nextcloud.testOk') : t('settings.data.sync.nextcloud.testFailed'));
    } catch (error) {
      setSyncStatus(formatSyncErrorMessage(error, t));
    } finally {
      setSyncLoading(false);
    }
  }, [
    nextcloudAppPassword,
    nextcloudRemotePath,
    nextcloudServer,
    nextcloudUser,
    persistNextcloudPrefs,
    t,
  ]);

  const handleSyncDownload = useCallback(
    async (mode: 'replace' | 'merge' = 'replace') => {
      setSyncStatus(null);
      setSyncLoading(true);
      try {
        persistNextcloudPrefs();
        await syncDownload(syncPassword, resolveActiveSyncTarget(), mode);
        setLastSyncAt(getLastSyncTimestamp());
        if (mode === 'replace') {
          setSyncStatus(t('settings.data.sync.restoreSuccess'));
          addToast(t('settings.backup.restoreSuccess'), 'success');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setSyncStatus(t('settings.data.sync.mergeSuccess'));
          addToast(t('settings.data.sync.mergeSuccess'), 'success');
        }
      } catch (error) {
        setSyncStatus(`${t('settings.data.sync.restoreError')} ${formatSyncErrorMessage(error, t)}`);
      } finally {
        setSyncLoading(false);
      }
    },
    [addToast, persistNextcloudPrefs, resolveActiveSyncTarget, syncPassword, t],
  );

  return {
    syncProvider,
    setSyncProvider,
    syncUrl,
    setSyncUrl,
    syncPassword,
    setSyncPassword,
    syncToken,
    setSyncToken,
    nextcloudServer,
    setNextcloudServer,
    nextcloudUser,
    setNextcloudUser,
    nextcloudAppPassword,
    setNextcloudAppPassword,
    nextcloudRemotePath,
    setNextcloudRemotePath,
    syncStatus,
    setSyncStatus,
    syncLoading,
    lastSyncAt,
    syncCredentialsReady,
    handleSyncUpload,
    handleNextcloudProbe,
    handleSyncDownload,
  };
};

export type DataPanelSyncState = ReturnType<typeof useDataPanelSync>;
