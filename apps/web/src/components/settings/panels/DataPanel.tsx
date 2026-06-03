import React, { useState, useEffect, useRef } from 'react';
import { getLastSyncTimestamp, syncUpload, syncDownload } from '../../../services/syncService';
import { probeNextcloudConnection } from '../../../services/nextcloudSyncAdapter';
import {
  resolveGenericSyncTarget,
  resolveNextcloudSyncTarget,
  type SyncProviderId,
} from '../../../services/syncTarget';
import { formatSyncErrorMessage } from '../../../services/syncUiErrors';
import { db } from '../../../services/dbInstance';
import { importData } from '../../../services/repositories/dataRepository';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, Upload, Trash2, AlertTriangle, HardDrive, Lock, QrCode } from 'lucide-react';
import { DeviceSyncModal } from '../DeviceSyncModal';
import Dexie from 'dexie';
import { BeforeInstallPromptEvent, FullBackupData } from '../../../types';
import { updateSettings } from '../../../store/slices/settingsSlice';
import { useAppDispatch } from '../../../store/hooks';
import { useModalA11y } from '../../../hooks/useModalA11y';
import { useTranslation } from 'react-i18next';
import { downloadEncryptedVault, mergeEncryptedVaultFile } from '../../../services/snapshotVaultService';
import { logAppError } from '../../../services/errorLoggingService';
import { PwaStatusCard } from '../../pwa/PwaStatusCard';
import { useTransientUiStore } from '../../../store/transientUiStore';

const SYNC_PROVIDER_STORAGE_KEY = 'culinaSyncSyncProvider';
const NEXTCLOUD_SERVER_STORAGE_KEY = 'culinaSyncNextcloudServer';
const NEXTCLOUD_USER_STORAGE_KEY = 'culinaSyncNextcloudUser';
const NEXTCLOUD_PATH_STORAGE_KEY = 'culinaSyncNextcloudRemotePath';

