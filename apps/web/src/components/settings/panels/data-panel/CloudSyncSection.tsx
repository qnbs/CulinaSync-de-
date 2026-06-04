import React from 'react';
import { HardDrive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DataPanelSyncState } from './useDataPanelSync';

type CloudSyncSectionProps = DataPanelSyncState;

export const CloudSyncSection: React.FC<CloudSyncSectionProps> = (sync) => {
  const { t } = useTranslation();

  return (
    <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 mt-8">
      <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
        <HardDrive className="text-[var(--color-accent-400)]" /> {t('settings.data.sync.title')}
      </h3>
      <fieldset className="mb-4">
        <legend className="mb-2 text-sm font-medium text-zinc-300">{t('settings.data.sync.providerLabel')}</legend>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="sync-provider"
              checked={sync.syncProvider === 'generic'}
              onChange={() => sync.setSyncProvider('generic')}
            />
            {t('settings.data.sync.providerGeneric')}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="sync-provider"
              checked={sync.syncProvider === 'nextcloud'}
              onChange={() => sync.setSyncProvider('nextcloud')}
            />
            {t('settings.data.sync.providerNextcloud')}
          </label>
        </div>
      </fieldset>
      {sync.syncProvider === 'generic' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="url"
            className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
            placeholder={t('settings.data.sync.urlPlaceholder')}
            value={sync.syncUrl}
            onChange={(e) => sync.setSyncUrl(e.target.value)}
            autoComplete="off"
          />
          <input
            type="password"
            className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
            placeholder={t('settings.data.sync.passwordPlaceholder')}
            value={sync.syncPassword}
            onChange={(e) => sync.setSyncPassword(e.target.value)}
            autoComplete="new-password"
          />
          <input
            type="text"
            className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
            placeholder={t('settings.data.sync.tokenPlaceholder')}
            value={sync.syncToken}
            onChange={(e) => sync.setSyncToken(e.target.value)}
            autoComplete="off"
          />
        </div>
      ) : (
        <div className="mb-4 space-y-3">
          <input
            type="url"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
            placeholder={t('settings.data.sync.nextcloud.serverPlaceholder')}
            value={sync.nextcloudServer}
            onChange={(e) => sync.setNextcloudServer(e.target.value)}
            autoComplete="off"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
              placeholder={t('settings.data.sync.nextcloud.userPlaceholder')}
              value={sync.nextcloudUser}
              onChange={(e) => sync.setNextcloudUser(e.target.value)}
              autoComplete="username"
            />
            <input
              type="password"
              className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
              placeholder={t('settings.data.sync.nextcloud.appPasswordPlaceholder')}
              value={sync.nextcloudAppPassword}
              onChange={(e) => sync.setNextcloudAppPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <input
            type="text"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
            placeholder={t('settings.data.sync.nextcloud.remotePathPlaceholder')}
            value={sync.nextcloudRemotePath}
            onChange={(e) => sync.setNextcloudRemotePath(e.target.value)}
            autoComplete="off"
          />
          <p className="text-xs text-zinc-500">{t('settings.data.sync.nextcloud.remotePathHint')}</p>
          <p className="text-xs text-zinc-500">{t('settings.data.sync.nextcloud.credentialsHint')}</p>
          <input
            type="password"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
            placeholder={t('settings.data.sync.passwordPlaceholder')}
            value={sync.syncPassword}
            onChange={(e) => sync.setSyncPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => void sync.handleNextcloudProbe()}
            disabled={sync.syncLoading}
            className="px-4 py-2 rounded-xl border border-zinc-600 text-zinc-200 font-semibold hover:bg-zinc-800 disabled:opacity-50"
          >
            {t('settings.data.sync.nextcloud.testConnection')}
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-3 mb-2">
        <button
          type="button"
          onClick={() => void sync.handleSyncUpload()}
          disabled={sync.syncLoading || !sync.syncCredentialsReady}
          className="px-4 py-2 rounded-xl bg-accent-500 text-zinc-900 font-bold hover:bg-accent-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
        >
          {sync.syncLoading ? t('settings.data.sync.uploading') : t('settings.data.sync.upload')}
        </button>
        <button
          type="button"
          onClick={() => void sync.handleSyncDownload('replace')}
          disabled={sync.syncLoading || !sync.syncCredentialsReady}
          className="px-4 py-2 rounded-xl bg-accent-500 text-zinc-900 font-bold hover:bg-accent-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
        >
          {sync.syncLoading ? t('settings.data.sync.restoring') : t('settings.data.sync.restore')}
        </button>
        <button
          type="button"
          onClick={() => void sync.handleSyncDownload('merge')}
          disabled={sync.syncLoading || !sync.syncCredentialsReady}
          className="px-4 py-2 rounded-xl border border-zinc-600 text-zinc-200 font-semibold hover:bg-zinc-800 disabled:opacity-50"
        >
          {t('settings.data.sync.mergeRestore')}
        </button>
      </div>
      {sync.lastSyncAt && (
        <p className="text-xs text-zinc-500 mb-2" role="status">
          {t('settings.data.sync.lastSync', { date: new Date(sync.lastSyncAt).toLocaleString() })}
        </p>
      )}
      {sync.syncStatus && <div className="text-sm mt-2 text-zinc-400">{sync.syncStatus}</div>}
      <div className="text-xs text-zinc-500 mt-2">{t('settings.data.sync.helper')}</div>
    </section>
  );
};
