import React, { useEffect, useMemo, useState } from 'react';
import { Cpu, Layers, Sparkles, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { detectGpuTier, type GpuTier } from '@domain/ai-core';
import type { AppSettings } from '../../types';
import { Button, Modal } from '../ui';

export type LocalAiSetupCompletion = {
  enableEmbeddings?: boolean;
  enableWebLlmInference?: boolean;
};

interface LocalAiSetupModalProps {
  open: boolean;
  settings: AppSettings;
  onComplete: (completion: LocalAiSetupCompletion) => Promise<void>;
  onClose: () => void;
}

const gpuTierKey = (tier: GpuTier): string => {
  if (tier === 'cpu-only') {
    return 'efficient';
  }
  return tier;
};

export const LocalAiSetupModal: React.FC<LocalAiSetupModalProps> = ({
  open,
  settings,
  onComplete,
  onClose,
}) => {
  const { t } = useTranslation();
  const [gpuTier, setGpuTier] = useState<GpuTier>('balanced');
  const [webGpuAvailable, setWebGpuAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    void detectGpuTier().then((detection) => {
      setWebGpuAvailable(detection.webGpuAvailable);
      setGpuTier(detection.tier);
    });
  }, [open]);

  const routingLabel = useMemo(
    () =>
      t(
        `settings.localAi.routing.${
          settings.aiPreferences.routingMode === 'local-only'
            ? 'localOnly'
            : settings.aiPreferences.routingMode === 'cloud-first'
              ? 'cloudFirst'
              : 'localFirst'
        }`,
      ),
    [settings.aiPreferences.routingMode, t],
  );

  const gpuLabel = t(`settings.localAi.gpuTier.${gpuTierKey(gpuTier)}`);

  const finish = async (completion: LocalAiSetupCompletion = {}) => {
    setBusy(true);
    try {
      await onComplete(completion);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => void finish()}
      title={t('localAiSetup.title')}
      description={t('localAiSetup.description')}
      size="lg"
      priority
      footer={
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button type="button" variant="ghost" disabled={busy} onClick={() => void finish()}>
            {t('localAiSetup.skip')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => void finish({ enableEmbeddings: true })}
          >
            {t('localAiSetup.enableEmbeddings')}
          </Button>
          {webGpuAvailable && (
            <Button
              type="button"
              disabled={busy}
              onClick={() => void finish({ enableEmbeddings: true, enableWebLlmInference: true })}
            >
              {t('localAiSetup.enableFull')}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[10px] uppercase tracking-wider font-bold text-zinc-500">
          {(['webllm', 'onnx', 'transformers', 'heuristic'] as const).map((layer) => (
            <div key={layer} className="rounded-lg border border-zinc-700/80 bg-zinc-900/60 py-2 px-1">
              {t(`settings.localAi.layers.${layer}`)}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Layers className="text-[var(--color-accent-400)] shrink-0 mt-0.5" size={20} aria-hidden />
            <div>
              <p className="text-sm font-semibold text-zinc-200">{t('localAiSetup.routingTitle')}</p>
              <p className="text-sm text-zinc-400">{routingLabel}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Cpu className="text-emerald-400 shrink-0 mt-0.5" size={20} aria-hidden />
            <div>
              <p className="text-sm font-semibold text-zinc-200">{t('localAiSetup.gpuTitle')}</p>
              <p className="text-sm text-zinc-400">
                {webGpuAvailable ? t('localAiSetup.gpuWebGpu', { tier: gpuLabel }) : t('localAiSetup.gpuWasm')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <WifiOff className="text-sky-400 shrink-0 mt-0.5" size={20} aria-hidden />
            <div>
              <p className="text-sm font-semibold text-zinc-200">{t('localAiSetup.offlineTitle')}</p>
              <p className="text-sm text-zinc-400">{t('localAiSetup.offlineDesc')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-[var(--color-accent-500)]/30 bg-[var(--color-accent-500)]/5 p-4">
          <Sparkles className="text-[var(--color-accent-400)] shrink-0 mt-0.5" size={20} aria-hidden />
          <p className="text-sm text-zinc-300">{t('localAiSetup.hint')}</p>
        </div>
      </div>
    </Modal>
  );
};
