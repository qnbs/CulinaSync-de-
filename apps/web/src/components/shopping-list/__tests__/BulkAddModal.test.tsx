import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { BulkAddModal } from '../BulkAddModal';

const mockCtx = vi.fn();

vi.mock('@/contexts/ShoppingListContext', () => ({
  useShoppingListContext: () => mockCtx(),
}));

function buildCtx(overrides: Record<string, unknown> = {}) {
  return {
    isBulkAddModalOpen: true,
    setBulkAddModalOpen: vi.fn(),
    handleBulkAdd: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('BulkAddModal', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
    mockCtx.mockReturnValue(buildCtx());
  });

  it('nicht sichtbar wenn Modal zu', () => {
    mockCtx.mockReturnValue(buildCtx({ isBulkAddModalOpen: false }));

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <BulkAddModal />
      </I18nextProvider>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('Analyse und Uebernahme ruft handleBulkAdd auf', async () => {
    const user = userEvent.setup();
    const handleBulkAdd = vi.fn().mockResolvedValue(undefined);
    const setBulkAddModalOpen = vi.fn();
    mockCtx.mockReturnValue(buildCtx({ handleBulkAdd, setBulkAddModalOpen }));

    render(
      <I18nextProvider i18n={i18n}>
        <BulkAddModal />
      </I18nextProvider>,
    );

    await user.type(
      screen.getByRole('textbox'),
      '2x Milch\n500g Mehl',
    );
    await user.click(screen.getByRole('button', { name: /^Analysieren$/i }));

    expect(screen.getByText(/Milch/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Zur Liste hinzufuegen/i }));

    expect(handleBulkAdd).toHaveBeenCalled();
    expect(setBulkAddModalOpen).toHaveBeenCalledWith(false);
  });

  it('Abbrechen schliesst Modal', async () => {
    const user = userEvent.setup();
    const setBulkAddModalOpen = vi.fn();
    mockCtx.mockReturnValue(buildCtx({ setBulkAddModalOpen }));

    render(
      <I18nextProvider i18n={i18n}>
        <BulkAddModal />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Abbrechen/i }));
    expect(setBulkAddModalOpen).toHaveBeenCalledWith(false);
  });
});
