import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import RecipeCard from '@/components/RecipeCard';
import i18n from '@/i18n';
import type { Recipe } from '@/types';

const recipeBase = (): Recipe => ({
  recipeTitle: 'Test Rezept',
  shortDescription: '',
  prepTime: '10',
  cookTime: '10',
  totalTime: '20',
  servings: '2',
  difficulty: 'mittel',
  ingredients: [],
  instructions: [],
  nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
  tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
  expertTips: [],
  pantryMatchPercentage: 50,
  ingredientCount: 4,
});

describe('RecipeCard', () => {
  it('ruft onSelectRecipe beim Klick', async () => {
    const user = userEvent.setup();
    const onSelectRecipe = vi.fn();
    const recipe = recipeBase();

    render(
      <I18nextProvider i18n={i18n}>
        <RecipeCard recipe={recipe} onSelectRecipe={onSelectRecipe} />
      </I18nextProvider>,
    );

    await user.click(screen.getByText('Test Rezept'));
    expect(onSelectRecipe).toHaveBeenCalledWith(recipe);
  });
});
