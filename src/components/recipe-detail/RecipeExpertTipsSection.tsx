import React from 'react';
import type { TFunction } from 'i18next';
import { Lightbulb } from 'lucide-react';
import type { Recipe } from '../../types';

type Props = {
  expertTips: NonNullable<Recipe['expertTips']>;
  t: TFunction;
};

export const RecipeExpertTipsSection: React.FC<Props> = ({ expertTips, t }) => (
  <div className="mt-12 pt-8 border-t border-zinc-800">
    <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
      <Lightbulb className="mr-3 text-[var(--color-accent-400)]" />
      {t('recipeDetail.expertTips')}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {expertTips.map((tip, i) => (
        <div key={tip.title + i} className="bg-zinc-900/50 border border-[var(--color-accent-500)]/20 p-5 rounded-xl">
          <h4 className="font-bold text-[var(--color-accent-400)] mb-2">{tip.title}</h4>
          <p className="text-zinc-400 text-sm">{tip.content}</p>
        </div>
      ))}
    </div>
  </div>
);
