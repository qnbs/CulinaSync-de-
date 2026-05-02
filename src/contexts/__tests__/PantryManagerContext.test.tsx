import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PantryManagerProvider, usePantryManagerContext } from '../PantryManagerContext';

const stub = {
  items: [] as { id?: number; name: string }[],
  setSearchQuery: vi.fn(),
};

vi.mock('../../hooks/usePantryManager', () => ({
  usePantryManager: () => stub,
}));

function Consumer() {
  const ctx = usePantryManagerContext();
  return <span data-testid="items-count">{ctx.items.length}</span>;
}

describe('PantryManagerContext', () => {
  it('wirft ohne Provider', () => {
    expect(() => render(<Consumer />)).toThrow(/PantryManagerProvider/);
  });

  it('stellt usePantryManager-Wert bereit', () => {
    render(
      <PantryManagerProvider>
        <Consumer />
      </PantryManagerProvider>,
    );
    expect(screen.getByTestId('items-count')).toHaveTextContent('0');
  });
});
