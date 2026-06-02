import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import MealPlanner from '@/components/MealPlanner';
import i18n from '@/i18n';
import { createTestStore } from '@/test/createTestStore';
import type { MealPlanItem, PantryItem, Recipe } from '@/types';
import { exportMealPlanWeekToIcs } from '@/services/exportService';

// QNBS-v3: useMealPlannerScreen stub — echte Woche + Rezept fuer Header/Sidebar/Spalten
const plannerTest = vi.hoisted(() => {
  const recipe: Recipe = {
    id: 1,
    recipeTitle: 'Plan-Rezept',
    shortDescription: 'Beschreibung',
    prepTime: '5',
    cookTime: '5',
    totalTime: '10',
    servings: '2',
    difficulty: 'Einfach',
    ingredients: [],
    instructions: [],
    nutritionPerServing: { calories: '100 kcal', protein: '10g', fat: '5g', carbs: '20g' },
    tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
    expertTips: [],
    isFavorite: false,
    updatedAt: Date.now(),
  };

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 4, 4 + i);
    d.setHours(12, 0, 0, 0);
    return d;
  });

  const ctx = {
    currentDate: week[0]!,
    setCurrentDate: vi.fn(),
    pantryItems: [] as PantryItem[],
    recipes: [recipe],
    mealPlanItems: [] as MealPlanItem[],
    recipesById: new Map<number, Recipe>([[1, recipe]]),
    week,
    mealsByDate: {} as Record<string, MealPlanItem>,
  };

  return { recipe, ctx };
});

vi.mock('@/hooks/useMealPlannerScreen', () => ({
  useMealPlannerScreen: () => plannerTest.ctx,
}));

vi.mock('@/services/exportService', () => ({
  exportMealPlanWeekToIcs: vi.fn(),
}));

const smartPlannerMocks = vi.hoisted(() => ({
  getSoonExpiringPantryNames: vi.fn(() => []),
  buildAutoPlanSuggestionsFromExpiring: vi.fn(() => []),
}));

vi.mock('@/services/mealPlannerSmartService', () => smartPlannerMocks);

vi.mock('@/services/repositories/mealPlanRepository', () => ({
  addRecipeToMealPlan: vi.fn().mockResolvedValue(undefined),
  markMealAsCooked: vi.fn().mockResolvedValue({ success: true }),
  removeRecipeFromMealPlan: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/repositories/shoppingListRepository', () => ({
  generateListFromMealPlan: vi.fn().mockResolvedValue({ added: 0, existing: 0 }),
}));

describe('MealPlanner (Smoke)', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
    store = createTestStore();
    vi.mocked(exportMealPlanWeekToIcs).mockClear();
  });

  it('rendert Titel und Kalender-Export', async () => {
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MealPlanner />
        </I18nextProvider>
      </Provider>,
    );

    expect(screen.getByRole('heading', { level: 2, name: /Essensplaner/i })).toBeInTheDocument();

    const exportBtn = screen.getByRole('button', { name: /Kalender exportieren/i });
    await user.click(exportBtn);
    expect(exportMealPlanWeekToIcs).toHaveBeenCalledWith(
      plannerTest.ctx.week,
      plannerTest.ctx.mealsByDate,
      plannerTest.ctx.recipesById,
    );
  });

  it('Auto-Vorschlag mit Treffern zeigt Erfolgs-Toast', async () => {
    smartPlannerMocks.getSoonExpiringPantryNames.mockReturnValueOnce(new Set(['tomate']));
    smartPlannerMocks.buildAutoPlanSuggestionsFromExpiring.mockReturnValueOnce([
      { date: '2026-05-04', mealType: 'Abendessen' as const, recipeId: 1 },
    ]);

    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MealPlanner />
        </I18nextProvider>
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: /Auto-Vorschlag/i }));
    expect(store.getState().ui.toasts[0]?.message).toMatch(/Vorschlag|hinzugefügt|geplant/i);
  });

  it('Auto-Vorschlag ohne Treffer zeigt Info-Toast', async () => {
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MealPlanner />
        </I18nextProvider>
      </Provider>,
    );

    const autoBtn = screen.getByRole('button', { name: /Auto-Vorschlag/i });
    await user.click(autoBtn);

    expect(store.getState().ui.toasts[0]?.message).toMatch(/Keine passenden Vorschläge/i);
  });

  it('Wochennavigation ruft setCurrentDate auf', async () => {
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MealPlanner />
        </I18nextProvider>
      </Provider>,
    );

    const prev = screen.getByRole('button', { name: /Vorherige Woche/i });
    await user.click(prev);
    expect(plannerTest.ctx.setCurrentDate).toHaveBeenCalled();

    const next = screen.getByRole('button', { name: /Naechste Woche/i });
    await user.click(next);
    expect(plannerTest.ctx.setCurrentDate).toHaveBeenCalledTimes(2);
  });

  it('Sidebar listet Rezept', () => {
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MealPlanner />
        </I18nextProvider>
      </Provider>,
    );

    expect(screen.getByText('Plan-Rezept')).toBeInTheDocument();
  });
});
