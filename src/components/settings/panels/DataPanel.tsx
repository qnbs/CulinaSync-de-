import React, { useState, useEffect, useRef } from 'react';
import { syncUpload, syncDownload } from '../../../services/syncService';
import { db } from '../../../services/dbInstance';
import { importData } from '../../../services/repositories/dataRepository';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, Upload, Trash2, AlertTriangle, HardDrive } from 'lucide-react';
import Dexie from 'dexie';
import { BeforeInstallPromptEvent, FullBackupData } from '../../../types';
import { updateSettings } from '../../../store/slices/settingsSlice';
import { useAppDispatch } from '../../../store/hooks';
import { useModalA11y } from '../../../hooks/useModalA11y';
import { useTranslation } from 'react-i18next';

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
}

export const DataPanel: React.FC<DataPanelProps> = ({ addToast, installPromptEvent, onInstallPWA, isStandalone }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [isResetModalOpen, setResetModalOpen] = useState(false);
    const [storageEstimate, setStorageEstimate] = useState<{ used: number; quota: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            addToast(t('settings.data.toast.resetError'), 'error');
            if (import.meta.env.DEV) {
                console.error(err);
            }
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
    const [syncUrl, setSyncUrl] = useState('');
    const [syncPassword, setSyncPassword] = useState('');
    const [syncToken, setSyncToken] = useState('');
    const [syncStatus, setSyncStatus] = useState<string | null>(null);
    const [syncLoading, setSyncLoading] = useState(false);

    const handleSyncUpload = async () => {
        setSyncStatus(null);
        setSyncLoading(true);
        try {
            await syncUpload(syncPassword, syncUrl, syncToken || undefined);
            setSyncStatus(t('settings.data.sync.uploadSuccess'));
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setSyncStatus(`${t('settings.data.sync.uploadError')} ${message}`);
        } finally {
            setSyncLoading(false);
        }
    };
    const handleSyncDownload = async () => {
        setSyncStatus(null);
        setSyncLoading(true);
        try {
            await syncDownload(syncPassword, syncUrl, syncToken || undefined);
            setSyncStatus(t('settings.data.sync.restoreSuccess'));
            addToast(t('settings.backup.restoreSuccess'), 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setSyncStatus(`${t('settings.data.sync.restoreError')} ${message}`);
        } finally {
            setSyncLoading(false);
        }
    };

    return (
        <div className="space-y-8 page-fade-in">
            {isResetModalOpen && <ResetConfirmationModal onClose={() => setResetModalOpen(false)} onConfirm={handleResetData} />}
            <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept="application/json" />

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

            {/* Install PWA */}
            {installPromptEvent && !isStandalone && (
                 <section className="bg-gradient-to-r from-[var(--color-accent-500)]/10 to-transparent border border-[var(--color-accent-500)]/20 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-[var(--color-accent-400)]">{t('settings.data.install.title')}</h4>
                        <p className="text-sm text-zinc-400">{t('settings.data.install.description')}</p>
                    </div>
                    <button onClick={onInstallPWA} className="bg-[var(--color-accent-500)] text-zinc-900 font-bold py-2 px-4 rounded-xl hover:bg-[var(--color-accent-400)] transition-colors shadow-lg">
                        {t('app.installReminder.install')}
                    </button>
                 </section>
            )}

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
            
            {/* Verschlüsselter Cloud-Sync */}
            <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 mt-8">
                <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
                    <HardDrive className="text-[var(--color-accent-400)]"/> {t('settings.data.sync.title')}
                </h3>
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
                <div className="flex gap-4 mb-2">
                    <button
                        onClick={handleSyncUpload}
                        disabled={syncLoading || !syncUrl || !syncPassword}
                        className="px-4 py-2 rounded-xl bg-accent-500 text-zinc-900 font-bold hover:bg-accent-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                    >
                        {syncLoading ? t('settings.data.sync.uploading') : t('settings.data.sync.upload')}
                    </button>
                    <button
                        onClick={handleSyncDownload}
                        disabled={syncLoading || !syncUrl || !syncPassword}
                        className="px-4 py-2 rounded-xl bg-accent-500 text-zinc-900 font-bold hover:bg-accent-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                    >
                        {syncLoading ? t('settings.data.sync.restoring') : t('settings.data.sync.restore')}
                    </button>
                </div>
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