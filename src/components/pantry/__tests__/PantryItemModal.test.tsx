import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import type { PantryItem } from '@/types';
import { PantryItemModal } from '../PantryItemModal';

describe('PantryItemModal', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
  });

  it('Neuer Artikel: Speichern ruft onSave mit Formularwerten auf', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <PantryItemModal onClose={onClose} onSave={onSave} pantryItems={[]} />
      </I18nextProvider>,
    );

    expect(screen.getByRole('heading', { name: /Neuer Artikel im Vorrat/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^Name$/i), 'Test-Tomate');
    await user.clear(screen.getByLabelText(/^Menge$/i));
    await user.type(screen.getByLabelText(/^Menge$/i), '3');

    await user.click(screen.getByRole('button', { name: /Speichern/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0] as PantryItem;
    expect(saved.name).toContain('Test-Tomate');
    expect(saved.quantity).toBe(3);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Abbrechen ruft onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <PantryItemModal onClose={onClose} onSave={vi.fn()} pantryItems={[]} />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Abbrechen/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('Bearbeiten: Titel und vorbefuellte Felder', () => {
    const existing: PantryItem = {
      id: 5,
      name: 'Milch',
      quantity: 1,
      unit: 'Liter',
      category: 'Kühlung',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    render(
      <I18nextProvider i18n={i18n}>
        <PantryItemModal item={existing} onClose={vi.fn()} onSave={vi.fn()} pantryItems={[existing]} />
      </I18nextProvider>,
    );

    expect(screen.getByRole('heading', { name: /Artikel bearbeiten/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Milch')).toBeInTheDocument();
  });

  it('Overlay-Klick schliesst Modal', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <PantryItemModal onClose={onClose} onSave={vi.fn()} pantryItems={[]} />
      </I18nextProvider>,
    );

    const overlay = container.querySelector('.glass-overlay');
    expect(overlay).toBeTruthy();
    await user.click(overlay!);
    expect(onClose).toHaveBeenCalled();
  });
});
