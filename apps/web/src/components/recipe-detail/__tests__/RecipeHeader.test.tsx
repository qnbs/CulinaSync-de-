import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { RecipeHeader } from '../RecipeHeader';
import i18n from '@/i18n';
import type { Recipe } from '@/types';

const recipe: Recipe = {
  id: 1,
  recipeTitle: 'Header-Titel',
  shortDescription: '',
  prepTime: '0',
  cookTime: '0',
  totalTime: '0',
  servings: '2',
  difficulty: 'leicht',
  ingredients: [],
  instructions: [],
  nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
  tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
  expertTips: [],
};

describe('RecipeHeader', () => {
  it('zeigt Bild oder Generieren-CTA', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    const handleGenerateImage = vi.fn();

    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <RecipeHeader
          recipe={recipe}
          onBack={onBack}
          displayImage={null}
          isGeneratingImage={false}
          handleGenerateImage={handleGenerateImage}
          t={i18n.t}
        />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Bild generieren/i }));
    expect(handleGenerateImage).toHaveBeenCalled();

    rerender(
      <I18nextProvider i18n={i18n}>
        <RecipeHeader
          recipe={recipe}
          onBack={onBack}
          displayImage="data:image/png;base64,x"
          isGeneratingImage={false}
          handleGenerateImage={handleGenerateImage}
          t={i18n.t}
        />
      </I18nextProvider>,
    );

    expect(screen.getByRole('img', { name: 'Header-Titel' })).toBeInTheDocument();
  });

  it('zeigt Ladezustand bei Bildgenerierung', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <RecipeHeader
          recipe={recipe}
          onBack={vi.fn()}
          displayImage={null}
          isGeneratingImage
          handleGenerateImage={vi.fn()}
          t={i18n.t}
        />
      </I18nextProvider>,
    );

    expect(screen.getByText(/Generiere Bild/i)).toBeInTheDocument();
  });
});
