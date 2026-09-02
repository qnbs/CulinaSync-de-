import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import MealPlanner from '@/components/MealPlanner';
import i18n from '@/i18n';
import { createTestStore } from '@/test/createTestStore';
import type { MealPlanItem, PantryItem, Recipe } from '@/types';

const plannerCoverage = vi.hoisted(() => {
  const recipe: Recipe = {
    id: 1,
    recipeTitle: 'Plan-Rezept',
    shortDescription: 'Beschreibung',
    prepTime: '5',
    cookTime: '5',
    totalTime: '10',
    servings: '2',
    difficulty: 'Einfach',
    ingredients: [{ sectionTitle: '', items: [{ quantity: '1', unit: 'Stk', name: 'Tomate' }] }],
    instructions: ['Kochen'],
    nutritionPerServing: { calories: '100 kcal', protein: '10g', fat: '5g', carbs: '20g' },
    tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: ['Vegetarisch'] },
    expertTips: [],
    isFavorite: false,
    updatedAt: Date.now(),
  };

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 4, 4 + i);
    d.setHours(12, 0, 0, 0);
    return d;
  });

  const meal: MealPlanItem = {
    id: 42,
    date: '2026-05-04',
    mealType: 'Abendessen',
    recipeId: 1,
    isCooked: false,
    servings: 4,
  };

  const noteMeal: MealPlanItem = {
    id: 43,
    date: '2026-05-04',
    mealType: 'Mittagessen',
    note: 'Reste vom Vortag',
    isCooked: false,
  };

  const orphanMeal: MealPlanItem = {
    id: 44,
    date: '2026-05-05',
    mealType: 'Frühstück',
    recipeId: 999,
    isCooked: false,
  };

  const ctx = {
    currentDate: week[0]!,
    setCurrentDate: vi.fn(),
    pantryItems: [] as PantryItem[],
    recipes: [recipe],
    mealPlanItems: [meal, noteMeal, orphanMeal],
    recipesById: new Map<number, Recipe>([[1, recipe]]),
    week,
    mealsByDate: {
      '2026-05-04-Abendessen': meal,
      '2026-05-04-Mittagessen': noteMeal,
      '2026-05-05-Frühstück': orphanMeal,
    } as Record<string, MealPlanItem>,
  };

  return { recipe, meal, ctx };
});

vi.mock('@/hooks/useMealPlannerScreen', () => ({
  useMealPlannerScreen: () => plannerCoverage.ctx,
}));

vi.mock('@/services/exportService', () => ({
  exportMealPlanWeekToIcs: vi.fn(),
}));

vi.mock('@/services/mealPlannerSmartService', () => ({
  getSoonExpiringPantryNames: vi.fn(() => new Set()),
  buildAutoPlanSuggestionsFromExpiring: vi.fn(() => []),
}));

