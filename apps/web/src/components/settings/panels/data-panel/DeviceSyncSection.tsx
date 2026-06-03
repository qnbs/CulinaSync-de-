import React from 'react';
import { QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DeviceSyncSectionProps {
  onOpen: () => void;
}

export const DeviceSyncSection: React.FC<DeviceSyncSectionProps> = ({ onOpen }) => {
  const { t } = useTranslation();

  return (
    <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 mt-8">
      <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
        <QrCode className="text-[var(--color-accent-400)]" /> {t('settings.data.deviceSync.sectionTitle')}
      </h3>
      <p className="text-sm text-zinc-400 mb-4">{t('settings.data.deviceSync.sectionHint')}</p>
      <button
        type="button"
        onClick={onOpen}
        className="px-4 py-2 rounded-xl border border-zinc-600 text-zinc-200 font-semibold hover:bg-zinc-800"
      >
        {t('settings.data.deviceSync.openAction')}
      </button>
    </section>
  );
};
