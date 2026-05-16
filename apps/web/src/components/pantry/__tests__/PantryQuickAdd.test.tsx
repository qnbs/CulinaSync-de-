import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { PantryQuickAdd } from '../PantryQuickAdd';

const mockUsePantryManagerContext = vi.fn();

vi.mock('@/contexts/PantryManagerContext', () => ({
  usePantryManagerContext: () => mockUsePantryManagerContext(),
}));

const extractPantryItemsFromImage = vi.fn().mockResolvedValue('Erkannt: 2 kg Kartoffeln');
const recognizeTextFromImage = vi.fn().mockResolvedValue('OCR Fallback Text');

// QNBS-v3: Gemini/OCR-Pfade ohne Netzwerk — gleiches Muster wie ShoppingListQuickAdd
vi.mock('@/services/serviceRegistry', () => ({
  getAppServices: () => ({
    ai: {
      extractPantryItemsFromImage,
      generateRecipeIdeas: vi.fn(),
      generateRecipe: vi.fn(),
      generateShoppingList: vi.fn(),
      generateRecipeImage: vi.fn(),
    },
    scanner: {
      recognizeTextFromImage,
      scanBarcodeFromImage: vi.fn(),
    },
    whisper: {
      transcribeWithWhisper: vi.fn(),
      initWhisper: vi.fn(),
    },
  }),
}));

describe('PantryQuickAdd', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
    extractPantryItemsFromImage.mockResolvedValue('Erkannt: 2 kg Kartoffeln');
    recognizeTextFromImage.mockResolvedValue('OCR Fallback Text');
    mockUsePantryManagerContext.mockReturnValue({
      handleQuickAdd: vi.fn(),
    });
  });

  it('Submit mit Text ruft handleQuickAdd auf und leert Eingabe', async () => {
    const user = userEvent.setup();
    const handleQuickAdd = vi.fn();
    mockUsePantryManagerContext.mockReturnValue({ handleQuickAdd });

    render(
      <I18nextProvider i18n={i18n}>
        <PantryQuickAdd />
      </I18nextProvider>,
    );

    const input = screen.getByRole('textbox', { name: /Schnellzugabe fuer Vorrat/i });
    await user.type(input, '500g Reis');
    await user.click(screen.getByRole('button', { name: /Zum Vorrat hinzufuegen/i }));

    expect(handleQuickAdd).toHaveBeenCalledWith('500g Reis');
    expect(input).toHaveValue('');
  });

  it('leerer Submit sendet nichts', async () => {
    const user = userEvent.setup();
    const handleQuickAdd = vi.fn();
    mockUsePantryManagerContext.mockReturnValue({ handleQuickAdd });

    render(
      <I18nextProvider i18n={i18n}>
        <PantryQuickAdd />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Zum Vorrat hinzufuegen/i }));
    expect(handleQuickAdd).not.toHaveBeenCalled();
  });

  it('Foto: Vision-Text landet im Input', async () => {
    const user = userEvent.setup();

    render(
      <I18nextProvider i18n={i18n}>
        <PantryQuickAdd />
      </I18nextProvider>,
    );

    const file = new File(['x'], 'pantry.jpg', { type: 'image/jpeg' });
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    await user.upload(fileInput, file);

    await vi.waitFor(() => {
      expect(extractPantryItemsFromImage).toHaveBeenCalled();
    });

    expect(screen.getByRole('textbox', { name: /Schnellzugabe fuer Vorrat/i })).toHaveValue(
      'Erkannt: 2 kg Kartoffeln',
    );
  });

  it('Foto: Vision-Fehler nutzt OCR-Fallback', async () => {
    const user = userEvent.setup();
    extractPantryItemsFromImage.mockRejectedValueOnce(new Error('vision'));

    render(
      <I18nextProvider i18n={i18n}>
        <PantryQuickAdd />
      </I18nextProvider>,
    );

    const file = new File(['y'], 'p.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    await vi.waitFor(() => {
      expect(recognizeTextFromImage).toHaveBeenCalled();
    });

    expect(screen.getByRole('textbox', { name: /Schnellzugabe fuer Vorrat/i })).toHaveValue(
      'OCR Fallback Text',
    );
  });
});
