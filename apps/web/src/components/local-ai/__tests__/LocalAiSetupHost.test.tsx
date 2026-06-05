import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { createTestStore } from '@/test/createTestStore';
import { getDefaultSettings } from '@/services/settingsMerge';
import { useTransientUiStore } from '@/store/transientUiStore';
import { LocalAiSetupHost } from '../LocalAiSetupHost';

vi.mock('@domain/ai-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@domain/ai-core')>();
  return {
    ...actual,
    detectGpuTier: vi.fn().mockResolvedValue({ tier: 'high', webGpuAvailable: true }),
  };
});

vi.mock('@/services/localAiEmbeddingsService', () => ({
  reindexAllEmbeddings: vi.fn().mockResolvedValue(undefined),
}));

describe('LocalAiSetupHost', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    useTransientUiStore.setState({ localAiSetupRequested: false });
  });

  it('oeffnet Assistent auf AI-Chef-Seite wenn Setup offen', async () => {
    const settings = {
      ...getDefaultSettings(),
      localAi: { ...getDefaultSettings().localAi, setupWizardCompleted: false },
    };

    const store = createTestStore({
      settings,
      ui: {
        currentPage: 'chef',
        toasts: [],
        voiceAction: null,
        focusAction: null,
        initialSelectedId: null,
      },
    });

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <LocalAiSetupHost />
        </I18nextProvider>
      </Provider>,
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Lokale KI einrichten/i)).toBeInTheDocument();
  });

  it('oeffnet Assistent bei expliziter Anfrage aus Einstellungen', async () => {
    const settings = {
      ...getDefaultSettings(),
      localAi: { ...getDefaultSettings().localAi, setupWizardCompleted: false },
    };

    const store = createTestStore({
      settings,
      ui: {
        currentPage: 'settings',
        toasts: [],
        voiceAction: null,
        focusAction: null,
        initialSelectedId: null,
      },
    });

    useTransientUiStore.getState().requestLocalAiSetup();

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <LocalAiSetupHost />
        </I18nextProvider>
      </Provider>,
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('bleibt geschlossen nach abgeschlossenem Setup', () => {
    const settings = {
      ...getDefaultSettings(),
      localAi: { ...getDefaultSettings().localAi, setupWizardCompleted: true },
    };

    const store = createTestStore({
      settings,
      ui: {
        currentPage: 'chef',
        toasts: [],
        voiceAction: null,
        focusAction: null,
        initialSelectedId: null,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <LocalAiSetupHost />
        </I18nextProvider>
      </Provider>,
    );

    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});
