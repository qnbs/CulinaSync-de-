import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import PantryManager from '@/components/PantryManager';
import i18n from '@/i18n';
import { createTestStore } from '@/test/createTestStore';
import { createPantryManagerSmokeStub } from './smokeHookStubs';

vi.mock('@/hooks/usePantryManager', () => ({
  usePantryManager: vi.fn(),
}));

vi.mock('@/components/PantryListItem', () => ({
  __esModule: true,
  default: ({ item }: { item: { id?: number; name: string } }) => <div data-testid={`item-${item.id}`}>{item.name}</div>,
  getExpiryStatus: vi.fn(() => 'all'),
}));

describe('PantryManager (Smoke)', () => {
  beforeEach(async () => {
    const { usePantryManager } = await import('@/hooks/usePantryManager');
    vi.mocked(usePantryManager).mockReturnValue(createPantryManagerSmokeStub() as ReturnType<typeof usePantryManager>);
  });

  it('rendert Vorrat-Header', () => {
    render(
      <Provider store={createTestStore()}>
        <I18nextProvider i18n={i18n}>
          <PantryManager />
        </I18nextProvider>
      </Provider>,
    );

    expect(screen.getByRole('heading', { level: 2, name: /Vorratskammer|Pantry/i })).toBeInTheDocument();
  });
});
