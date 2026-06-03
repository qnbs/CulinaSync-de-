import React, { useMemo } from 'react';
import { Cpu, Database, HardDrive, Layers, Shield, Sparkles, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AppSettings } from '../../../types';
import { SettingsToggle } from '../SettingsToggle';

interface LocalAiPanelProps {
  settings: AppSettings;
  onChange: (path: string, value: unknown) => void;
}

export const LocalAiPanel: React.FC<LocalAiPanelProps> = ({ settings, onChange }) => {
  const { t } = useTranslation();
  const { localAi, aiPreferences } = settings;

  const gpuLabel = useMemo(
    () => t(`settings.localAi.gpuTier.${localAi.gpuTierPreference}`),
    [localAi.gpuTierPreference, t],
  );

  const modelLabel = useMemo(
    () => t(`settings.localAi.models.${localAi.preferredGenerativeModel}`),
    [localAi.preferredGenerativeModel, t],
  );

  return (
    <div className="space-y-8 page-fade-in">
      <section className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={96} />
        </div>
        <h3 className="text-lg font-bold text-zinc-100 mb-2 flex items-center gap-2">
          <Layers className="text-[var(--color-accent-400)]" size={22} />
          {t('settings.localAi.stackTitle')}
        </h3>
        <p className="text-sm text-zinc-400 mb-6">{t('settings.localAi.stackDescription')}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[10px] uppercase tracking-wider font-bold text-zinc-500">
          {(['webllm', 'onnx', 'transformers', 'heuristic'] as const).map((layer) => (
            <div key={layer} className="rounded-lg border border-zinc-700/80 bg-zinc-900/60 py-2 px-1">
              {t(`settings.localAi.layers.${layer}`)}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{t('settings.localAi.coreTitle')}</h3>
        <SettingsToggle
          label={t('settings.localAi.enabledLabel')}
          description={t('settings.localAi.enabledDesc')}
          checked={localAi.enabled}
          onToggle={() => onChange('localAi.enabled', !localAi.enabled)}
        />
        <SettingsToggle
          label={t('settings.localAi.localOnlyLabel')}
          description={t('settings.localAi.localOnlyDesc')}
          checked={localAi.localOnlyMode}
          onToggle={() => onChange('localAi.localOnlyMode', !localAi.localOnlyMode)}
        />
        <SettingsToggle
          label={t('settings.localAi.cloudFallbackLabel')}
          description={t('settings.localAi.cloudFallbackDesc')}
          checked={localAi.allowCloudFallback}
          disabled={localAi.localOnlyMode}
          onToggle={() => onChange('localAi.allowCloudFallback', !localAi.allowCloudFallback)}
        />
        <div className="p-4 glass-card rounded-xl">
          <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.localAi.routingLabel')}</label>
          <select
            value={aiPreferences.routingMode}
            onChange={(e) => onChange('aiPreferences.routingMode', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[var(--color-accent-500)]"
          >
            <option value="local-first">{t('settings.localAi.routing.localFirst')}</option>
            <option value="local-only">{t('settings.localAi.routing.localOnly')}</option>
            <option value="cloud-first">{t('settings.localAi.routing.cloudFirst')}</option>
          </select>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <Cpu size={16} /> {t('settings.localAi.hardwareTitle')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 glass-card rounded-xl">
            <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.localAi.gpuTierLabel')}</label>
            <select
              value={localAi.gpuTierPreference}
              onChange={(e) => onChange('localAi.gpuTierPreference', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none"
            >
              {(['auto', 'high', 'balanced', 'efficient'] as const).map((tier) => (
                <option key={tier} value={tier}>
                  {t(`settings.localAi.gpuTier.${tier}`)}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 mt-2">{t('settings.localAi.gpuTierActive', { tier: gpuLabel })}</p>
          </div>
          <div className="p-4 glass-card rounded-xl">
            <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.localAi.modelLabel')}</label>
            <select
              value={localAi.preferredGenerativeModel}
              onChange={(e) => onChange('localAi.preferredGenerativeModel', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none"
            >
              {(
                [
                  'auto',
                  'webllm-qwen-2.5-1.5b',
                  'webllm-phi-3.5',
                  'webllm-llama-3.2-1b',
                  'heuristic-only',
                ] as const
              ).map((model) => (
                <option key={model} value={model}>
                  {t(`settings.localAi.models.${model}`)}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 mt-2">{t('settings.localAi.modelActive', { model: modelLabel })}</p>
          </div>
        </div>
        <SettingsToggle
          label={t('settings.localAi.preferWebGpuLabel')}
          description={t('settings.localAi.preferWebGpuDesc')}
          checked={localAi.preferWebGpu}
          onToggle={() => onChange('localAi.preferWebGpu', !localAi.preferWebGpu)}
        />
        <SettingsToggle
          label={t('settings.localAi.webLlmInferenceLabel')}
          description={t('settings.localAi.webLlmInferenceDesc')}
          checked={localAi.enableWebLlmInference}
          disabled={!localAi.enabled || localAi.preferredGenerativeModel === 'heuristic-only'}
          onToggle={() => onChange('localAi.enableWebLlmInference', !localAi.enableWebLlmInference)}
        />
        <div className="p-4 glass-card rounded-xl">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-zinc-200">{t('settings.localAi.maxJobsLabel')}</span>
            <span className="font-mono text-[var(--color-accent-400)]">{localAi.maxConcurrentJobs}</span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            value={localAi.maxConcurrentJobs}
            onChange={(e) => onChange('localAi.maxConcurrentJobs', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-500)]"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <Database size={16} /> {t('settings.localAi.capabilitiesTitle')}
        </h3>
        <SettingsToggle
          label={t('settings.localAi.visionLabel')}
          description={t('settings.localAi.visionDesc')}
          checked={localAi.enableVision}
          onToggle={() => onChange('localAi.enableVision', !localAi.enableVision)}
        />
        <SettingsToggle
          label={t('settings.localAi.embeddingsLabel')}
          description={t('settings.localAi.embeddingsDesc')}
          checked={localAi.enableEmbeddings}
          onToggle={() => onChange('localAi.enableEmbeddings', !localAi.enableEmbeddings)}
        />
        <SettingsToggle
          label={t('settings.localAi.cacheLabel')}
          description={t('settings.localAi.cacheDesc')}
          checked={localAi.enableInferenceCache}
          onToggle={() => onChange('localAi.enableInferenceCache', !localAi.enableInferenceCache)}
        />
        <div className="p-4 glass-card rounded-xl">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-zinc-200">{t('settings.localAi.cacheTtlLabel')}</span>
            <span className="font-mono text-[var(--color-accent-400)]">
              {t('settings.localAi.cacheTtlHours', { count: localAi.cacheTtlHours })}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={168}
            value={localAi.cacheTtlHours}
            onChange={(e) => onChange('localAi.cacheTtlHours', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-500)]"
          />
        </div>
        <SettingsToggle
          label={t('settings.localAi.stripExifLabel')}
          description={t('settings.localAi.stripExifDesc')}
          checked={localAi.stripExifOnVision}
          onToggle={() => onChange('localAi.stripExifOnVision', !localAi.stripExifOnVision)}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <HardDrive size={16} /> {t('settings.localAi.storageTitle')}
        </h3>
        <div className="p-4 glass-card rounded-xl">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-zinc-200">{t('settings.localAi.storageLimitLabel')}</span>
            <span className="font-mono text-[var(--color-accent-400)]">{localAi.maxModelStorageMb} MB</span>
          </div>
          <input
            type="range"
            min={512}
            max={8192}
            step={256}
            value={localAi.maxModelStorageMb}
            onChange={(e) => onChange('localAi.maxModelStorageMb', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-500)]"
          />
        </div>
        <p className="text-xs text-zinc-500 px-1">
          {t('settings.localAi.downloadedModelsHint', { count: localAi.downloadedModels.length })}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <WifiOff size={16} /> {t('settings.localAi.ollamaTitle')}
        </h3>
        <SettingsToggle
          label={t('settings.localAi.ollamaEnabledLabel')}
          description={t('settings.localAi.ollamaEnabledDesc')}
          checked={localAi.ollamaEnabled}
          onToggle={() => onChange('localAi.ollamaEnabled', !localAi.ollamaEnabled)}
        />
        {localAi.ollamaEnabled && (
          <div className="p-4 glass-card rounded-xl">
            <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.localAi.ollamaUrlLabel')}</label>
            <input
              type="url"
              value={localAi.ollamaBaseUrl}
              onChange={(e) => onChange('localAi.ollamaBaseUrl', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none font-mono text-sm"
              placeholder="http://127.0.0.1:11434"
            />
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[var(--color-accent-500)]/20 bg-[var(--color-accent-500)]/5 p-4 flex gap-3">
        <Shield className="text-[var(--color-accent-400)] flex-shrink-0" size={20} />
        <p className="text-sm text-zinc-400">{t('settings.localAi.privacyNotice')}</p>
      </section>
    </div>
  );
};
