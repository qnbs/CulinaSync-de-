import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import PlannedMealCard from '../PlannedMealCard';
import i18n from '@/i18n';
import type { MealPlanItem, Recipe } from '@/types';

const recipe: Recipe = {
  id: 1,
  recipeTitle: 'Gemüse-Curry',
  shortDescription: '',
  prepTime: '10',
  cookTime: '20',
  totalTime: '30',
  servings: '2',
  difficulty: 'leicht',
  ingredients: [],
  instructions: [],
  nutritionPerServing: { calories: '400 kcal', protein: '10g', fat: '8g', carbs: '50g' },
  tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: ['Vegetarisch'] },
  expertTips: [],
};

const meal: MealPlanItem = {
  id: 1,
  date: '2026-06-02',
  mealType: 'Abendessen',
  recipeId: 1,
  servings: 4,
};

describe('PlannedMealCard (Smoke)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
  });

  it('rendert Notiz-Slot und entfernt per Aktion', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const noteMeal: MealPlanItem = { ...meal, recipeId: undefined, note: 'Essen gehen' };

    render(
      <I18nextProvider i18n={i18n}>
        <PlannedMealCard
          meal={noteMeal}
          recipe={undefined}
          pantryStatus={{ status: 'unknown', have: 0, total: 0 }}
          onAction={onAction}
        />
      </I18nextProvider>,
    );

    expect(screen.getByText('Essen gehen')).toBeInTheDocument();
    await user.click(screen.getByTitle(/Notiz entfernen/i));
    expect(onAction).toHaveBeenCalledWith('remove', noteMeal);
  });

  it('zeigt verwaistes Gericht ohne Rezept', async () => {
    const onAction = vi.fn();
    render(
      <I18nextProvider i18n={i18n}>
        <PlannedMealCard
          meal={meal}
          recipe={undefined}
          pantryStatus={{ status: 'missing', have: 0, total: 3 }}
          onAction={onAction}
        />
      </I18nextProvider>,
    );

    expect(screen.getByText(/Rezept nicht verfuegbar/i)).toBeInTheDocument();
  });

  it('oeffnet Aktionsmenue fuer geplantes Rezept', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <PlannedMealCard
          meal={meal}
          recipe={recipe}
          pantryStatus={{ status: 'partial', have: 2, total: 5 }}
          onAction={onAction}
        />
      </I18nextProvider>,
    );

    expect(screen.getByText('Gemüse-Curry')).toBeInTheDocument();
    const row = screen.getByText('Gemüse-Curry').closest('.flex.justify-between') as HTMLElement;
    await user.click(within(row).getByRole('button'));

    await user.click(screen.getByRole('button', { name: /Rezept ansehen/i }));
    expect(onAction).toHaveBeenCalledWith('view', recipe);
  });

  it('markiert gekocht und startet Kochmodus', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <PlannedMealCard
          meal={meal}
          recipe={recipe}
          pantryStatus={{ status: 'ok', have: 5, total: 5 }}
          onAction={onAction}
        />
      </I18nextProvider>,
    );

    const row = screen.getByText('Gemüse-Curry').closest('.flex.justify-between') as HTMLElement;
    await user.click(within(row).getByRole('button'));
    await user.click(screen.getByRole('button', { name: /Kochmodus/i }));
    expect(onAction).toHaveBeenCalledWith('cook', recipe);

    await user.click(within(row).getByRole('button'));
    await user.click(screen.getByRole('button', { name: /Als gekocht/i }));
    expect(onAction).toHaveBeenCalledWith('cooked', meal);
  });

  it('blendet markCooked aus wenn bereits gekocht', async () => {
    const user = userEvent.setup();
    const cookedMeal = { ...meal, isCooked: true };

    render(
      <I18nextProvider i18n={i18n}>
        <PlannedMealCard
          meal={cookedMeal}
          recipe={recipe}
          pantryStatus={{ status: 'ok', have: 5, total: 5 }}
          onAction={vi.fn()}
        />
      </I18nextProvider>,
    );

    const row = screen.getByText('Gemüse-Curry').closest('.flex.justify-between') as HTMLElement;
    await user.click(within(row).getByRole('button'));
    expect(screen.queryByRole('button', { name: /Als gekocht/i })).not.toBeInTheDocument();
  });

  it('schliesst Menue bei Klick ausserhalb', async () => {
    const user = userEvent.setup();

    render(
      <I18nextProvider i18n={i18n}>
        <div>
          <button type="button">outside</button>
          <PlannedMealCard
            meal={meal}
            recipe={recipe}
            pantryStatus={{ status: 'missing', have: 0, total: 2 }}
            onAction={vi.fn()}
          />
        </div>
      </I18nextProvider>,
    );

    const row = screen.getByText('Gemüse-Curry').closest('.flex.justify-between') as HTMLElement;
    await user.click(within(row).getByRole('button'));
    expect(screen.getByRole('button', { name: /Entfernen/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('button', { name: /Entfernen/i })).not.toBeInTheDocument();
  });
});
