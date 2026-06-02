import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QrCode, X } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';
import {
  applyDeviceSyncPayload,
  buildDeviceSyncTransferString,
  parseDeviceSyncTransferString,
  renderDeviceSyncQrDataUrl,
} from '../../services/deviceSyncService';
import type { BackupMergeResult } from '../../services/backupMergeService';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMerged: (result: BackupMergeResult) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({ isOpen, onClose, onMerged, addToast }) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLTextAreaElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [transferToken, setTransferToken] = useState('');
  const [busy, setBusy] = useState(false);

  useModalA11y({ isOpen, onClose, containerRef: modalRef });

  const handleGenerateQr = useCallback(async () => {
    setBusy(true);
    setQrDataUrl(null);
    try {
      const { token, fitsQr } = await buildDeviceSyncTransferString();
      setTransferToken(token);
      if (!fitsQr) {
        addToast(t('settings.data.deviceSync.qrTooLarge'), 'info');
        return;
      }
      const dataUrl = await renderDeviceSyncQrDataUrl(token);
      setQrDataUrl(dataUrl);
    } catch {
      addToast(t('settings.data.deviceSync.generateError'), 'error');
    } finally {
      setBusy(false);
    }
  }, [addToast, t]);

  const handleImport = useCallback(async () => {
    const raw = importInputRef.current?.value?.trim() ?? transferToken.trim();
    if (!raw) {
      addToast(t('settings.data.deviceSync.importEmpty'), 'error');
      return;
    }
    setBusy(true);
    try {
      const payload = parseDeviceSyncTransferString(raw);
      const result = await applyDeviceSyncPayload(payload);
      onMerged(result);
      addToast(t('settings.data.deviceSync.importSuccess'), 'success');
      onClose();
    } catch {
      addToast(t('settings.data.deviceSync.importError'), 'error');
    } finally {
      setBusy(false);
    }
  }, [addToast, onClose, onMerged, t, transferToken]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center glass-overlay page-fade-in" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-sync-title"
        tabIndex={-1}
        className="w-full max-w-lg rounded-2xl glass-modal p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="device-sync-title" className="flex items-center gap-2 text-lg font-bold text-zinc-100">
            <QrCode className="h-5 w-5 text-[var(--color-accent-400)]" aria-hidden="true" />
            {t('settings.data.deviceSync.title')}
          </h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-200" aria-label={t('app.close')}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-zinc-400">{t('settings.data.deviceSync.description')}</p>

        <div className="flex flex-col items-center gap-3">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={t('settings.data.deviceSync.qrAlt')} className="rounded-lg border border-zinc-700 bg-white p-2" />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-dashed border-zinc-700 text-xs text-zinc-500">
              {t('settings.data.deviceSync.qrPlaceholder')}
            </div>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleGenerateQr()}
            className="rounded-xl bg-[var(--color-accent-500)] px-4 py-2 text-sm font-bold text-zinc-900 disabled:opacity-50"
          >
            {t('settings.data.deviceSync.generateQr')}
          </button>
        </div>

        <label className="mt-6 block text-sm font-medium text-zinc-300" htmlFor="device-sync-import">
          {t('settings.data.deviceSync.importLabel')}
        </label>
        <textarea
          id="device-sync-import"
          ref={importInputRef}
          rows={3}
          className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-xs text-zinc-200"
          placeholder={t('settings.data.deviceSync.importPlaceholder')}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleImport()}
          className="mt-4 w-full rounded-xl border border-zinc-600 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          {t('settings.data.deviceSync.importAction')}
        </button>
      </div>
    </div>
  );
};
