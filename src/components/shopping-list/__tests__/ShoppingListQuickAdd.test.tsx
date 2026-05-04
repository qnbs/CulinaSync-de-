import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormEvent } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import type { ShoppingListItem } from '@/types';
import { ShoppingListQuickAdd } from '../ShoppingListQuickAdd';

const mockUseShoppingListContext = vi.fn();

vi.mock('@/contexts/ShoppingListContext', () => ({
  useShoppingListContext: () => mockUseShoppingListContext(),
}));

const scanBarcodeFromImage = vi.fn().mockResolvedValue('1234567890123');
const recognizeTextFromImage = vi.fn().mockResolvedValue('Milch 1 l');

vi.mock('@/services/serviceRegistry', () => ({
  getAppServices: () => ({
    scanner: {
      scanBarcodeFromImage,
      recognizeTextFromImage,
    },
    ai: {
      generateRecipeIdeas: vi.fn(),
      generateRecipe: vi.fn(),
      generateShoppingList: vi.fn(),
      generateRecipeImage: vi.fn(),
      extractPantryItemsFromImage: vi.fn(),
    },
    whisper: {
      transcribeWithWhisper: vi.fn(),
      initWhisper: vi.fn(),
    },
  }),
}));

vi.mock('@/services/smartInputService', () => ({
  lookupBarcodeItemName: vi.fn(() => 'Lookup Name'),
  parseReceiptTextToShoppingItems: vi.fn(() => [
    { name: 'Reis', quantity: 1, unit: 'kg' },
  ]),
}));

function buildCtx(overrides: Record<string, unknown> = {}) {
  const handleQuickAdd = vi.fn((e: FormEvent) => {
    e.preventDefault();
  });
  const handleBulkAdd = vi.fn().mockResolvedValue(undefined);
  const {
    handleQuickAdd: overrideQuick,
    handleBulkAdd: overrideBulk,
    ...rest
  } = overrides;
  return {
    completedItems: [] as ShoppingListItem[],
    handleMoveToPantry: vi.fn(),
    quickAddItem: '',
    setQuickAddItem: vi.fn(),
    addItemInputRef: { current: null as HTMLInputElement | null },
    isShoppingMode: false,
    handleQuickAdd: (overrideQuick as typeof handleQuickAdd | undefined) ?? handleQuickAdd,
    handleBulkAdd: (overrideBulk as typeof handleBulkAdd | undefined) ?? handleBulkAdd,
    ...rest,
  };
}

describe('ShoppingListQuickAdd', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
    scanBarcodeFromImage.mockResolvedValue('1234567890123');
    recognizeTextFromImage.mockResolvedValue('Milch 1 l');
    mockUseShoppingListContext.mockReturnValue(buildCtx());
  });

  it('rendert nichts im Einkaufsmodus ohne erledigte Artikel', () => {
    mockUseShoppingListContext.mockReturnValue(
      buildCtx({ isShoppingMode: true, completedItems: [] }),
    );

    render(
      <I18nextProvider i18n={i18n}>
        <ShoppingListQuickAdd />
      </I18nextProvider>,
    );

    expect(screen.queryByPlaceholderText(/Schnell hinzufügen|Schnell hinzufuegen/i)).not.toBeInTheDocument();
  });

  it('zeigt Vorrat-Button im Einkaufsmodus mit erledigten Artikeln', async () => {
    const user = userEvent.setup();
    const handleMoveToPantry = vi.fn();
    const done: ShoppingListItem = {
      id: 2,
      name: 'Brot',
      quantity: 1,
      unit: 'Stk',
      category: 'B',
      isChecked: true,
      sortOrder: 1,
    };
    mockUseShoppingListContext.mockReturnValue(
      buildCtx({
        isShoppingMode: true,
        completedItems: [done],
        handleMoveToPantry,
      }),
    );

    render(
      <I18nextProvider i18n={i18n}>
        <ShoppingListQuickAdd />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /1 erledigt.*In Vorrat verschieben/i }));
    expect(handleMoveToPantry).toHaveBeenCalled();
  });

  it('Submit mit Text ruft handleQuickAdd auf', async () => {
    const user = userEvent.setup();
    const handleQuickAdd = vi.fn((e: FormEvent) => e.preventDefault());
    mockUseShoppingListContext.mockReturnValue(
      buildCtx({ quickAddItem: 'Honig', handleQuickAdd }),
    );

    render(
      <I18nextProvider i18n={i18n}>
        <ShoppingListQuickAdd />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Artikel hinzufuegen/i }));
    expect(handleQuickAdd).toHaveBeenCalled();
  });

  it('Barcode-Scan setzt QuickAdd-Text via Scanner', async () => {
    const user = userEvent.setup();
    const setQuickAddItem = vi.fn();
    mockUseShoppingListContext.mockReturnValue(buildCtx({ setQuickAddItem }));

    render(
      <I18nextProvider i18n={i18n}>
        <ShoppingListQuickAdd />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Kamera-Scan oeffnen/i }));
    await user.click(screen.getByRole('button', { name: /Barcode per Kamera/i }));

    const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const file = new File(['x'], 'bar.png', { type: 'image/png' });
    await user.upload(fileInput, file);

    await vi.waitFor(() => {
      expect(scanBarcodeFromImage).toHaveBeenCalled();
    });
    expect(setQuickAddItem).toHaveBeenCalled();
  });

  it('Kassenbon ruft handleBulkAdd auf', async () => {
    const user = userEvent.setup();
    const handleBulkAdd = vi.fn().mockResolvedValue(undefined);
    mockUseShoppingListContext.mockReturnValue(buildCtx({ handleBulkAdd }));

    render(
      <I18nextProvider i18n={i18n}>
        <ShoppingListQuickAdd />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Kamera-Scan oeffnen/i }));
    const receiptBtn = screen.getByRole('button', { name: /Rechnung per OCR/i });
    await user.click(receiptBtn);

    const inputs = document.querySelectorAll('input[type="file"][accept="image/*"]');
    const receiptInput = inputs[inputs.length - 1] as HTMLInputElement;
    const file = new File(['y'], 'rec.jpg', { type: 'image/jpeg' });
    await user.upload(receiptInput, file);

    await vi.waitFor(() => {
      expect(handleBulkAdd).toHaveBeenCalled();
    });
  });
});
