import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { RecipeMetadata } from '../RecipeMetadata';
import i18n from '@/i18n';
import type { Recipe } from '@/types';

const recipe: Recipe = {
  recipeTitle: 'Meta-Rezept',
  shortDescription: '',
  prepTime: '5',
  cookTime: '10',
  totalTime: '45 Min.',
  servings: '2 Personen',
  difficulty: 'Mittel',
  ingredients: [],
  instructions: [],
  nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
  tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
  expertTips: [],
};

describe('RecipeMetadata', () => {
  it('passt Portionen per Stepper und Input an', async () => {
    const user = userEvent.setup();
    const handleServingsChange = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <RecipeMetadata recipe={recipe} currentServings={2} handleServingsChange={handleServingsChange} t={i18n.t} />
      </I18nextProvider>,
    );

    expect(screen.getByText('45 Min.')).toBeInTheDocument();
    expect(screen.getByText(/Mittel/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Portionen erhoehen/i }));
    expect(handleServingsChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole('button', { name: /Portionen verringern/i }));
    expect(handleServingsChange).toHaveBeenCalledWith(1);
  });
});