const ResetConfirmationModal: React.FC<{
    onClose: () => void;
    onConfirm: () => void;
}> = ({ onClose, onConfirm }) => {
    const { t } = useTranslation();
    const [confirmationText, setConfirmationText] = useState('');
    const CONFIRMATION_KEYWORD = t('settings.data.reset.confirmationKeyword');
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useModalA11y({
        isOpen: true,
        onClose,
        containerRef: modalRef,
        initialFocusRef: inputRef,
    });

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 page-fade-in glass-overlay" onClick={onClose}>
            <div ref={modalRef} className="rounded-2xl p-6 w-full max-w-md glass-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="reset-confirmation-title" tabIndex={-1}>
                <div className="flex items-center gap-3 text-red-500 mb-4">
                    <div className="p-2 bg-red-500/10 rounded-full"><AlertTriangle size={24} /></div>
                    <h3 id="reset-confirmation-title" className="text-lg font-bold">{t('settings.data.reset.title')}</h3>
                </div>
                <p className="text-zinc-400 text-sm mb-6">
                    {t('settings.data.reset.description')}
                </p>
                <input
                    ref={inputRef}
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={t('settings.data.reset.placeholder', { keyword: CONFIRMATION_KEYWORD })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:outline-none font-mono text-center uppercase"
                />
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={onClose} className="py-2.5 px-4 rounded-xl text-zinc-400 hover:bg-zinc-800 font-medium">{t('common.cancel')}</button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={confirmationText !== CONFIRMATION_KEYWORD}
                        className="py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        <Trash2 size={16}/> {t('settings.data.reset.action')}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface DataPanelProps {
    addToast: (message: string, type: 'success' | 'error' | 'info') => unknown;
    installPromptEvent: BeforeInstallPromptEvent | null;
    onInstallPWA: () => void;
    isStandalone: boolean;
    isIos?: boolean;
    onCheckForUpdate?: () => void;
}

export const DataPanel: React.FC<DataPanelProps> = ({
    addToast,
    installPromptEvent,
    onInstallPWA,
    isStandalone,
    isIos = false,
    onCheckForUpdate,
}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [isResetModalOpen, setResetModalOpen] = useState(false);
    const [storageEstimate, setStorageEstimate] = useState<{ used: number; quota: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingLaunchFile = useTransientUiStore((s) => s.pendingLaunchFile);
    const setPendingLaunchFile = useTransientUiStore((s) => s.setPendingLaunchFile);

    const pantryCount = useLiveQuery(() => db.pantry.count());
    const recipeCount = useLiveQuery(() => db.recipes.count());

    useEffect(() => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(({ usage, quota }) => {
                setStorageEstimate({ used: usage || 0, quota: quota || 0 });
            });
        }
    }, []);

    const handleResetData = () => {
        setResetModalOpen(false);
        (db as Dexie).delete().then(() => {
            localStorage.clear();
            addToast(t('settings.data.toast.restarting'), 'info');
            setTimeout(() => window.location.reload(), 1500);
        }).catch((err: unknown) => {
            void logAppError(err, 'settings.data.reset');
            addToast(t('settings.data.toast.resetError'), 'error');
        });
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const data = JSON.parse(reader.result as string) as FullBackupData;
                await importData(data);
                if (data.settings) dispatch(updateSettings(data.settings));
                addToast(t('settings.data.toast.importSuccess'), 'success');
                setTimeout(() => window.location.reload(), 1500);
            } catch {
                addToast(t('settings.data.toast.importError'), 'error');
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    const handleExport = async (format: 'json' | 'md' | 'csv' | 'pdf') => {
        let success = false;
        if (format === 'json') {
            const { exportFullDataAsJson } = await import('../../../services/exportService');
            success = await exportFullDataAsJson();
        } else if (format === 'md') {
            const { exportFullDataAsMarkdown } = await import('../../../services/exportService');
            success = await exportFullDataAsMarkdown();
        } else if (format === 'csv') {
            const { exportFullDataAsCsv } = await import('../../../services/exportService');
            success = await exportFullDataAsCsv();
        } else if (format === 'pdf') {
            const { exportFullDataAsPdf } = await import('../../../services/exportService');
            success = await exportFullDataAsPdf();
        }
        if (success) addToast(t('settings.backup.success'), 'success');
        else addToast(t('settings.backup.error'), 'error');
    };

    // Format bytes
    const formatBytes = (bytes: number, decimals = 2) => {
        if (!bytes) return t('settings.data.storage.zeroBytes');
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = [
            t('settings.data.storage.units.bytes'),
            t('settings.data.storage.units.kb'),
            t('settings.data.storage.units.mb'),
            t('settings.data.storage.units.gb'),
        ];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // --- Sync State ---
    const [syncProvider, setSyncProvider] = useState<SyncProviderId>(() => {
        const stored = localStorage.getItem(SYNC_PROVIDER_STORAGE_KEY);
        return stored === 'nextcloud' ? 'nextcloud' : 'generic';
    });
    const [syncUrl, setSyncUrl] = useState('');
    const [syncPassword, setSyncPassword] = useState('');
    const [syncToken, setSyncToken] = useState('');
    const [nextcloudServer, setNextcloudServer] = useState(() => localStorage.getItem(NEXTCLOUD_SERVER_STORAGE_KEY) ?? '');
    const [nextcloudUser, setNextcloudUser] = useState(() => localStorage.getItem(NEXTCLOUD_USER_STORAGE_KEY) ?? '');
    const [nextcloudAppPassword, setNextcloudAppPassword] = useState('');
    const [nextcloudRemotePath, setNextcloudRemotePath] = useState(
        () => localStorage.getItem(NEXTCLOUD_PATH_STORAGE_KEY) ?? 'culinasync-backup.csb',
    );
    const [syncStatus, setSyncStatus] = useState<string | null>(null);
    const [syncLoading, setSyncLoading] = useState(false);
    const [vaultPassphrase, setVaultPassphrase] = useState('');
    const [vaultBusy, setVaultBusy] = useState(false);
    const [deviceSyncOpen, setDeviceSyncOpen] = useState(false);
    const [lastSyncAt, setLastSyncAt] = useState<number | null>(() => getLastSyncTimestamp());
    const vaultFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!pendingLaunchFile) return;
        addToast(t('settings.data.pwa.fileReceived', { name: pendingLaunchFile.name }), 'info');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(pendingLaunchFile);
        if (vaultFileInputRef.current) {
            vaultFileInputRef.current.files = dataTransfer.files;
            vaultFileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
        }
        setPendingLaunchFile(null);
    }, [pendingLaunchFile, addToast, setPendingLaunchFile, t]);

    const syncCredentialsReady =
        syncPassword.trim().length > 0 &&
        (syncProvider === 'generic'
            ? syncUrl.trim().length > 0
            : nextcloudServer.trim().length > 0 &&
              nextcloudUser.trim().length > 0 &&
              nextcloudAppPassword.trim().length > 0);

    const persistNextcloudPrefs = () => {
        localStorage.setItem(SYNC_PROVIDER_STORAGE_KEY, syncProvider);
        localStorage.setItem(NEXTCLOUD_SERVER_STORAGE_KEY, nextcloudServer);
        localStorage.setItem(NEXTCLOUD_USER_STORAGE_KEY, nextcloudUser);
        localStorage.setItem(NEXTCLOUD_PATH_STORAGE_KEY, nextcloudRemotePath);
    };

    const resolveActiveSyncTarget = () => {
        if (syncProvider === 'nextcloud') {
            return resolveNextcloudSyncTarget({
                serverUrl: nextcloudServer,
                username: nextcloudUser,
                appPassword: nextcloudAppPassword,
                remotePath: nextcloudRemotePath,
            });
        }
        return resolveGenericSyncTarget(syncUrl, syncToken || undefined);
    };

    const handleSyncUpload = async () => {
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
    };

    const handleNextcloudProbe = async () => {
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
    };
    const handleVaultExport = async () => {
        if (!vaultPassphrase.trim()) {
            addToast(t('settings.data.vault.toastExportError'), 'error');
            return;
        }
        setVaultBusy(true);
        try {
            await downloadEncryptedVault(vaultPassphrase);
            addToast(t('settings.data.vault.toastExportOk'), 'success');
        } catch {
            addToast(t('settings.data.vault.toastExportError'), 'error');
        } finally {
            setVaultBusy(false);
        }
    };

    const handleVaultImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        void (async () => {
            if (!vaultPassphrase.trim()) {
                addToast(t('settings.data.vault.toastImportError'), 'error');
                return;
            }
            setVaultBusy(true);
            try {
                const result = await mergeEncryptedVaultFile(file, vaultPassphrase);
                addToast(t('settings.data.vault.toastImportOk'), 'success');
                setSyncStatus(
          t('settings.data.vault.mergeReport', {
              pantry: result.skippedOlderPantry,
              recipes: result.skippedOlderRecipes,
              plan: result.mergedMealPlan,
              shopping: result.mergedShopping,
          }),
                );
            } catch {
                addToast(t('settings.data.vault.toastImportError'), 'error');
            } finally {
                setVaultBusy(false);
                if (vaultFileInputRef.current) vaultFileInputRef.current.value = '';
            }
        })();
    };

    const handleSyncDownload = async (mode: 'replace' | 'merge' = 'replace') => {
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
    };

    return (
        <div className="space-y-8 page-fade-in">
            {isResetModalOpen && <ResetConfirmationModal onClose={() => setResetModalOpen(false)} onConfirm={handleResetData} />}
            <DeviceSyncModal
                isOpen={deviceSyncOpen}
                onClose={() => setDeviceSyncOpen(false)}
                addToast={addToast}
                onMerged={(result) => {
                    setSyncStatus(
                        t('settings.data.vault.mergeReport', {
                            pantry: result.skippedOlderPantry,
                            recipes: result.skippedOlderRecipes,
                            plan: result.mergedMealPlan,
                            shopping: result.mergedShopping,
                        }),
                    );
                }}
            />
            <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept="application/json" />
            <input
                type="file"
                ref={vaultFileInputRef}
                onChange={handleVaultImportFile}
                className="hidden"
                accept="application/octet-stream,.csb"
            />

            {/* Storage Visualization */}
            <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
                    <HardDrive className="text-[var(--color-accent-400)]"/> {t('settings.data.storage.title')}
                </h3>
                
                <div className="flex items-center justify-center mb-6 relative">
                    <div className="relative w-48 h-48">
                         <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="45" fill="transparent" stroke="#27272a" strokeWidth="8" />
                             <circle 
                                cx="50" cy="50" r="45" fill="transparent" stroke="var(--color-accent-500)" strokeWidth="8" 
                                strokeDasharray={2 * Math.PI * 45}
                                strokeDashoffset={2 * Math.PI * 45 * (1 - ((storageEstimate?.used || 0) / (storageEstimate?.quota || 1)))}
                                strokeLinecap="round"
                             />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-200">
                             <span className="text-2xl font-bold">{storageEstimate ? formatBytes(storageEstimate.used) : '...'}</span>
                             <span className="text-xs text-zinc-500">{t('settings.data.storage.used')}</span>
                         </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                     <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                         <div className="text-xs text-zinc-500 uppercase font-bold mb-1">{t('nav.recipes')}</div>
                         <div className="text-xl font-mono font-bold text-zinc-100">{recipeCount ?? '-'}</div>
                     </div>
                     <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                         <div className="text-xs text-zinc-500 uppercase font-bold mb-1">{t('nav.pantry')}</div>
                         <div className="text-xl font-mono font-bold text-zinc-100">{pantryCount ?? '-'}</div>
                     </div>
                </div>
            </section>

            <PwaStatusCard
                isStandalone={isStandalone}
                isIos={isIos}
                canInstall={!!installPromptEvent && !isStandalone}
                onInstall={onInstallPWA}
                onCheckUpdate={onCheckForUpdate}
            />

            {/* Actions */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group">
                    <Upload className="text-zinc-500 group-hover:text-zinc-300 transition-colors" size={24}/>
                    <span className="font-bold text-zinc-300">{t('settings.backup.import')}</span>
                </button>
                <div className="flex flex-col gap-2">
                    <button onClick={() => handleExport('json')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group">
                        <Download className="text-zinc-500 group-hover:text-zinc-300 transition-colors" size={20}/>
                        <span className="font-bold text-zinc-300">{t('settings.backup.exportJson')}</span>
                    </button>
                    <button onClick={() => handleExport('md')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group">
                        <Download className="text-zinc-500 group-hover:text-zinc-300 transition-colors" size={20}/>
                        <span className="font-bold text-zinc-300">{t('settings.backup.exportMd')}</span>
                    </button>
                    <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group">
                        <Download className="text-zinc-500 group-hover:text-zinc-300 transition-colors" size={20}/>
                        <span className="font-bold text-zinc-300">{t('settings.backup.exportCsv')}</span>
                    </button>
                    <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group">
                        <Download className="text-zinc-500 group-hover:text-zinc-300 transition-colors" size={20}/>
                        <span className="font-bold text-zinc-300">{t('settings.backup.exportPdf')}</span>
                    </button>
                </div>
            </section>

            <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 mt-8">
                <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
                    <Lock className="text-[var(--color-accent-400)]"/> {t('settings.data.vault.title')}
                </h3>
                <input
                    type="password"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none font-mono"
                    placeholder={t('settings.data.vault.passphrasePlaceholder')}
                    value={vaultPassphrase}
                    onChange={(e) => setVaultPassphrase(e.target.value)}
                    autoComplete="new-password"
                />
                <div className="flex flex-wrap gap-3 mb-2">
                    <button
                        type="button"
                        onClick={() => void handleVaultExport()}
                        disabled={vaultBusy || !vaultPassphrase.trim()}
                        className="px-4 py-2 rounded-xl bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                    >
                        {vaultBusy ? '…' : t('settings.data.vault.export')}
                    </button>
                    <button
                        type="button"
                        onClick={() => vaultFileInputRef.current?.click()}
                        disabled={vaultBusy || !vaultPassphrase.trim()}
                        className="px-4 py-2 rounded-xl border border-zinc-600 text-zinc-200 font-semibold hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {t('settings.data.vault.import')}
                    </button>
                </div>
                <p className="text-xs text-zinc-500">{t('settings.data.vault.helper')}</p>
            </section>
            
            <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 mt-8">
                <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
                    <QrCode className="text-[var(--color-accent-400)]"/> {t('settings.data.deviceSync.sectionTitle')}
                </h3>
                <p className="text-sm text-zinc-400 mb-4">{t('settings.data.deviceSync.sectionHint')}</p>
                <button
                    type="button"
                    onClick={() => setDeviceSyncOpen(true)}
                    className="px-4 py-2 rounded-xl border border-zinc-600 text-zinc-200 font-semibold hover:bg-zinc-800"
                >
                    {t('settings.data.deviceSync.openAction')}
                </button>
            </section>

            {/* Verschlüsselter Cloud-Sync */}
            <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 mt-8">
                <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
                    <HardDrive className="text-[var(--color-accent-400)]"/> {t('settings.data.sync.title')}
                </h3>
                <fieldset className="mb-4">
                    <legend className="mb-2 text-sm font-medium text-zinc-300">{t('settings.data.sync.providerLabel')}</legend>
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="sync-provider"
                                checked={syncProvider === 'generic'}
                                onChange={() => setSyncProvider('generic')}
                            />
                            {t('settings.data.sync.providerGeneric')}
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="sync-provider"
                                checked={syncProvider === 'nextcloud'}
                                onChange={() => setSyncProvider('nextcloud')}
                            />
                            {t('settings.data.sync.providerNextcloud')}
                        </label>
                    </div>
                </fieldset>
                {syncProvider === 'generic' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                            type="url"
                            className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
                            placeholder={t('settings.data.sync.urlPlaceholder')}
                            value={syncUrl}
                            onChange={e => setSyncUrl(e.target.value)}
                            autoComplete="off"
                        />
                        <input
                            type="password"
                            className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
                            placeholder={t('settings.data.sync.passwordPlaceholder')}
                            value={syncPassword}
                            onChange={e => setSyncPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        <input
                            type="text"
                            className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
                            placeholder={t('settings.data.sync.tokenPlaceholder')}
                            value={syncToken}
                            onChange={e => setSyncToken(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                ) : (
                    <div className="mb-4 space-y-3">
                        <input
                            type="url"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
                            placeholder={t('settings.data.sync.nextcloud.serverPlaceholder')}
                            value={nextcloudServer}
                            onChange={(e) => setNextcloudServer(e.target.value)}
                            autoComplete="off"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
                                placeholder={t('settings.data.sync.nextcloud.userPlaceholder')}
                                value={nextcloudUser}
                                onChange={(e) => setNextcloudUser(e.target.value)}
                                autoComplete="username"
                            />
                            <input
                                type="password"
                                className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
                                placeholder={t('settings.data.sync.nextcloud.appPasswordPlaceholder')}
                                value={nextcloudAppPassword}
                                onChange={(e) => setNextcloudAppPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
                            placeholder={t('settings.data.sync.nextcloud.remotePathPlaceholder')}
                            value={nextcloudRemotePath}
                            onChange={(e) => setNextcloudRemotePath(e.target.value)}
                            autoComplete="off"
                        />
                        <p className="text-xs text-zinc-500">{t('settings.data.sync.nextcloud.remotePathHint')}</p>
                        <input
                            type="password"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none font-mono"
                            placeholder={t('settings.data.sync.passwordPlaceholder')}
                            value={syncPassword}
                            onChange={e => setSyncPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => void handleNextcloudProbe()}
                            disabled={syncLoading}
                            className="px-4 py-2 rounded-xl border border-zinc-600 text-zinc-200 font-semibold hover:bg-zinc-800 disabled:opacity-50"
                        >
                            {t('settings.data.sync.nextcloud.testConnection')}
                        </button>
                    </div>
                )}
                <div className="flex flex-wrap gap-3 mb-2">
                    <button
                        type="button"
                        onClick={() => void handleSyncUpload()}
                        disabled={syncLoading || !syncCredentialsReady}
                        className="px-4 py-2 rounded-xl bg-accent-500 text-zinc-900 font-bold hover:bg-accent-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                    >
                        {syncLoading ? t('settings.data.sync.uploading') : t('settings.data.sync.upload')}
                    </button>
                    <button
                        type="button"
                        onClick={() => void handleSyncDownload('replace')}
                        disabled={syncLoading || !syncCredentialsReady}
                        className="px-4 py-2 rounded-xl bg-accent-500 text-zinc-900 font-bold hover:bg-accent-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                    >
                        {syncLoading ? t('settings.data.sync.restoring') : t('settings.data.sync.restore')}
                    </button>
                    <button
                        type="button"
                        onClick={() => void handleSyncDownload('merge')}
                        disabled={syncLoading || !syncCredentialsReady}
                        className="px-4 py-2 rounded-xl border border-zinc-600 text-zinc-200 font-semibold hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {t('settings.data.sync.mergeRestore')}
                    </button>
                </div>
                {lastSyncAt && (
                    <p className="text-xs text-zinc-500 mb-2" role="status">
                        {t('settings.data.sync.lastSync', { date: new Date(lastSyncAt).toLocaleString() })}
                    </p>
                )}
                {syncStatus && <div className="text-sm mt-2 text-zinc-400">{syncStatus}</div>}
                <div className="text-xs text-zinc-500 mt-2">{t('settings.data.sync.helper')}</div>
            </section>

            <div className="flex justify-center pt-4">
                <button onClick={() => setResetModalOpen(true)} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
                    <AlertTriangle size={14}/>
                    {t('settings.data.reset.trigger')}
                </button>
            </div>
        </div>
    );
};