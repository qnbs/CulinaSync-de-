import React from 'react';
import type { IngredientGroup } from '../../types';
import type { TFunction } from 'i18next';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { scaleIngredientQuantity } from '../../services/utils';

interface IngredientsListProps {
  ingredients: IngredientGroup[];
  scaleFactor: number;
  pantryMap: Map<string, number>;
  t: TFunction;
}

export const IngredientsList: React.FC<IngredientsListProps> = ({
  ingredients,
  scaleFactor,
  pantryMap,
  t
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-4">{t('recipeDetail.ingredients')}</h3>
      <div className="space-y-6">
        {ingredients.map((group, groupIdx) => (
          <div key={group.sectionTitle || groupIdx}>
            {group.sectionTitle && (
              <h4 className="font-bold text-[var(--color-accent-400)] mb-3 uppercase text-sm tracking-wider">
                {group.sectionTitle}
              </h4>
            )}
            <div className="space-y-2">
              {group.items.map((item, index) => {
                const scaledQuantityStr = scaleIngredientQuantity(item.quantity, scaleFactor);
                const requiredQty = parseFloat(scaledQuantityStr.replace(',', '.')) || 0;
                const pantryQty = pantryMap.get(item.name.toLowerCase()) || 0;
                const isMatched = pantryQty >= requiredQty;

                return (
                  <div key={index} className="flex items-center gap-3 text-zinc-300">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800/50 text-[var(--color-accent-400)]">
                      {isMatched ? (
                        <CheckCircle size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-zinc-500">
                        {scaledQuantityStr} {item.unit}
                        {!isMatched && pantryQty > 0 && (
                          <span className="ml-2 text-xs text-[var(--color-accent-400)]">
                            ({t('recipeDetail.pantryAvailable', { amount: pantryQty, unit: item.unit })})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
