import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { PantryToolbar } from '../PantryToolbar';

const mockUsePantryManagerContext = vi.fn();

vi.mock('@/contexts/PantryManagerContext', () => ({
  usePantryManagerContext: () => mockUsePantryManagerContext(),
}));

function buildCtx(overrides: Record<string, unknown> = {}) {
  return {
    searchTerm: '',
    setSearchTerm: vi.fn(),
    searchInputRef: { current: null as HTMLInputElement | null },
    expiryFilter: 'all' as const,
    setExpiryFilter: vi.fn(),
    sortOrder: 'name' as const,
    setSortOrder: vi.fn(),
    isGrouped: false,
    setIsGrouped: vi.fn(),
    isSelectMode: false,
    toggleSelectMode: vi.fn(),
    ...overrides,
  };
}

describe('PantryToolbar', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
    mockUsePantryManagerContext.mockReturnValue(buildCtx());
  });

  it('Suchfeld propagiert Eingabe an setSearchTerm', async () => {
    const user = userEvent.setup();
    const setSearchTerm = vi.fn();
    mockUsePantryManagerContext.mockReturnValue(buildCtx({ setSearchTerm }));

    render(
      <I18nextProvider i18n={i18n}>
        <PantryToolbar />
      </I18nextProvider>,
    );

    const search = screen.getByRole('textbox', { name: /Vorrat durchsuchen/i });
    await user.type(search, 'mehl');
    expect(setSearchTerm).toHaveBeenCalled();
  });

  it('X-Button leert Suche', async () => {
    const user = userEvent.setup();
    const setSearchTerm = vi.fn();
    mockUsePantryManagerContext.mockReturnValue(
      buildCtx({ searchTerm: 'test', setSearchTerm }),
    );

    render(
      <I18nextProvider i18n={i18n}>
        <PantryToolbar />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Suche leeren/i }));
    expect(setSearchTerm).toHaveBeenCalledWith('');
  });

  it('Ablauf-Filter und Sortierung', async () => {
    const user = userEvent.setup();
    const setExpiryFilter = vi.fn();
    const setSortOrder = vi.fn();
    mockUsePantryManagerContext.mockReturnValue(
      buildCtx({ setExpiryFilter, setSortOrder }),
    );

    render(
      <I18nextProvider i18n={i18n}>
        <PantryToolbar />
      </I18nextProvider>,
    );

    await user.selectOptions(screen.getByRole('combobox', { name: /Ablaufstatus filtern/i }), 'nearing');
    expect(setExpiryFilter).toHaveBeenCalledWith('nearing');

    await user.selectOptions(screen.getByRole('combobox', { name: /Sortierreihenfolge/i }), 'expiryDate');
    expect(setSortOrder).toHaveBeenCalledWith('expiryDate');
  });

  it('Kategorie-Gruppierung und Auswahlmodus', async () => {
    const user = userEvent.setup();
    const setIsGrouped = vi.fn();
    const toggleSelectMode = vi.fn();
    mockUsePantryManagerContext.mockReturnValue(
      buildCtx({ setIsGrouped, toggleSelectMode }),
    );

    render(
      <I18nextProvider i18n={i18n}>
        <PantryToolbar />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Nach Kategorie gruppieren/i }));
    expect(setIsGrouped).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole('button', { name: /Auswahlmodus umschalten/i }));
    expect(toggleSelectMode).toHaveBeenCalled();
  });

  it('bei aktiver Gruppierung: Aufheben-ARIA', async () => {
    const user = userEvent.setup();
    const setIsGrouped = vi.fn();
    mockUsePantryManagerContext.mockReturnValue(
      buildCtx({ isGrouped: true, setIsGrouped }),
    );

    render(
      <I18nextProvider i18n={i18n}>
        <PantryToolbar />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Gruppierung aufheben/i }));
    expect(setIsGrouped).toHaveBeenCalledWith(false);
  });
});
