import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadEncryptedVault, mergeEncryptedVaultFile } from '../../../../services/snapshotVaultService';
import { useTransientUiStore } from '../../../../store/transientUiStore';

type ToastFn = (message: string, type: 'success' | 'error' | 'info') => void;

export const useDataPanelVault = (
  addToast: ToastFn,
  onMergeReport: (report: {
    skippedOlderPantry: number;
    skippedOlderRecipes: number;
    mergedMealPlan: number;
    mergedShopping: number;
  }) => void,
) => {
  const { t } = useTranslation();
  const [vaultPassphrase, setVaultPassphrase] = useState('');
  const [vaultBusy, setVaultBusy] = useState(false);
  const vaultFileInputRef = useRef<HTMLInputElement>(null);
  const pendingLaunchFile = useTransientUiStore((s) => s.pendingLaunchFile);
  const setPendingLaunchFile = useTransientUiStore((s) => s.setPendingLaunchFile);

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
  }, [addToast, pendingLaunchFile, setPendingLaunchFile, t]);

  const handleVaultExport = useCallback(async () => {
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
  }, [addToast, t, vaultPassphrase]);

  const handleVaultImportFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
          onMergeReport(result);
        } catch {
          addToast(t('settings.data.vault.toastImportError'), 'error');
        } finally {
          setVaultBusy(false);
          if (vaultFileInputRef.current) vaultFileInputRef.current.value = '';
        }
      })();
    },
    [addToast, onMergeReport, t, vaultPassphrase],
  );

  return {
    vaultPassphrase,
    setVaultPassphrase,
    vaultBusy,
    vaultFileInputRef,
    handleVaultExport,
    handleVaultImportFile,
  };
};
