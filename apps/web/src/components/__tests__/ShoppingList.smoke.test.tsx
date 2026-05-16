import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import ShoppingList from '@/components/ShoppingList';
import i18n from '@/i18n';
import { createTestStore } from '@/test/createTestStore';
import { createShoppingListSmokeStub } from './smokeHookStubs';

vi.mock('@/hooks/useShoppingList', () => ({
  useShoppingList: vi.fn(),
}));

vi.mock('@/hooks/useWakeLock', () => ({
  useWakeLock: () => [false, vi.fn().mockResolvedValue(undefined), vi.fn().mockResolvedValue(undefined)],
}));

describe('ShoppingList (Smoke)', () => {
  beforeEach(async () => {
    const { useShoppingList } = await import('@/hooks/useShoppingList');
    vi.mocked(useShoppingList).mockReturnValue(createShoppingListSmokeStub() as ReturnType<typeof useShoppingList>);
  });

  it('rendert Listen-Header', () => {
    render(
      <Provider store={createTestStore()}>
        <I18nextProvider i18n={i18n}>
          <ShoppingList />
        </I18nextProvider>
      </Provider>,
    );

    expect(screen.getByRole('heading', { level: 2, name: /Einkaufsliste|Shopping/i })).toBeInTheDocument();
  });
});
