import React from 'react';
import type { Recipe } from '../../types';
import type { TFunction } from 'i18next';
import { Clock, Users, BarChart, Minus, Plus } from 'lucide-react';

interface RecipeMetadataProps {
  recipe: Recipe;
  currentServings: number;
  handleServingsChange: (n: number) => void;
  t: TFunction;
}

export const RecipeMetadata: React.FC<RecipeMetadataProps> = ({
  recipe,
  currentServings,
  handleServingsChange,
  t
}) => {
  return (
    <>
      <div className="flex flex-wrap gap-x-6 gap-y-4 text-zinc-300 mb-6 pb-4 border-b border-zinc-700">
        <span className="flex items-center" title={t('recipeDetail.meta.totalTimeTitle')}>
          <Clock size={18} className="mr-2 text-[var(--color-accent-400)]" />
          {recipe.totalTime}
        </span>
        <span className="flex items-center" title={t('recipeDetail.meta.servingsTitle')}>
          <Users size={18} className="mr-2 text-[var(--color-accent-400)]" />
          {currentServings} {t(currentServings > 1 ? 'recipeDetail.meta.servingsPlural' : 'recipeDetail.meta.servingsSingular')}
        </span>
        <span className="flex items-center" title={t('recipeDetail.meta.difficultyTitle')}>
          <BarChart size={18} className="mr-2 text-[var(--color-accent-400)]" />
          {recipe.difficulty}
        </span>
      </div>

      <div className="mb-6 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-4">
        <label htmlFor="servings-input" className="font-semibold text-zinc-200 text-sm">
          {t('recipeDetail.adjustServings')}
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleServingsChange(currentServings - 1)}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
            disabled={currentServings <= 1}
            aria-label={t('recipeDetail.actions.decreaseServingsAria')}
          >
            <Minus size={16} />
          </button>
          <input
            id="servings-input"
            type="number"
            value={currentServings}
            onChange={(e) => handleServingsChange(parseInt(e.target.value, 10))}
            className="w-16 text-center bg-transparent border-b-2 border-[var(--color-accent-500)] font-bold text-xl text-zinc-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="1"
            max="100"
          />
          <button
            onClick={() => handleServingsChange(currentServings + 1)}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
            disabled={currentServings >= 100}
            aria-label={t('recipeDetail.actions.increaseServingsAria')}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </>
  );
};
