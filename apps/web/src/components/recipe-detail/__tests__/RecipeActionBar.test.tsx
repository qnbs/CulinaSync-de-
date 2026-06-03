import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { RecipeActionBar } from '../RecipeActionBar';
import i18n from '@/i18n';
import type { Recipe } from '@/types';

const savedRecipe: Recipe = {
  id: 1,
  recipeTitle: 'Action-Bar-Rezept',
  shortDescription: '',
  prepTime: '5',
  cookTime: '10',
  totalTime: '15',
  servings: '2',
  difficulty: 'Einfach',
  ingredients: [],
  instructions: [],
  nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
  tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
  expertTips: [],
  isFavorite: true,
};

describe('RecipeActionBar', () => {
  const handlers = {
    handleSave: vi.fn(),
    handleDelete: vi.fn(),
    handleExport: vi.fn(),
    handleAddMissingToShoppingList: vi.fn(),
    handleAddSingleToShoppingList: vi.fn(),
    handleToggleFavorite: vi.fn(),
    handleStartCookMode: vi.fn(),
    handleExitCookMode: vi.fn(),
  };

  it('zeigt Speichern nur fuer ungespeicherte Rezepte', async () => {
    const user = userEvent.setup();
    const unsaved = { ...savedRecipe, id: undefined };

    render(
      <I18nextProvider i18n={i18n}>
        <RecipeActionBar
          recipe={unsaved}
          isSaved={false}
          isCookModeActive={false}
          t={i18n.t}
          {...handlers}
        />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: i18n.t('recipeDetail.actions.save') }));
    expect(handlers.handleSave).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: i18n.t('recipeDetail.actions.delete') })).not.toBeInTheDocument();
  });

  it('loest Export- und Kochmodus-Aktionen aus', async () => {
    const user = userEvent.setup();

    render(
      <I18nextProvider i18n={i18n}>
        <RecipeActionBar
          recipe={savedRecipe}
          isSaved
          isCookModeActive={false}
          t={i18n.t}
          {...handlers}
        />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: i18n.t('recipeDetail.actions.exportPdf') }));
    expect(handlers.handleExport).toHaveBeenCalledWith('pdf');

    await user.click(screen.getByRole('button', { name: i18n.t('recipeDetail.actions.addMissingToShopping') }));
    expect(handlers.handleAddMissingToShoppingList).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: i18n.t('recipeDetail.actions.removeFavorite') }));
    expect(handlers.handleToggleFavorite).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: i18n.t('recipeDetail.actions.startCookMode') }));
    expect(handlers.handleStartCookMode).toHaveBeenCalled();
  });

  it('loest Loeschen und weitere Export-Formate aus', async () => {
    const user = userEvent.setup();

    render(
      <I18nextProvider i18n={i18n}>
        <RecipeActionBar
          recipe={savedRecipe}
          isSaved
          isCookModeActive={false}
          t={i18n.t}
          {...handlers}
        />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: i18n.t('recipeDetail.actions.delete') }));
    expect(handlers.handleDelete).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: i18n.t('recipeDetail.actions.exportCsv') }));
    expect(handlers.handleExport).toHaveBeenCalledWith('csv');

    await user.click(screen.getByRole('button', { name: i18n.t('recipeDetail.actions.exportJson') }));
    expect(handlers.handleExport).toHaveBeenCalledWith('json');

    await user.click(screen.getByRole('button', { name: i18n.t('recipeDetail.actions.exportMd') }));
    expect(handlers.handleExport).toHaveBeenCalledWith('md');

    await user.click(screen.getByRole('button', { name: i18n.t('recipeDetail.actions.exportTxt') }));
    expect(handlers.handleExport).toHaveBeenCalledWith('txt');
  });
});
