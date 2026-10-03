import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import i18n from '../../../i18n';
import { createTestStore } from '../../../test/createTestStore';
import { PantryHeader } from '../PantryHeader';

const setModalState = vi.fn();

vi.mock('../../../contexts/PantryManagerContext', () => ({
  usePantryManagerContext: () => ({
    setModalState,
    pantryItems: [
      { id: 1, name: 'Milch', quantity: 1, minQuantity: 2, expiryDate: '2099-01-01' },
      { id: 2, name: 'Joghurt', quantity: 2, expiryDate: '2000-01-01' },
    ],
  }),
}));

describe('PantryHeader', () => {
  it('zeigt Statistiken und öffnet Hinzufügen-Modal', () => {
    render(
      <Provider store={createTestStore()}>
        <I18nextProvider i18n={i18n}>
          <PantryHeader />
        </I18nextProvider>
      </Provider>,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /artikel hinzuf/i }));
    expect(setModalState).toHaveBeenCalledWith({ isOpen: true, item: null });
  });
});
