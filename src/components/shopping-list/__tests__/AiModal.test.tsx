import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { AiModal } from '../AiModal';
import type { PantryItem, ShoppingListItem } from '@/types';

const mockCtx = vi.fn();

vi.mock('@/contexts/ShoppingListContext', () => ({
  useShoppingListContext: () => mockCtx(),
}));

const generateShoppingList = vi.fn();

vi.mock('@/services/aiService', () => ({
  generateShoppingList: (...args: unknown[]) => generateShoppingList(...args),
}));

function buildCtx(overrides: Record<string, unknown> = {}) {
  return {
    isAiModalOpen: true,
    setAiModalOpen: vi.fn(),
    handleAiAdd: vi.fn().mockResolvedValue(undefined),
    pantryItems: [] as PantryItem[],
    activeItems: [] as ShoppingListItem[],
    ...overrides,
  };
}

describe('AiModal', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
    generateShoppingList.mockResolvedValue([
      { name: 'Mehl', quantity: 500, unit: 'g', category: 'Backwaren' },
      { name: 'Zucker', quantity: 100, unit: 'g', category: 'Backwaren' },
    ]);
    mockCtx.mockReturnValue(buildCtx());
  });

  it('verborgen wenn zu', () => {
    mockCtx.mockReturnValue(buildCtx({ isAiModalOpen: false }));

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <AiModal />
      </I18nextProvider>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('Generierung und Auswahl-Artikel ruft handleAiAdd auf', async () => {
    const user = userEvent.setup();
    const handleAiAdd = vi.fn().mockResolvedValue(undefined);
    const setAiModalOpen = vi.fn();
    mockCtx.mockReturnValue(buildCtx({ handleAiAdd, setAiModalOpen }));

    render(
      <I18nextProvider i18n={i18n}>
        <AiModal />
      </I18nextProvider>,
    );

    await user.type(screen.getByRole('textbox'), 'Kuchen backen');
    await user.click(screen.getByRole('button', { name: /Liste erstellen/i }));

    await vi.waitFor(() => {
      expect(generateShoppingList).toHaveBeenCalled();
    });

    expect(screen.getByText('Mehl')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /2 Artikel hinzufuegen/i }));

    expect(handleAiAdd).toHaveBeenCalled();
    expect(setAiModalOpen).toHaveBeenCalledWith(false);
  });

  it('Abbrechen schliesst Modal', async () => {
    const user = userEvent.setup();
    const setAiModalOpen = vi.fn();
    mockCtx.mockReturnValue(buildCtx({ setAiModalOpen }));

    render(
      <I18nextProvider i18n={i18n}>
        <AiModal />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Abbrechen/i }));
    expect(setAiModalOpen).toHaveBeenCalledWith(false);
  });
});
