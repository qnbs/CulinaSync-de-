import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import Header from '../Header';
import i18n from '@/i18n';

describe('Header (Smoke)', () => {
  const setCurrentPage = vi.fn();
  const startListening = vi.fn();
  const stopListening = vi.fn();
  const onCommandPaletteToggle = vi.fn();

  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
  });

  it('wechselt primaere Navigation', async () => {
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={i18n}>
        <Header
          currentPage="pantry"
          setCurrentPage={setCurrentPage}
          isListening={false}
          startListening={startListening}
          stopListening={stopListening}
          hasRecognitionSupport
          onCommandPaletteToggle={onCommandPaletteToggle}
        />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Rezepte/i }));
    expect(setCurrentPage).toHaveBeenCalledWith('recipes');

    await user.click(screen.getByRole('button', { name: /Einstellungen/i }));
    expect(setCurrentPage).toHaveBeenCalledWith('settings');
  });

  it('steuert Mikrofon und Command-Palette', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <Header
          currentPage="pantry"
          setCurrentPage={setCurrentPage}
          isListening={false}
          startListening={startListening}
          stopListening={stopListening}
          hasRecognitionSupport
          onCommandPaletteToggle={onCommandPaletteToggle}
        />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Sprachsteuerung aktivieren/i }));
    expect(startListening).toHaveBeenCalled();

    rerender(
      <I18nextProvider i18n={i18n}>
        <Header
          currentPage="pantry"
          setCurrentPage={setCurrentPage}
          isListening
          startListening={startListening}
          stopListening={stopListening}
          hasRecognitionSupport
          onCommandPaletteToggle={onCommandPaletteToggle}
        />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Sprachsteuerung stoppen/i }));
    expect(stopListening).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Befehlspalette öffnen/i }));
    expect(onCommandPaletteToggle).toHaveBeenCalled();
  });
});
