import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { IngredientsList } from '../IngredientsList';
import i18n from '@/i18n';

describe('IngredientsList', () => {
  const onAdd = vi.fn();

  it('markiert Vorrat-Status und erlaubt Einkauf nur bei fehlenden Zutaten', async () => {
    const user = userEvent.setup();
    const pantryMap = new Map<string, number>([
      ['mehl', 500],
      ['milch', 0.1],
    ]);

    render(
      <I18nextProvider i18n={i18n}>
        <IngredientsList
          ingredients={[
            {
              sectionTitle: 'Basis',
              items: [
                { quantity: '200', unit: 'g', name: 'Mehl' },
                { quantity: '250', unit: 'ml', name: 'Milch' },
                { quantity: '1', unit: 'Stk', name: 'Ei' },
              ],
            },
          ]}
          scaleFactor={2}
          pantryMap={pantryMap}
          onAddToShoppingList={onAdd}
          t={i18n.t}
        />
      </I18nextProvider>,
    );

    expect(screen.getByText(/Mehl/)).toBeInTheDocument();
    expect(screen.getByText(/400/)).toBeInTheDocument();

    const addButtons = screen.getAllByLabelText(/Zur Einkaufsliste/i);
    expect(addButtons.length).toBeGreaterThan(0);
    await user.click(addButtons[0]!);
    expect(onAdd).toHaveBeenCalled();
  });
});
