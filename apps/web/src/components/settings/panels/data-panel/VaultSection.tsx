import React from 'react';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VaultSectionProps {
  vaultPassphrase: string;
  onPassphraseChange: (value: string) => void;
  vaultBusy: boolean;
  onExport: () => void;
  onImportClick: () => void;
}

export const VaultSection: React.FC<VaultSectionProps> = ({
  vaultPassphrase,
  onPassphraseChange,
  vaultBusy,
  onExport,
  onImportClick,
}) => {
  const { t } = useTranslation();
  const disabled = vaultBusy || !vaultPassphrase.trim();

  return (
    <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 mt-8">
      <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
        <Lock className="text-[var(--color-accent-400)]" /> {t('settings.data.vault.title')}
      </h3>
      <input
        type="password"
        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none font-mono"
        placeholder={t('settings.data.vault.passphrasePlaceholder')}
        value={vaultPassphrase}
        onChange={(e) => onPassphraseChange(e.target.value)}
        autoComplete="new-password"
      />
      <div className="flex flex-wrap gap-3 mb-2">
        <button
          type="button"
          onClick={() => void onExport()}
          disabled={disabled}
          className="px-4 py-2 rounded-xl bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
        >
          {vaultBusy ? '…' : t('settings.data.vault.export')}
        </button>
        <button
          type="button"
          onClick={onImportClick}
          disabled={disabled}
          className="px-4 py-2 rounded-xl border border-zinc-600 text-zinc-200 font-semibold hover:bg-zinc-800 disabled:opacity-50"
        >
          {t('settings.data.vault.import')}
        </button>
      </div>
      <p className="text-xs text-zinc-500">{t('settings.data.vault.helper')}</p>
    </section>
  );
};
