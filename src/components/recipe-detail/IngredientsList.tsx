import React from 'react';
import type { IngredientGroup, IngredientItem } from '../../types';
import type { TFunction } from 'i18next';
import { CheckCircle, AlertCircle, ShoppingCartIcon } from 'lucide-react';
import { scaleIngredientQuantity } from '../../services/utils';

interface IngredientsListProps {
  ingredients: IngredientGroup[];
  scaleFactor: number;
  pantryMap: Map<string, number>;
  onAddToShoppingList: (item: IngredientItem) => void;
  t: TFunction;
}

export const IngredientsList: React.FC<IngredientsListProps> = ({
  ingredients,
  scaleFactor,
  pantryMap,
  onAddToShoppingList,
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
            <ul className="space-y-2">
              {group.items.map((item, index) => {
                const scaledQuantityStr = scaleIngredientQuantity(item.quantity, scaleFactor);
                const requiredQty = parseFloat(scaledQuantityStr.replace(',', '.')) || 0;
                const pantryQty = pantryMap.get(item.name.toLowerCase()) || 0;

                let status: 'have' | 'low' | 'missing' = 'missing';
                if (pantryQty >= requiredQty) status = 'have';
                else if (pantryQty > 0) status = 'low';

                return (
                  <li
                    key={index}
                    className="flex items-start text-zinc-300 group bg-zinc-900/30 p-2 rounded-lg hover:bg-zinc-900/80 transition-colors"
                  >
                    <div className="flex-grow flex items-center">
                      {status === 'have' && (
                        <span title={t('recipeDetail.ingredientStatus.haveTitle')} className="flex-shrink-0 mr-3">
                          <CheckCircle size={16} className="text-emerald-500" />
                        </span>
                      )}
                      {status === 'low' && (
                        <span title={t('recipeDetail.ingredientStatus.lowTitle', { pantryQty, unit: item.unit })} className="flex-shrink-0 mr-3">
                          <AlertCircle size={16} className="text-amber-500" />
                        </span>
                      )}
                      {status === 'missing' && (
                        <div className="w-4 h-4 rounded-full border-2 border-zinc-700 mr-3 flex-shrink-0" />
                      )}
                      <div className="flex-grow">
                        <span className="font-medium text-zinc-100">{scaledQuantityStr} {item.unit}</span>{' '}
                        <span className="text-zinc-400">{item.name}</span>
                        {status === 'low' && pantryQty > 0 && (
                          <span className="ml-2 text-xs text-[var(--color-accent-400)]">
                            ({t('recipeDetail.pantryAvailable', { amount: pantryQty, unit: item.unit })})
                          </span>
                        )}
                      </div>
                    </div>
                    {status !== 'have' && (
                      <button
                        onClick={() => onAddToShoppingList(item)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-zinc-800 rounded text-zinc-400 hover:text-[var(--color-accent-400)]"
                        title={t('recipeDetail.actions.addToShoppingListTitle')}
                        aria-label={t('recipeDetail.actions.addToShoppingListTitle')}
                      >
                        <ShoppingCartIcon size={16} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
