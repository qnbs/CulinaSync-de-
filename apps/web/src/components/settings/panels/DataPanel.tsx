import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Dexie from 'dexie';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BeforeInstallPromptEvent, FullBackupData } from '../../../types';
import { db } from '../../../services/dbInstance';
import { importData } from '../../../services/repositories/dataRepository';
import { logAppError } from '../../../services/errorLoggingService';
import { updateSettings } from '../../../store/slices/settingsSlice';
import { useAppDispatch } from '../../../store/hooks';
import { PwaStatusCard } from '../../pwa/PwaStatusCard';
import { DeviceSyncModal } from '../DeviceSyncModal';
import { CloudSyncSection } from './data-panel/CloudSyncSection';
import { DataBackupSection } from './data-panel/DataBackupSection';
import { DataStorageSection } from './data-panel/DataStorageSection';
import { DeviceSyncSection } from './data-panel/DeviceSyncSection';
import { ResetConfirmationModal } from './data-panel/ResetConfirmationModal';
import { useDataPanelSync } from './data-panel/useDataPanelSync';
import { useDataPanelVault } from './data-panel/useDataPanelVault';
import { VaultSection } from './data-panel/VaultSection';

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
  const [deviceSyncOpen, setDeviceSyncOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pantryCount = useLiveQuery(() => db.pantry.count());
  const recipeCount = useLiveQuery(() => db.recipes.count());

  const formatMergeReport = useCallback(
    (result: {
      skippedOlderPantry: number;
      skippedOlderRecipes: number;
      mergedMealPlan: number;
      mergedShopping: number;
    }) =>
      t('settings.data.vault.mergeReport', {
        pantry: result.skippedOlderPantry,
        recipes: result.skippedOlderRecipes,
        plan: result.mergedMealPlan,
        shopping: result.mergedShopping,
      }),
    [t],
  );

  const sync = useDataPanelSync(addToast);
  const { setSyncStatus } = sync;

  const onVaultMergeReport = useCallback(
    (result: Parameters<typeof formatMergeReport>[0]) => {
      setSyncStatus(formatMergeReport(result));
    },
    [formatMergeReport, setSyncStatus],
  );

  const {
    vaultPassphrase,
    setVaultPassphrase,
    vaultBusy,
    vaultFileInputRef,
    handleVaultExport,
    handleVaultImportFile,
  } = useDataPanelVault(addToast, onVaultMergeReport);

  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      void navigator.storage.estimate().then(({ usage, quota }) => {
        setStorageEstimate({ used: usage || 0, quota: quota || 0 });
      });
    }
  }, []);

  const handleResetData = () => {
    setResetModalOpen(false);
    (db as Dexie)
      .delete()
      .then(() => {
        localStorage.clear();
        addToast(t('settings.data.toast.restarting'), 'info');
        setTimeout(() => window.location.reload(), 1500);
      })
      .catch((err: unknown) => {
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
        if (fileInputRef.current) fileInputRef.current.value = '';
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

  return (
    <div className="space-y-8 page-fade-in">
      {isResetModalOpen && (
        <ResetConfirmationModal onClose={() => setResetModalOpen(false)} onConfirm={handleResetData} />
      )}
      <DeviceSyncModal
        isOpen={deviceSyncOpen}
        onClose={() => setDeviceSyncOpen(false)}
        addToast={addToast}
        onMerged={(result) => {
          sync.setSyncStatus(formatMergeReport(result));
        }}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportData}
        className="hidden"
        accept="application/json"
      />
      <input
        type="file"
        ref={vaultFileInputRef}
        onChange={handleVaultImportFile}
        className="hidden"
        accept="application/octet-stream,.csb"
      />

      <DataStorageSection
        storageEstimate={storageEstimate}
        recipeCount={recipeCount}
        pantryCount={pantryCount}
      />

      <PwaStatusCard
        isStandalone={isStandalone}
        isIos={isIos}
        canInstall={!!installPromptEvent && !isStandalone}
        onInstall={onInstallPWA}
        onCheckUpdate={onCheckForUpdate}
      />

      <DataBackupSection
        onImportClick={() => fileInputRef.current?.click()}
        onExport={(format) => void handleExport(format)}
      />

      <VaultSection
        vaultPassphrase={vaultPassphrase}
        onPassphraseChange={setVaultPassphrase}
        vaultBusy={vaultBusy}
        onExport={() => void handleVaultExport()}
        onImportClick={() => vaultFileInputRef.current?.click()}
      />

      <DeviceSyncSection onOpen={() => setDeviceSyncOpen(true)} />

      <CloudSyncSection {...sync} />

      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={() => setResetModalOpen(true)}
          className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <AlertTriangle size={14} />
          {t('settings.data.reset.trigger')}
        </button>
      </div>
    </div>
  );
};
