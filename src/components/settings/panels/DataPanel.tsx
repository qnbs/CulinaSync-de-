import React, { useState, useEffect, useRef } from 'react';
import { db, importData } from '../../../services/db';
import { exportFullDataAsJson } from '../../../services/exportService';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, Upload, Trash2, AlertTriangle, Database, PieChart, HardDrive } from 'lucide-react';
import Dexie from 'dexie';
import { FullBackupData, AppSettings } from '../../../types';
import { updateSettings } from '../../../store/slices/settingsSlice';
import { useAppDispatch } from '../../../store/hooks';

const ResetConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const CONFIRMATION_KEYWORD = 'LÖSCHEN';

    useEffect(() => { if (isOpen) setConfirmationText(''); }, [isOpen]);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 page-fade-in" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 text-red-500 mb-4">
                    <div className="p-2 bg-red-500/10 rounded-full"><AlertTriangle size={24} /></div>
                    <h3 className="text-lg font-bold">Daten unwiderruflich löschen?</h3>
                </div>
                <p className="text-zinc-400 text-sm mb-6">
                    Alle Rezepte, Vorräte und Einstellungen werden entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={`Tippe "${CONFIRMATION_KEYWORD}"`}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:outline-none font-mono text-center uppercase"
                />
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="py-2.5 px-4 rounded-xl text-zinc-400 hover:bg-zinc-800 font-medium">Abbrechen</button>
                    <button
                        onClick={onConfirm}
                        disabled={confirmationText !== CONFIRMATION_KEYWORD}
                        className="py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        <Trash2 size={16}/> Endgültig löschen
                    </button>
                </div>
            </div>
        </div>
    );
};

export const DataPanel = ({ addToast, installPromptEvent, onInstallPWA, isStandalone }: { addToast: any, installPromptEvent: any, onInstallPWA: any, isStandalone: boolean }) => {
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
            addToast('App wird neu gestartet...', 'info');
            setTimeout(() => window.location.reload(), 1500);
        }).catch((err: any) => {
            addToast('Fehler beim Zurücksetzen.', 'error');
            console.error(err);
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
                addToast('Daten erfolgreich importiert. Neustart...', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                addToast('Import fehlgeschlagen. Ungültige Datei.', 'error');
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    const handleExport = async () => {
        const success = await exportFullDataAsJson();
        if (success) addToast('Backup erstellt.', 'success');
    };

    // Format bytes
    const formatBytes = (bytes: number, decimals = 2) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-8 page-fade-in">
            <ResetConfirmationModal isOpen={isResetModalOpen} onClose={() => setResetModalOpen(false)} onConfirm={handleResetData} />
            <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept="application/json" />

            {/* Storage Visualization */}
            <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
                    <HardDrive className="text-[var(--color-accent-400)]"/> Speicherstatus
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
                             <span className="text-xs text-zinc-500">verwendet</span>
                         </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                     <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                         <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Rezepte</div>
                         <div className="text-xl font-mono font-bold text-zinc-100">{recipeCount ?? '-'}</div>
                     </div>
                     <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                         <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Vorrat</div>
                         <div className="text-xl font-mono font-bold text-zinc-100">{pantryCount ?? '-'}</div>
                     </div>
                </div>
            </section>

            {/* Install PWA */}
            {installPromptEvent && !isStandalone && (
                 <section className="bg-gradient-to-r from-[var(--color-accent-500)]/10 to-transparent border border-[var(--color-accent-500)]/20 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-[var(--color-accent-400)]">App installieren</h4>
                        <p className="text-sm text-zinc-400">Für das beste Offline-Erlebnis.</p>
                    </div>
                    <button onClick={onInstallPWA} className="bg-[var(--color-accent-500)] text-zinc-900 font-bold py-2 px-4 rounded-xl hover:bg-[var(--color-accent-400)] transition-colors shadow-lg">
                        Installieren
                    </button>
                 </section>
            )}

            {/* Actions */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group">
                    <Upload className="text-zinc-500 group-hover:text-zinc-300 transition-colors" size={24}/>
                    <span className="font-bold text-zinc-300">Importieren</span>
                </button>
                 <button onClick={handleExport} className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group">
                    <Download className="text-zinc-500 group-hover:text-zinc-300 transition-colors" size={24}/>
                    <span className="font-bold text-zinc-300">Backup (JSON)</span>
                </button>
            </section>
            
            <div className="flex justify-center pt-4">
                <button onClick={() => setResetModalOpen(true)} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
                    <AlertTriangle size={14}/>
                    Werkseinstellungen & Daten löschen
                </button>
            </div>
        </div>
    );
};