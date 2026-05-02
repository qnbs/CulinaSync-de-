import React from 'react';
import type { TFunction } from 'i18next';
import type { IngredientItem, Recipe } from '../../types';
import type { NutritionAllergyReport } from '../../services/nutritionAllergyService';
import { IngredientsList } from './IngredientsList';
import { InstructionsSection } from './InstructionsSection';
import { NutritionPanel } from './NutritionPanel';

type TabId = 'ingredients' | 'instructions' | 'nutrition';

type Props = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  currentRecipe: Recipe;
  scaleFactor: number;
  pantryMap: Map<string, number>;
  onAddSingleToShoppingList: (item: IngredientItem) => void;
  nutritionReport: NutritionAllergyReport;
  isNutritionLoading: boolean;
  isGeminiCheckLoading: boolean;
  geminiVerification: { summary: string; warnings: string[] } | null;
  handleGeminiNutritionCheck: () => void;
  t: TFunction;
};

const TABS: TabId[] = ['ingredients', 'instructions', 'nutrition'];

export const RecipeDetailTabs: React.FC<Props> = ({
  activeTab,
  onTabChange,
  currentRecipe,
  scaleFactor,
  pantryMap,
  onAddSingleToShoppingList,
  nutritionReport,
  isNutritionLoading,
  isGeminiCheckLoading,
  geminiVerification,
  handleGeminiNutritionCheck,
  t,
}) => (
  <div className="mt-2">
    <div
      role="tablist"
      aria-label={t('recipeDetail.tabsListAria')}
      className="flex border-b border-zinc-700 mb-4"
    >
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          id={`recipe-detail-tab-${tab}`}
          aria-selected={activeTab === tab}
          aria-controls={`recipe-detail-panel-${tab}`}
          onClick={() => onTabChange(tab)}
          className={`flex-1 px-4 py-3 text-center font-medium text-sm ${activeTab === tab ? 'border-b-2 border-[var(--color-accent-500)] text-[var(--color-accent-400)]' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          {t(`recipeDetail.${tab}`)}
        </button>
      ))}
    </div>

    <div
      id="recipe-detail-panel-ingredients"
      role="tabpanel"
      aria-labelledby="recipe-detail-tab-ingredients"
      hidden={activeTab !== 'ingredients'}
    >
      <IngredientsList
        ingredients={currentRecipe.ingredients}
        scaleFactor={scaleFactor}
        pantryMap={pantryMap}
        onAddToShoppingList={onAddSingleToShoppingList}
        t={t}
      />
    </div>

    <div
      id="recipe-detail-panel-instructions"
      role="tabpanel"
      aria-labelledby="recipe-detail-tab-instructions"
      hidden={activeTab !== 'instructions'}
    >
      <InstructionsSection recipe={currentRecipe} t={t} />
    </div>

    <div
      id="recipe-detail-panel-nutrition"
      role="tabpanel"
      aria-labelledby="recipe-detail-tab-nutrition"
      hidden={activeTab !== 'nutrition'}
    >
      <NutritionPanel
        report={nutritionReport}
        isNutritionLoading={isNutritionLoading}
        isGeminiCheckLoading={isGeminiCheckLoading}
        geminiVerification={geminiVerification}
        handleGeminiNutritionCheck={handleGeminiNutritionCheck}
        t={t}
      />
    </div>
  </div>
);
