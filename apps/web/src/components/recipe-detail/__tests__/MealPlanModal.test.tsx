import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { MealPlanModal } from '../MealPlanModal';
import i18n from '@/i18n';

const addRecipeToMealPlan = vi.fn().mockResolvedValue(undefined);

vi.mock('@/services/repositories/mealPlanRepository', () => ({
  addRecipeToMealPlan: (...args: unknown[]) => addRecipeToMealPlan(...args),
}));

describe('MealPlanModal', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
  });

  it('speichert Mahlzeit und schliesst Modal', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <MealPlanModal recipeId={42} onClose={onClose} onSave={onSave} />
      </I18nextProvider>,
    );

    const dateInput = screen.getByLabelText(/Datum/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2026-06-15');

    await user.selectOptions(screen.getByLabelText(/Mahlzeit/i), 'Mittagessen');
    await user.click(screen.getByRole('button', { name: /Speichern/i }));

    expect(addRecipeToMealPlan).toHaveBeenCalledWith(
      expect.objectContaining({ recipeId: 42, date: '2026-06-15', mealType: 'Mittagessen' }),
    );
    expect(onSave).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('bricht per Abbrechen ab', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <MealPlanModal recipeId={1} onClose={onClose} onSave={vi.fn()} />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Abbrechen/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
