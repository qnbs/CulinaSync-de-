import React from 'react';
import type { TFunction } from 'i18next';
import { FileDown, CalendarPlus, ChevronDown } from 'lucide-react';

const EXPORT_FORMATS = ['pdf', 'csv', 'json', 'md', 'txt'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

type Props = {
  isSaved: boolean;
  isExportOpen: boolean;
  onOpenMealPlan: () => void;
  onToggleExportMenu: () => void;
  onCloseExportMenu: () => void;
  onExport: (format: ExportFormat) => void | Promise<void>;
  t: TFunction;
};

export const RecipePlanExportBar: React.FC<Props> = ({
  isSaved,
  isExportOpen,
  onOpenMealPlan,
  onToggleExportMenu,
  onCloseExportMenu,
  onExport,
  t,
}) => (
  <div className="mb-6 flex flex-wrap gap-3">
    {isSaved && (
      <button
        type="button"
        onClick={onOpenMealPlan}
        className="flex items-center gap-2 bg-zinc-800 text-zinc-200 font-bold py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700"
      >
        <CalendarPlus size={18} /> {t('recipeDetail.actions.plan')}
      </button>
    )}
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onToggleExportMenu}
        className="flex items-center gap-2 bg-zinc-800 text-zinc-200 font-bold py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700"
        aria-haspopup="menu"
        aria-expanded={isExportOpen}
        aria-controls="recipe-export-menu"
      >
        <FileDown size={18} /> {t('recipeDetail.actions.export')}
        <ChevronDown size={16} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
      </button>
      {isExportOpen && (
        <div
          id="recipe-export-menu"
          className="absolute top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-xl z-10 overflow-hidden"
          role="menu"
          aria-label={t('recipeDetail.confirm.exportTitle')}
        >
          {EXPORT_FORMATS.map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => {
                onCloseExportMenu();
                void onExport(fmt);
              }}
              className="block w-full text-left text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer"
              role="menuitem"
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);
