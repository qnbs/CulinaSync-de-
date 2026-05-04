import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import type { ShoppingListItem } from '@/types';
import { ShoppingListItemComponent } from '../ShoppingListItemComponent';

const makeItem = (o: Partial<ShoppingListItem> = {}): ShoppingListItem => ({
  id: 1,
  name: 'Milch',
  quantity: 2,
  unit: 'l',
  category: 'Kühlung',
  isChecked: false,
  sortOrder: 0,
  ...o,
});

const baseHandlers = () => ({
  onToggle: vi.fn(),
  onStartEdit: vi.fn(),
  onCancelEdit: vi.fn(),
  onSaveEdit: vi.fn(),
  setEditingItem: vi.fn(),
  onDeleteItem: vi.fn(),
  onDragStart: vi.fn(),
  onDragOver: vi.fn(),
  onDragLeave: vi.fn(),
  onDrop: vi.fn(),
  onDragEnd: vi.fn(),
});

type ItemProps = ComponentProps<typeof ShoppingListItemComponent>;

function renderItem(overrides: Partial<ItemProps> = {}) {
  const h = baseHandlers();
  const shoppingItem = overrides.item ?? makeItem();
  const rest: Partial<ItemProps> = { ...overrides };
  delete rest.item;
  const props: ItemProps = {
    isEditing: false,
    editingItem: null,
    recipeName: null,
    isDragged: false,
    dropTargetId: null,
    isShoppingMode: false,
    ...h,
    ...rest,
    item: shoppingItem,
  };

  return {
    ...render(
      <I18nextProvider i18n={i18n}>
        <ul>
          <ShoppingListItemComponent {...props} />
        </ul>
      </I18nextProvider>,
    ),
    h,
    it: shoppingItem,
  };
}

describe('ShoppingListItemComponent', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
  });

  it('ruft onToggle beim Klick auf Checkbox und auf Zeile auf', async () => {
    const user = userEvent.setup();
    const { h, it } = renderItem();

    const toggleButtons = screen.getAllByRole('button');
    await user.click(toggleButtons[0]);
    expect(h.onToggle).toHaveBeenCalledWith(it);

    vi.mocked(h.onToggle).mockClear();
    await user.click(screen.getByText('Milch'));
    expect(h.onToggle).toHaveBeenCalledWith(it);
  });

  it('zeigt Rezeptreferenz wenn recipeName gesetzt', () => {
    renderItem({ recipeName: 'Pfannkuchen' });
    expect(screen.getByText(/Pfannkuchen/i)).toBeInTheDocument();
  });

  it('Edit und Delete rufen Handler auf', async () => {
    const user = userEvent.setup();
    const { h, it } = renderItem();

    await user.click(screen.getByRole('button', { name: /Milch bearbeiten/i }));
    expect(h.onStartEdit).toHaveBeenCalledWith(it);

    await user.click(screen.getByRole('button', { name: /Milch loe?schen/i }));
    expect(h.onDeleteItem).toHaveBeenCalledWith(1);
  });

  it('Bearbeitungsmodus: Speichern und Abbrechen', async () => {
    const user = userEvent.setup();
    const it0 = makeItem();
    const editing = { ...it0, name: 'X' };
    const setEditingItem = vi.fn();
    const onSaveEdit = vi.fn();
    const onCancelEdit = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <ul>
          <ShoppingListItemComponent
            item={it0}
            isEditing
            editingItem={editing}
            recipeName={null}
            isDragged={false}
            dropTargetId={null}
            onToggle={vi.fn()}
            onStartEdit={vi.fn()}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
            setEditingItem={setEditingItem}
            onDeleteItem={vi.fn()}
            onDragStart={vi.fn()}
            onDragOver={vi.fn()}
            onDragLeave={vi.fn()}
            onDrop={vi.fn()}
            onDragEnd={vi.fn()}
          />
        </ul>
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /aenderungen speichern|speichern/i }));
    expect(onSaveEdit).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /bearbeitung abbrechen|abbrechen/i }));
    expect(onCancelEdit).toHaveBeenCalled();
  });

  it('Shopping-Modus: kein Drag', () => {
    const { container } = renderItem({ isShoppingMode: true });
    const li = container.querySelector('li');
    expect(li).toHaveAttribute('draggable', 'false');
  });

  it('Drag-Events werden weitergegeben', () => {
    const { h, container } = renderItem();
    const li = container.querySelector('li');
    expect(li).toBeTruthy();
    const dt = { setData: vi.fn(), effectAllowed: '' };

    fireEvent.dragStart(li!, { dataTransfer: dt });
    expect(h.onDragStart).toHaveBeenCalled();

    fireEvent.dragOver(li!, { dataTransfer: dt });
    expect(h.onDragOver).toHaveBeenCalled();

    fireEvent.dragLeave(li!);
    expect(h.onDragLeave).toHaveBeenCalled();

    fireEvent.drop(li!);
    expect(h.onDrop).toHaveBeenCalled();

    fireEvent.dragEnd(li!);
    expect(h.onDragEnd).toHaveBeenCalled();
  });

  it('Drop-Ziel: Markierung wenn dropTargetId passt', () => {
    const { container } = renderItem({ dropTargetId: 1 });
    const li = container.querySelector('li');
    expect(li?.querySelector('.absolute')).toBeTruthy();
  });
});
