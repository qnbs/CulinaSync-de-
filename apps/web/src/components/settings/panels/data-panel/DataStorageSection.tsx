import React from 'react';
import { HardDrive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatStorageBytes } from './formatStorageBytes';

interface DataStorageSectionProps {
  storageEstimate: { used: number; quota: number } | null;
  recipeCount: number | undefined;
  pantryCount: number | undefined;
}

export const DataStorageSection: React.FC<DataStorageSectionProps> = ({
  storageEstimate,
  recipeCount,
  pantryCount,
}) => {
  const { t } = useTranslation();
  const usedRatio =
    (storageEstimate?.used || 0) / Math.max(storageEstimate?.quota || 1, 1);
  const circumference = 2 * Math.PI * 45;

  return (
    <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
        <HardDrive className="text-[var(--color-accent-400)]" /> {t('settings.data.storage.title')}
      </h3>

      <div className="flex items-center justify-center mb-6 relative">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="transparent" stroke="#27272a" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="var(--color-accent-500)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - usedRatio)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-200">
            <span className="text-2xl font-bold">
              {storageEstimate ? formatStorageBytes(storageEstimate.used, t) : '...'}
            </span>
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
  );
};
