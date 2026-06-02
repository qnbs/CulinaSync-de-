import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { NutritionPanel } from '../NutritionPanel';
import i18n from '@/i18n';

const baseReport = {
  calories: 420,
  protein: 12,
  fat: 8,
  carbs: 55,
  allergens: ['Gluten'],
  matchedIngredients: 3,
  totalIngredients: 4,
};

describe('NutritionPanel', () => {
  it('zeigt Ladezustand', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <NutritionPanel
          report={baseReport}
          isNutritionLoading
          isGeminiCheckLoading={false}
          geminiVerification={null}
          handleGeminiNutritionCheck={vi.fn()}
          t={i18n.t}
        />
      </I18nextProvider>,
    );

    expect(screen.getByText(/recipeDetail.nutritionCalculating/i)).toBeInTheDocument();
  });

  it('zeigt Allergene und Gemini-Verifikation', async () => {
    const user = userEvent.setup();
    const handleGeminiNutritionCheck = vi.fn();

    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <NutritionPanel
          report={baseReport}
          isNutritionLoading={false}
          isGeminiCheckLoading={false}
          geminiVerification={null}
          handleGeminiNutritionCheck={handleGeminiNutritionCheck}
          t={i18n.t}
        />
      </I18nextProvider>,
    );

    expect(screen.getByText('Gluten')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /recipeDetail.verifyWithGemini/i }));
    expect(handleGeminiNutritionCheck).toHaveBeenCalled();

    rerender(
      <I18nextProvider i18n={i18n}>
        <NutritionPanel
          report={{ ...baseReport, allergens: [] }}
          isNutritionLoading={false}
          isGeminiCheckLoading={false}
          geminiVerification={{ summary: 'Plausibel', warnings: ['Salz prüfen'] }}
          handleGeminiNutritionCheck={handleGeminiNutritionCheck}
          t={i18n.t}
        />
      </I18nextProvider>,
    );

    expect(screen.getByText('Plausibel')).toBeInTheDocument();
    expect(screen.getByText('Salz prüfen')).toBeInTheDocument();
  });
});
