import React from 'react';
import type { Recipe, IngredientItem } from '../../types';
import type { TFunction } from 'i18next';
import { FileDown, Trash2, ShoppingCartIcon, Save, Star, CookingPot } from 'lucide-react';

interface RecipeActionBarProps {
  recipe: Recipe;
  isSaved: boolean;
  handleSave: () => void;
  handleDelete: () => void;
  handleExport: (format: 'pdf' | 'csv' | 'json' | 'md' | 'txt') => void;
  handleAddMissingToShoppingList: () => void;
  handleAddSingleToShoppingList: (item: IngredientItem) => void;
  handleToggleFavorite: () => void;
  handleStartCookMode: () => void;
  isCookModeActive: boolean;
  handleExitCookMode: () => void;
  t: TFunction;
}

export const RecipeActionBar: React.FC<RecipeActionBarProps> = ({
  recipe,
  isSaved,
  handleSave,
  handleDelete,
  handleExport,
  handleAddMissingToShoppingList,
  handleToggleFavorite,
  handleStartCookMode,
  isCookModeActive,
  t
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {!isSaved && (
        <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] transition-colors">
          <Save size={20} /> {t('recipeDetail.actions.save')}
        </button>
      )}
      {recipe.id && (
        <>
          <button onClick={handleDelete} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-colors">
            <Trash2 size={20} /> {t('recipeDetail.actions.delete')}
          </button>
          <button onClick={() => handleExport('pdf')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] hover:bg-[var(--color-accent-500)]/30 transition-colors">
            <FileDown size={20} /> {t('recipeDetail.actions.exportPdf')}
          </button>
          <button onClick={() => handleExport('csv')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] hover:bg-[var(--color-accent-500)]/30 transition-colors">
            <FileDown size={20} /> {t('recipeDetail.actions.exportCsv')}
          </button>
          <button onClick={() => handleExport('json')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] hover:bg-[var(--color-accent-500)]/30 transition-colors">
            <FileDown size={20} /> {t('recipeDetail.actions.exportJson')}
          </button>
          <button onClick={() => handleExport('md')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] hover:bg-[var(--color-accent-500)]/30 transition-colors">
            <FileDown size={20} /> {t('recipeDetail.actions.exportMd')}
          </button>
          <button onClick={() => handleExport('txt')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] hover:bg-[var(--color-accent-500)]/30 transition-colors">
            <FileDown size={20} /> {t('recipeDetail.actions.exportTxt')}
          </button>
          <button onClick={handleAddMissingToShoppingList} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] hover:bg-[var(--color-accent-500)]/30 transition-colors">
            <ShoppingCartIcon size={20} /> {t('recipeDetail.actions.addMissingToShopping')}
          </button>
          <button onClick={handleToggleFavorite} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] hover:bg-[var(--color-accent-500)]/30 transition-colors">
            <Star size={20} className={recipe.isFavorite ? 'text-yellow-400' : 'text-zinc-400'} />{' '}
            {recipe.isFavorite ? t('recipeDetail.actions.removeFavorite') : t('recipeDetail.actions.markFavorite')}
          </button>
          <button onClick={handleStartCookMode} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${isCookModeActive ? 'bg-[var(--color-accent-500)] text-zinc-900 font-bold' : 'bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)]'} hover:bg-[var(--color-accent-500)]/30 transition-colors`}>
            <CookingPot size={20} /> {t('recipeDetail.actions.startCookMode')}
          </button>
        </>
      )}
    </div>
  );
};