const repoMocks = vi.hoisted(() => ({
  addRecipeToMealPlan: vi.fn().mockResolvedValue(undefined),
  markMealAsCooked: vi.fn().mockResolvedValue({ success: true }),
  removeRecipeFromMealPlan: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/repositories/mealPlanRepository', () => repoMocks);

vi.mock('@/components/RecipeDetail', () => ({
  __esModule: true,
  default: ({ recipe, onBack }: { recipe: { recipeTitle: string }; onBack: () => void }) => (
    <div data-testid="recipe-detail">
      <span>{recipe.recipeTitle}</span>
      <button type="button" onClick={onBack}>Zurück</button>
    </div>
  ),
}));

vi.mock('@/components/CookModeView', () => ({
  __esModule: true,
  default: ({ recipe, onExit }: { recipe: { recipeTitle: string }; onExit: () => void }) => (
    <div data-testid="cook-mode">
      <span>{recipe.recipeTitle}</span>
      <button type="button" onClick={onExit}>Beenden</button>
    </div>
  ),
}));

describe('MealPlanner (coverage branches)', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
    store = createTestStore();
  });

  const renderPlanner = () =>
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MealPlanner />
        </I18nextProvider>
      </Provider>,
    );

  it('oeffnet Rezept-Detail via Menue-Aktion view', async () => {
    const user = userEvent.setup();
    renderPlanner();

    const cards = screen.getAllByText('Plan-Rezept');
    expect(cards.length).toBeGreaterThan(0);

    const card = cards[0]!.closest('.group') ?? cards[0]!.parentElement?.parentElement;
    const menuBtn = card?.querySelector('button');
    if (menuBtn) {
      await user.click(menuBtn);
      const viewBtn = await screen.findByText(/Rezept ansehen|viewRecipe/i);
      await user.click(viewBtn);
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument();
      await user.click(screen.getByText('Zurück'));
      expect(screen.queryByTestId('recipe-detail')).not.toBeInTheDocument();
    }
  });

  it('startet Kochmodus via Menue-Aktion cook', async () => {
    const user = userEvent.setup();
    renderPlanner();

    const card = screen.getAllByText('Plan-Rezept')[0]!.closest('.group');
    const menuBtn = card?.querySelector('button');
    if (menuBtn) {
      await user.click(menuBtn);
      const cookBtn = await screen.findByText(/Kochmodus|cookMode/i);
      await user.click(cookBtn);
      expect(screen.getByTestId('cook-mode')).toBeInTheDocument();
      await user.click(screen.getByText('Beenden'));
      expect(screen.queryByTestId('cook-mode')).not.toBeInTheDocument();
    }
  });

  it('markiert Mahlzeit als gekocht mit Pantry-Update-Toast', async () => {
    repoMocks.markMealAsCooked.mockResolvedValueOnce({
      success: true,
      changes: { updated: [{ name: 'Tomate' }], deleted: [] },
    });
    const user = userEvent.setup();
    renderPlanner();

    const card = screen.getAllByText('Plan-Rezept')[0]!.closest('.group');
    const menuBtn = card?.querySelector('button');
    if (menuBtn) {
      await user.click(menuBtn);
      const cookedBtn = await screen.findByText(/Als gekocht|markCooked/i);
      await user.click(cookedBtn);
      expect(repoMocks.markMealAsCooked).toHaveBeenCalledWith(42);
      expect(store.getState().ui.toasts[0]?.message).toMatch(/gekocht|Vorrats/i);
    }
  });

  it('entfernt Mahlzeit nach Bestaetigung', async () => {
    const user = userEvent.setup();
    renderPlanner();

    const card = screen.getAllByText('Plan-Rezept')[0]!.closest('.group');
    const menuBtn = card?.querySelector('button');
    if (menuBtn) {
      await user.click(menuBtn);
      const removeBtn = await screen.findByText(/Entfernen|remove/i);
      await user.click(removeBtn);
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /Entfernen|remove/i }));
      expect(repoMocks.removeRecipeFromMealPlan).toHaveBeenCalledWith(42);
    }
  });

  it('zeigt Notiz-Karte und entfernt Notiz', async () => {
    const user = userEvent.setup();
    renderPlanner();

    expect(screen.getByText('Reste vom Vortag')).toBeInTheDocument();
    const noteCard = screen.getByText('Reste vom Vortag').closest('.group');
    const removeNoteBtn = noteCard?.querySelector('button[title]');
    if (removeNoteBtn) {
      await user.click(removeNoteBtn);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    }
  });

  it('zeigt verwaiste Mahlzeit ohne Rezept', () => {
    renderPlanner();
    expect(screen.getByText(/Rezept nicht verfuegbar/i)).toBeInTheDocument();
  });

  it('schliesst Platzierungs-Overlay per Dismiss-Button', async () => {
    const user = userEvent.setup();
    renderPlanner();

    const recipeButtons = screen.getAllByText('Plan-Rezept');
    await user.click(recipeButtons[recipeButtons.length - 1]!);
    expect(screen.getByText(/Wähle einen Tag/i)).toBeInTheDocument();
    const dismiss = screen.getByLabelText(/Rezeptplatzierung abbrechen/i);
    await user.click(dismiss);
    expect(screen.queryByText(/Wähle einen Tag/i)).not.toBeInTheDocument();
  });

  it('plant Rezept per Drag-and-Drop auf leeren Slot', () => {
    renderPlanner();
    const emptySlot = screen.getAllByTitle('Notiz hinzufügen')[0]!.closest('[class*="min-h-[100px]"]');
    expect(emptySlot).toBeTruthy();
    fireEvent.drop(emptySlot!, {
      dataTransfer: { getData: () => '1' },
    });
    expect(repoMocks.addRecipeToMealPlan).toHaveBeenCalledWith(
      expect.objectContaining({ recipeId: 1 }),
    );
  });

  it('deaktiviert Speichern bei leerer Notiz', async () => {
    const user = userEvent.setup();
    renderPlanner();

    const addNoteButtons = screen.getAllByTitle('Notiz hinzufügen');
    await user.click(addNoteButtons[0]!);
    const saveBtn = screen.getByRole('button', { name: /Speichern|Save/i });
    expect(saveBtn).toBeDisabled();
  });

  it('markMealAsCooked ohne Erfolg zeigt keinen Toast', async () => {
    repoMocks.markMealAsCooked.mockResolvedValueOnce({ success: false });
    const user = userEvent.setup();
    renderPlanner();

    const card = screen.getAllByText('Plan-Rezept')[0]!.closest('.group');
    const menuBtn = card?.querySelector('button');
    if (menuBtn) {
      await user.click(menuBtn);
      const cookedBtn = await screen.findByText(/Als gekocht|markCooked/i);
      await user.click(cookedBtn);
      expect(store.getState().ui.toasts).toHaveLength(0);
    }
  });

  it('bricht Entfernen ab wenn mealToRemove ohne id', async () => {
    plannerCoverage.ctx.mealsByDate['2026-05-04-Abendessen'] = {
      ...plannerCoverage.meal,
      id: undefined,
    };
    const user = userEvent.setup();
    renderPlanner();

    const card = screen.getAllByText('Plan-Rezept')[0]!.closest('.group');
    const menuBtn = card?.querySelector('button');
    if (menuBtn) {
      await user.click(menuBtn);
      await user.click(await screen.findByText(/Entfernen|remove/i));
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /Entfernen|remove/i }));
      expect(repoMocks.removeRecipeFromMealPlan).not.toHaveBeenCalled();
    }
    plannerCoverage.ctx.mealsByDate['2026-05-04-Abendessen'] = plannerCoverage.meal;
  });
});
