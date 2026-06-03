import React from 'react';
import { Download, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DataBackupSectionProps {
  onImportClick: () => void;
  onExport: (format: 'json' | 'md' | 'csv' | 'pdf') => void;
}

export const DataBackupSection: React.FC<DataBackupSectionProps> = ({ onImportClick, onExport }) => {
  const { t } = useTranslation();

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        type="button"
        onClick={onImportClick}
        className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group"
      >
        <Upload className="text-zinc-500 group-hover:text-zinc-300 transition-colors" size={24} />
        <span className="font-bold text-zinc-300">{t('settings.backup.import')}</span>
      </button>
      <div className="flex flex-col gap-2">
        {(['json', 'md', 'csv', 'pdf'] as const).map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => onExport(format)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group"
          >
            <Download className="text-zinc-500 group-hover:text-zinc-300 transition-colors" size={20} />
            <span className="font-bold text-zinc-300">
              {t(
                format === 'json'
                  ? 'settings.backup.exportJson'
                  : format === 'md'
                    ? 'settings.backup.exportMd'
                    : format === 'csv'
                      ? 'settings.backup.exportCsv'
                      : 'settings.backup.exportPdf',
              )}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
