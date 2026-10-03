import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import i18n from '../../i18n';
import { createTestStore } from '../../test/createTestStore';
import { DemoModeBanner } from '../DemoModeBanner';
import { PAGES_DEMO_BANNER_DISMISSED_KEY } from '../../services/demoSeedService';

const mocks = vi.hoisted(() => ({
  loadDemoPantrySeed: vi.fn(),
  isGitHubPagesHost: vi.fn(),
}));

vi.mock('../../services/demoSeedService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/demoSeedService')>();
  return {
    ...actual,
    isGitHubPagesHost: mocks.isGitHubPagesHost,
    loadDemoPantrySeed: mocks.loadDemoPantrySeed,
  };
});

function renderBanner(store = createTestStore()) {
  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <DemoModeBanner />
      </I18nextProvider>
    </Provider>,
  );
}

describe('DemoModeBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.isGitHubPagesHost.mockReturnValue(true);
    mocks.loadDemoPantrySeed.mockReset();
  });

  it('bleibt aus wenn nicht auf GitHub Pages', () => {
    mocks.isGitHubPagesHost.mockReturnValue(false);
    const { container } = renderBanner();
    expect(container).toBeEmptyDOMElement();
  });

  it('lädt Demo-Daten und dismissed Banner', async () => {
    mocks.loadDemoPantrySeed.mockResolvedValue(3);
    renderBanner();
    fireEvent.click(screen.getByRole('button', { name: 'Demo laden' }));
    await waitFor(() => {
      expect(mocks.loadDemoPantrySeed).toHaveBeenCalled();
    });
    expect(localStorage.getItem(PAGES_DEMO_BANNER_DISMISSED_KEY)).toBe('1');
  });

  it('dismiss ohne Demo-Laden', () => {
    renderBanner();
    fireEvent.click(screen.getByRole('button', { name: 'Hinweis schließen' }));
    expect(localStorage.getItem(PAGES_DEMO_BANNER_DISMISSED_KEY)).toBe('1');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('zeigt Fehler-Toast wenn Demo-Laden scheitert', async () => {
    mocks.loadDemoPantrySeed.mockRejectedValue(new Error('fail'));
    const store = createTestStore();
    renderBanner(store);
    fireEvent.click(screen.getByRole('button', { name: 'Demo laden' }));
    await waitFor(() => {
      expect(store.getState().ui.toasts.length).toBeGreaterThan(0);
    });
  });
});
