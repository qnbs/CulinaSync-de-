import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import type { ShoppingListItem } from '@/types';
import { ShoppingListToolbar } from '../ShoppingListToolbar';

const mockUseShoppingListContext = vi.fn();

vi.mock('@/contexts/ShoppingListContext', () => ({
  useShoppingListContext: () => mockUseShoppingListContext(),
}));

const sampleItem: ShoppingListItem = {
  id: 1,
  name: 'X',
  quantity: 1,
  unit: 'Stk',
  category: 'C',
  isChecked: false,
  sortOrder: 0,
};

function buildCtx(overrides: Record<string, unknown> = {}) {
  return {
    shoppingList: [sampleItem] as ShoppingListItem[],
    isExportOpen: false,
    setExportOpen: vi.fn(),
    handleExport: vi.fn(),
    handleClearList: vi.fn(),
    setAiModalOpen: vi.fn(),
    setBulkAddModalOpen: vi.fn(),
    handleGenerateFromPlan: vi.fn(),
    isGenerating: false,
    expandAll: vi.fn(),
    collapseAll: vi.fn(),
    ...overrides,
  };
}

describe('ShoppingListToolbar', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
    mockUseShoppingListContext.mockReturnValue(buildCtx());
  });

  it('Expand / Collapse rufen Kontext-Handler auf', async () => {
    const user = userEvent.setup();
    const expandAll = vi.fn();
    const collapseAll = vi.fn();
    mockUseShoppingListContext.mockReturnValue(buildCtx({ expandAll, collapseAll }));

    render(
      <I18nextProvider i18n={i18n}>
        <ShoppingListToolbar />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Alle Kategorien ausklappen/i }));
    expect(expandAll).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Alle Kategorien einklappen/i }));
    expect(collapseAll).toHaveBeenCalled();
  });

  it('Wochenplan-Button ruft handleGenerateFromPlan auf', async () => {
    const user = userEvent.setup();
    const handleGenerateFromPlan = vi.fn();
    mockUseShoppingListContext.mockReturnValue(buildCtx({ handleGenerateFromPlan }));

    render(
      <I18nextProvider i18n={i18n}>
        <ShoppingListToolbar />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Aus Plan generieren/i }));
    expect(handleGenerateFromPlan).toHaveBeenCalled();
  });

  it('oeffnet Bulk- und KI-Modal-Setter', async () => {
    const user = userEvent.setup();
    const setBulkAddModalOpen = vi.fn();
    const setAiModalOpen = vi.fn();
    mockUseShoppingListContext.mockReturnValue(buildCtx({ setBulkAddModalOpen, setAiModalOpen }));

    render(
      <I18nextProvider i18n={i18n}>
        <ShoppingListToolbar />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Liste einfuegen/i }));
    expect(setBulkAddModalOpen).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole('button', { name: /KI-Liste/i }));
    expect(setAiModalOpen).toHaveBeenCalledWith(true);
  });

  it('Export-Menue: CSV ruft handleExport auf', async () => {
    const user = userEvent.setup();
    const handleExport = vi.fn();
    mockUseShoppingListContext.mockReturnValue(
      buildCtx({ isExportOpen: true, handleExport }),
    );

    render(
      <I18nextProvider i18n={i18n}>
        <ShoppingListToolbar />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('menuitem', { name: /CSV \(\.csv\)/i }));
    expect(handleExport).toHaveBeenCalledWith('csv');
  });

  it('Liste leeren bei nicht-leerer Liste', async () => {
    const user = userEvent.setup();
    const handleClearList = vi.fn();
    mockUseShoppingListContext.mockReturnValue(buildCtx({ handleClearList }));

    render(
      <I18nextProvider i18n={i18n}>
        <ShoppingListToolbar />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Leeren/i }));
    expect(handleClearList).toHaveBeenCalled();
  });

  it('Liste leeren ist deaktiviert wenn shoppingList leer', () => {
    mockUseShoppingListContext.mockReturnValue(buildCtx({ shoppingList: [] }));

    render(
      <I18nextProvider i18n={i18n}>
        <ShoppingListToolbar />
      </I18nextProvider>,
    );

    expect(screen.getByRole('button', { name: /Leeren/i })).toBeDisabled();
  });
});
