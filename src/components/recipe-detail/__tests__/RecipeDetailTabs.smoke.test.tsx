import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { RecipeDetailTabs } from '../RecipeDetailTabs';
import i18n from '@/i18n';
import type { Recipe } from '@/types';
import type { NutritionAllergyReport } from '@/services/nutritionAllergyService';

const recipe: Recipe = {
  recipeTitle: 'Tab-Rezept',
  shortDescription: '',
  prepTime: '0',
  cookTime: '0',
  totalTime: '0',
  servings: '2',
  difficulty: 'einfach',
  ingredients: [{ sectionTitle: 'X', items: [{ quantity: '100', unit: 'g', name: 'Mehl' }] }],
  instructions: ['Rühren'],
  nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
  tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
  expertTips: [],
};

const nutritionReport: NutritionAllergyReport = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  allergens: [],
  matchedIngredients: 0,
  totalIngredients: 1,
};

function TabsHarness() {
  const [tab, setTab] = useState<'ingredients' | 'instructions' | 'nutrition'>('ingredients');
  return (
    <RecipeDetailTabs
      activeTab={tab}
      onTabChange={setTab}
      currentRecipe={recipe}
      scaleFactor={1}
      pantryMap={new Map()}
      onAddSingleToShoppingList={vi.fn()}
      nutritionReport={nutritionReport}
      isNutritionLoading={false}
      isGeminiCheckLoading={false}
      geminiVerification={null}
      handleGeminiNutritionCheck={vi.fn()}
      t={i18n.t}
    />
  );
}

describe('RecipeDetailTabs (Smoke)', () => {
  it(
    'wechselt zwischen den drei Tabs',
    async () => {
      const user = userEvent.setup();
      render(
        <I18nextProvider i18n={i18n}>
          <TabsHarness />
        </I18nextProvider>,
      );

      const tablist = screen.getByRole('tablist');
      expect(within(tablist).getByRole('tab', { selected: true })).toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: /Zubereitung|Instructions/i }));
      expect(screen.getByRole('tab', { name: /Zubereitung|Instructions/i })).toHaveAttribute('aria-selected', 'true');

      await user.click(screen.getByRole('tab', { name: /Nährwerte|Nutrition/i }));
      expect(screen.getByRole('tab', { name: /Nährwerte|Nutrition/i })).toHaveAttribute('aria-selected', 'true');
    },
    20_000,
  );
});
