import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShoppingListProvider, useShoppingListContext } from '../ShoppingListContext';

const stub = {
  shoppingList: [] as import('@/types').ShoppingListItem[],
  activeItems: [] as import('@/types').ShoppingListItem[],
};

vi.mock('../../hooks/useShoppingList', () => ({
  useShoppingList: () => stub,
}));

function Consumer() {
  const ctx = useShoppingListContext();
  return (
    <span data-testid="len">
      {ctx.shoppingList.length},{ctx.activeItems.length}
    </span>
  );
}

describe('ShoppingListContext', () => {
  it('wirft ohne Provider', () => {
    expect(() => render(<Consumer />)).toThrow(/ShoppingListProvider/);
  });

  it('stellt useShoppingList bereit', () => {
    render(
      <ShoppingListProvider>
        <Consumer />
      </ShoppingListProvider>,
    );
    expect(screen.getByTestId('len')).toHaveTextContent('0,0');
  });
});
