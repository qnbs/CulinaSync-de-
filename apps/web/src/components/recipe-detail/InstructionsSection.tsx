import React from 'react';
import type { Recipe } from '../../types';
import type { TFunction } from 'i18next';
import { UtensilsCrossed } from 'lucide-react';

interface InstructionsSectionProps {
  recipe: Recipe;
  t: TFunction;
}

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({
  recipe,
  t
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <UtensilsCrossed size={20} className="text-[var(--color-accent-400)]" />
        <h3 className="text-lg font-bold">{t('recipeDetail.instructions')}</h3>
      </div>
      <ol className="list-decimal list-inside space-y-3 text-zinc-300">
        {recipe.instructions.map((step, index) => (
          <li key={index} className="flex">
            <span className="flex-shrink-0 text-[var(--color-accent-400)] font-medium">
              {index + 1}.
            </span>
            <span className="flex-1">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
