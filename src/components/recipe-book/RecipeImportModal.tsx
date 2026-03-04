import React, { useRef, useState } from 'react';
import { LoaderCircle, Link as LinkIcon, FileJson, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Recipe } from '../../types';
import { importRecipeFromJsonString, importRecipeFromUrl } from '../../services/recipeImportService';
import { useModalA11y } from '../../hooks/useModalA11y';

type ImportMode = 'url' | 'json';

interface RecipeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (recipe: Recipe) => Promise<void>;
}

export const RecipeImportModal: React.FC<RecipeImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ImportMode>('url');
  const [url, setUrl] = useState('');
  const [jsonContent, setJsonContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const jsonTextareaRef = useRef<HTMLTextAreaElement>(null);

  const resetAndClose = () => {
    setMode('url');
    setUrl('');
    setJsonContent('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  useModalA11y({
    isOpen,
    onClose: resetAndClose,
    containerRef: modalRef,
    initialFocusRef: mode === 'url' ? urlInputRef : jsonTextareaRef,
  });

  const handleImport = async () => {
    setIsLoading(true);
    setError('');
    try {
      const recipe = mode === 'url' ? await importRecipeFromUrl(url) : importRecipeFromJsonString(jsonContent);
      await onImport(recipe);
      resetAndClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('recipeImport.error.generic');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      setJsonContent(content);
      setMode('json');
      setError('');
    } catch {
      setError(t('recipeImport.error.fileRead'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center page-fade-in glass-overlay" onClick={resetAndClose}>
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-import-title"
        tabIndex={-1}
        className="w-full max-w-2xl rounded-2xl p-6 glass-modal"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="recipe-import-title" className="text-xl font-bold text-zinc-100">
              {t('recipeImport.title')}
            </h3>
            <p className="mt-1 text-sm text-zinc-400">{t('recipeImport.description')}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-zinc-900/60 p-1 border border-zinc-800">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'url' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LinkIcon size={16} /> {t('recipeImport.tabs.url')}
          </button>
          <button
            type="button"
            onClick={() => setMode('json')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'json' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileJson size={16} /> {t('recipeImport.tabs.json')}
          </button>
        </div>

        {mode === 'url' ? (
          <div className="mt-4 space-y-3">
            <label className="text-sm font-medium text-zinc-300" htmlFor="recipe-import-url">
              {t('recipeImport.url.label')}
            </label>
            <input
              id="recipe-import-url"
              ref={urlInputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('recipeImport.url.placeholder')}
              className="w-full bg-zinc-900/70 border border-zinc-700 rounded-lg py-2.5 px-3 text-sm text-zinc-200 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none"
            />
            <p className="text-xs text-zinc-500">{t('recipeImport.url.helper')}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="text-sm font-medium text-zinc-300" htmlFor="recipe-import-json">
              {t('recipeImport.json.label')}
            </label>
            <textarea
              id="recipe-import-json"
              ref={jsonTextareaRef}
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              placeholder={t('recipeImport.json.placeholder')}
              className="w-full h-56 bg-zinc-900/70 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 font-mono focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none"
            />
            <label className="inline-flex items-center gap-2 text-sm text-zinc-300 cursor-pointer rounded-lg border border-zinc-700 px-3 py-2 hover:bg-zinc-800/70 transition-colors">
              <Upload size={16} />
              <span>{t('recipeImport.json.upload')}</span>
              <input type="file" accept="application/json,.json" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={resetAndClose} className="py-2 px-4 rounded-lg text-zinc-300 hover:bg-zinc-800">
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isLoading || (mode === 'url' ? !url.trim() : !jsonContent.trim())}
            className="py-2 px-4 rounded-lg bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] disabled:bg-zinc-700 disabled:text-zinc-400 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                {t('recipeImport.actions.importing')}
              </>
            ) : (
              t('recipeImport.actions.import')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
