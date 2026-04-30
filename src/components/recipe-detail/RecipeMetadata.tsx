import React from 'react';
import type { Recipe } from '../../types';
import type { TFunction } from 'i18next';
import { Clock, Users, BarChart } from 'lucide-react';

interface RecipeMetadataProps {
  recipe: Recipe;
  currentServings: number;
  t: TFunction;
}

export const RecipeMetadata: React.FC<RecipeMetadataProps> = ({
  recipe,
  currentServings,
  t
}) => {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-4 text-zinc-300 mb-6 pb-6 border-b border-zinc-700">
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
  );
};
