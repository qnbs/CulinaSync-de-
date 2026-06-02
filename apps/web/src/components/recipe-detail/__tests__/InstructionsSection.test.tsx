import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { InstructionsSection } from '../InstructionsSection';
import i18n from '@/i18n';
import type { Recipe } from '@/types';

const recipe: Recipe = {
  recipeTitle: 'Test',
  shortDescription: '',
  prepTime: '0',
  cookTime: '0',
  totalTime: '0',
  servings: '2',
  difficulty: 'leicht',
  ingredients: [],
  instructions: ['Wasser kochen', 'Nudeln ziehen'],
  nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
  tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
  expertTips: [],
};

describe('InstructionsSection', () => {
  it('rendert nummerierte Schritte', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <InstructionsSection recipe={recipe} t={i18n.t} />
      </I18nextProvider>,
    );

    expect(screen.getByText('Wasser kochen')).toBeInTheDocument();
    expect(screen.getByText('Nudeln ziehen')).toBeInTheDocument();
    expect(screen.getByText('1.')).toBeInTheDocument();
  });
});
