import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { MealPlannerHeader } from '../MealPlannerHeader';
import i18n from '@/i18n';
import { createTestStore } from '@/test/createTestStore';
import type { MealPlanItem, Recipe } from '@/types';

vi.mock('@/services/repositories/shoppingListRepository', () => ({
  generateListFromMealPlan: vi.fn().mockResolvedValue({ added: 2, existing: 1 }),
}));

const recipe: Recipe = {
  id: 1,
  recipeTitle: 'Header-Rezept',
  shortDescription: '',
  prepTime: '5',
  cookTime: '10',
  totalTime: '30',
  servings: '2',
  difficulty: 'leicht',
  ingredients: [],
  instructions: [],
  nutritionPerServing: { calories: '700 kcal', protein: '20g', fat: '10g', carbs: '80g' },
  tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
  expertTips: [],
};

describe('MealPlannerHeader', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
  });

  it('zeigt Wochen-Naehrwerte und generiert Einkaufsliste', async () => {
    const user = userEvent.setup();
    const setCurrentDate = vi.fn();
    const week = [new Date(2026, 4, 4, 12, 0, 0)];
    const mealsByDate: Record<string, MealPlanItem> = {
      '2026-05-04-Abendessen': { id: 1, date: '2026-05-04', mealType: 'Abendessen', recipeId: 1, servings: 2 },
    };
    const store = createTestStore();

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MealPlannerHeader
            currentDate={week[0]!}
            setCurrentDate={setCurrentDate}
            weekString="KW 19"
            mealsByDate={mealsByDate}
            recipesById={new Map([[1, recipe]])}
            weekDates={week}
            onExportIcs={vi.fn()}
            onAutoPlanExpiring={vi.fn()}
          />
        </I18nextProvider>
      </Provider>,
    );

    expect(screen.getByText('KW 19')).toBeInTheDocument();
    expect(screen.getByText(/Wochen-Schnitt/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Einkaufsliste aus Wochenplan/i }));
    expect(store.getState().ui.toasts[0]?.message).toMatch(/2|hinzugefügt/i);

    await user.click(screen.getByRole('button', { name: /Heute/i }));
    expect(setCurrentDate).toHaveBeenCalled();
  });
});
