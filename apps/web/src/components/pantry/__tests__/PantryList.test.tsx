import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import type { PantryItem } from '@/types';
import { createTestStore } from '@/test/createTestStore';
import { PantryList } from '../PantryList';

vi.mock('@/services/demoSeedService', () => ({
  loadDemoPantrySeed: vi.fn().mockResolvedValue(3),
}));

vi.mock('@/hooks/useWindowSize', () => ({
  useWindowSize: () => ({ width: 900, height: 900 }),
}));

vi.mock('../../PantryListItem', () => ({
  default: ({ item }: { item: PantryItem }) => (
    <div data-testid={`pantry-row-${item.id}`}>{item.name}</div>
  ),
}));

const mockUsePantryManagerContext = vi.fn();

vi.mock('@/contexts/PantryManagerContext', () => ({
  usePantryManagerContext: () => mockUsePantryManagerContext(),
}));

const mk = (id: number, name: string, category: string): PantryItem => ({
  id,
  name,
  quantity: 1,
  unit: 'Stk',
  category,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

function renderPantryList() {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <PantryList />
      </I18nextProvider>
    </Provider>,
  );
}

function baseCtx(overrides: Record<string, unknown> = {}) {
  return {
    groupedItems: null as Record<string, PantryItem[]> | null,
    filteredItems: [] as PantryItem[],
    isGrouped: false,
    pantryItems: [] as PantryItem[],
    isSelectMode: false,
    selectedItems: [] as number[],
    setModalState: vi.fn(),
    adjustQuantity: vi.fn(),
    toggleSelectItem: vi.fn(),
    handleAddToShoppingList: vi.fn(),
    ...overrides,
  };
}

describe('PantryList', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
    mockUsePantryManagerContext.mockReturnValue(baseCtx());
  });

  it('Empty State wenn kein Treffer aber Vorrat vorhanden', () => {
    mockUsePantryManagerContext.mockReturnValue(
      baseCtx({
        filteredItems: [],
        pantryItems: [mk(1, 'X', 'K')],
      }),
    );

    renderPantryList();

    expect(screen.getByText(/Keine Ergebnisse gefunden/i)).toBeInTheDocument();
  });

  it('Empty State wenn Vorrat leer', () => {
    mockUsePantryManagerContext.mockReturnValue(
      baseCtx({
        filteredItems: [],
        pantryItems: [],
      }),
    );

    renderPantryList();

    expect(screen.getByText(/Vorratskammer ist leer|leer/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Demo-Daten laden/i })).toBeInTheDocument();
  });

  it('lädt Demo-Daten aus leerem Empty State', async () => {
    const user = userEvent.setup();
    const { loadDemoPantrySeed } = await import('@/services/demoSeedService');

    mockUsePantryManagerContext.mockReturnValue(
      baseCtx({
        filteredItems: [],
        pantryItems: [],
      }),
    );

    renderPantryList();
    await user.click(screen.getByRole('button', { name: /Demo-Daten laden/i }));

    await waitFor(() => {
      expect(loadDemoPantrySeed).toHaveBeenCalledOnce();
    });
  });

  it('nicht gruppiert: rendert Zeilen fuer filteredItems', () => {
    const a = mk(1, 'Apfel', 'Obst & Gemüse');
    const b = mk(2, 'Birne', 'Obst & Gemüse');
    mockUsePantryManagerContext.mockReturnValue(
      baseCtx({
        filteredItems: [a, b],
        pantryItems: [a, b],
        isGrouped: false,
      }),
    );

    renderPantryList();

    expect(screen.getByTestId('pantry-row-1')).toHaveTextContent('Apfel');
    expect(screen.getByTestId('pantry-row-2')).toHaveTextContent('Birne');
  });

  it('gruppiert: Kategorie-Header und Artikel', () => {
    const a = mk(1, 'Milch', 'Milchprodukte & Eier');
    mockUsePantryManagerContext.mockReturnValue(
      baseCtx({
        filteredItems: [a],
        pantryItems: [a],
        isGrouped: true,
        groupedItems: { 'Milchprodukte & Eier': [a] },
      }),
    );

    renderPantryList();

    expect(screen.getByText(/Milchprodukte|Eier/i)).toBeInTheDocument();
    expect(screen.getByTestId('pantry-row-1')).toBeInTheDocument();
  });
});
