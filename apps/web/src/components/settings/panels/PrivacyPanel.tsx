import React from 'react';
import { Eye, EyeOff, Lock, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AppSettings } from '../../../types';
import { SettingsToggle } from '../SettingsToggle';

interface PrivacyPanelProps {
  settings: AppSettings;
  onChange: (path: string, value: unknown) => void;
}

export const PrivacyPanel: React.FC<PrivacyPanelProps> = ({ settings, onChange }) => {
  const { t } = useTranslation();
  const { privacy } = settings;

  return (
    <div className="space-y-8 page-fade-in">
      <section className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-zinc-100 mb-2 flex items-center gap-2">
          <Lock className="text-[var(--color-accent-400)]" size={22} />
          {t('settings.privacy.title')}
        </h3>
        <p className="text-sm text-zinc-400">{t('settings.privacy.subtitle')}</p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{t('settings.privacy.dataTitle')}</h3>
        <SettingsToggle
          label={t('settings.privacy.analyticsLabel')}
          description={t('settings.privacy.analyticsDesc')}
          checked={privacy.analyticsEnabled}
          onToggle={() => onChange('privacy.analyticsEnabled', !privacy.analyticsEnabled)}
        />
        <SettingsToggle
          label={t('settings.privacy.diagnosticsLabel')}
          description={t('settings.privacy.diagnosticsDesc')}
          checked={privacy.shareDiagnostics}
          onToggle={() => onChange('privacy.shareDiagnostics', !privacy.shareDiagnostics)}
        />
        <SettingsToggle
          label={t('settings.privacy.redactPiiLabel')}
          description={t('settings.privacy.redactPiiDesc')}
          checked={privacy.redactPiiInLogs}
          onToggle={() => onChange('privacy.redactPiiInLogs', !privacy.redactPiiInLogs)}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <Eye size={16} /> {t('settings.privacy.aiTitle')}
        </h3>
        <SettingsToggle
          label={t('settings.privacy.persistPromptsLabel')}
          description={t('settings.privacy.persistPromptsDesc')}
          checked={privacy.persistAiPromptsLocally}
          onToggle={() => onChange('privacy.persistAiPromptsLocally', !privacy.persistAiPromptsLocally)}
        />
        <SettingsToggle
          label={t('settings.privacy.clearCacheLabel')}
          description={t('settings.privacy.clearCacheDesc')}
          checked={privacy.autoClearInferenceCache}
          onToggle={() => onChange('privacy.autoClearInferenceCache', !privacy.autoClearInferenceCache)}
        />
      </section>

      <section className="rounded-xl border border-zinc-700 bg-zinc-900/40 p-4 flex gap-3">
        <EyeOff className="text-zinc-500 flex-shrink-0" size={20} />
        <div>
          <p className="text-sm text-zinc-300 font-medium">{t('settings.privacy.localFirstTitle')}</p>
          <p className="text-xs text-zinc-500 mt-1">{t('settings.privacy.localFirstDesc')}</p>
          <a
            className="inline-block mt-2 text-xs font-medium text-[var(--color-accent-400)] hover:underline"
            href="https://github.com/qnbs/CulinaSync-de-/blob/main/docs/legal/DATENSCHUTZ.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('settings.privacy.policyLink')}
          </a>
        </div>
      </section>

      <section className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 flex gap-3">
        <Trash2 className="text-red-400 flex-shrink-0" size={20} />
        <p className="text-sm text-zinc-400">{t('settings.privacy.resetHint')}</p>
      </section>
    </div>
  );
};
