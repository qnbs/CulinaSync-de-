import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { DayColumn } from '../DayColumn';
import type { MealPlanItem, Recipe } from '@/types';
import type { MealType } from '../mealPlannerConstants';
import i18n from '@/i18n';

const emptyMeals = (): Record<MealType, MealPlanItem | undefined> => ({
  Frühstück: undefined,
  Mittagessen: undefined,
  Abendessen: undefined,
});

describe('DayColumn', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('de');
  });

  it('ruft onSlotClick beim Klick auf leeren Slot (Notiz-Plus)', async () => {
    const user = userEvent.setup();
    const onSlotClick = vi.fn();
    const date = new Date(Date.UTC(2026, 4, 4, 12, 0, 0));

    render(
      <I18nextProvider i18n={i18n}>
        <DayColumn
          date={date}
          isToday={false}
          meals={emptyMeals()}
          recipesById={new Map()}
          onDrop={vi.fn()}
          onSlotClick={onSlotClick}
          onMealAction={vi.fn()}
        />
      </I18nextProvider>,
    );

    const addNoteButtons = screen.getAllByTitle('Notiz hinzufügen');
    expect(addNoteButtons.length).toBeGreaterThan(0);
    await user.click(addNoteButtons[0]);

    expect(onSlotClick).toHaveBeenCalledWith('2026-05-04', 'Frühstück');
  });

  it('Clear-Day bestaetigt und ruft remove fuer jede Mahlzeit', async () => {
    const user = userEvent.setup();
    const onMealAction = vi.fn();
    const meal: MealPlanItem = { id: 1, date: '2026-05-04', mealType: 'Mittagessen', recipeId: 9 };
    const recipe: Recipe = {
      id: 9,
      recipeTitle: 'Curry',
      shortDescription: '',
      prepTime: '0',
      cookTime: '0',
      totalTime: '0',
      servings: '2',
      difficulty: 'mittel',
      ingredients: [],
      instructions: [],
      nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      expertTips: [],
    };
    const date = new Date(Date.UTC(2026, 4, 4, 12, 0, 0));

    render(
      <I18nextProvider i18n={i18n}>
        <DayColumn
          date={date}
          isToday={false}
          meals={{
            Frühstück: undefined,
            Mittagessen: meal,
            Abendessen: undefined,
          }}
          recipesById={new Map([[9, recipe]])}
          onDrop={vi.fn()}
          onSlotClick={vi.fn()}
          onMealAction={onMealAction}
        />
      </I18nextProvider>,
    );

    const dayMenu = screen.getByRole('button', { name: /Aktionen fuer/i });
    const group = dayMenu.closest('.group');
    expect(group).toBeTruthy();
    await user.hover(group!);
    const menuClear = await screen.findByRole('button', { name: 'Tag leeren' });
    await user.click(menuClear);

    const dialog = screen.getByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Tag leeren' });
    await user.click(confirm);

    expect(onMealAction).toHaveBeenCalledWith('remove', meal);
  });
});
