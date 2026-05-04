import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import type { ShoppingListItem } from '@/types';
import { ShoppingListActive } from '../ShoppingListActive';
import { ShoppingListCompleted } from '../ShoppingListCompleted';

const mockUseShoppingListContext = vi.fn();

vi.mock('@/contexts/ShoppingListContext', () => ({
  useShoppingListContext: () => mockUseShoppingListContext(),
}));

const baseItem = (overrides: Partial<ShoppingListItem> = {}): ShoppingListItem => ({
  id: 1,
  name: 'Milch',
  quantity: 1,
  unit: 'l',
  category: 'Milchprodukte & Eier',
  isChecked: false,
  sortOrder: 0,
  ...overrides,
});

function renderWithI18n(ui: ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe('ShoppingListCompleted', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
  });

  it('zeigt Abschnitt und ruft setIsCompletedVisible beim Klick', async () => {
    const user = userEvent.setup();
    const setIsCompletedVisible = vi.fn();
    mockUseShoppingListContext.mockReturnValue({
      completedItems: [baseItem({ id: 2, isChecked: true })],
      isCompletedVisible: false,
      setIsCompletedVisible,
      recipesById: new Map(),
      handleToggle: vi.fn(),
      setEditingItem: vi.fn(),
      deleteItem: vi.fn(),
    });

    renderWithI18n(<ShoppingListCompleted />);

    const btn = screen.getByRole('button', { name: /Erledigt|Completed/i });
    expect(btn).toHaveAttribute('aria-expanded', 'false');

    await user.click(btn);
    expect(setIsCompletedVisible).toHaveBeenCalled();
  });
});

describe('ShoppingListActive', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
    mockUseShoppingListContext.mockReturnValue({
      groupedList: {
        'Milchprodukte & Eier': [baseItem()],
      },
      collapsedCategories: [],
      editingCategory: null,
      setEditingCategory: vi.fn(),
      handleRenameCategory: vi.fn(),
      handleToggleCategoryCollapse: vi.fn(),
      dropTargetInfo: null,
      setDropTargetInfo: vi.fn(),
      onCategoryDrop: vi.fn(),
      onDragEnd: vi.fn(),
      editingItem: null,
      setEditingItem: vi.fn(),
      recipesById: new Map(),
      handleToggle: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDrop: vi.fn(),
      draggedItem: null,
      isShoppingMode: false,
    });
  });

  it('rendert Kategorie und Artikel', () => {
    renderWithI18n(<ShoppingListActive />);
    expect(screen.getByText(/Milchprodukte|Eier/i)).toBeInTheDocument();
    expect(screen.getByText('Milch')).toBeInTheDocument();
  });

  it('klappt Kategorie per Klick zu', async () => {
    const user = userEvent.setup();
    const handleToggleCategoryCollapse = vi.fn();
    mockUseShoppingListContext.mockReturnValue({
      groupedList: {
        'Milchprodukte & Eier': [baseItem()],
      },
      collapsedCategories: [],
      editingCategory: null,
      setEditingCategory: vi.fn(),
      handleRenameCategory: vi.fn(),
      handleToggleCategoryCollapse,
      dropTargetInfo: null,
      setDropTargetInfo: vi.fn(),
      onCategoryDrop: vi.fn(),
      onDragEnd: vi.fn(),
      editingItem: null,
      setEditingItem: vi.fn(),
      recipesById: new Map(),
      handleToggle: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDrop: vi.fn(),
      draggedItem: null,
      isShoppingMode: false,
    });

    renderWithI18n(<ShoppingListActive />);
    await user.click(screen.getByRole('heading', { level: 3 }));
    expect(handleToggleCategoryCollapse).toHaveBeenCalledWith('Milchprodukte & Eier');
  });
});
