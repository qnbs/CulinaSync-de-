import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import App from './App';
import i18n from './i18n';
import { createTestStore } from './test/createTestStore';

vi.mock('./hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    finalTranscript: '',
    interimTranscript: '',
    startListening: vi.fn(),
    stopListening: vi.fn(),
    isListening: false,
    hasRecognitionSupport: true,
    error: null,
  }),
}));

vi.mock('./components/PantryManager', () => ({ __esModule: true, default: () => <div data-testid="page-pantry" /> }));
vi.mock('./components/AiChef', () => ({ __esModule: true, default: () => <div data-testid="page-chef" /> }));
vi.mock('./components/RecipeBook', () => ({ __esModule: true, default: () => <div data-testid="page-recipes" /> }));
vi.mock('./components/MealPlanner', () => ({ __esModule: true, default: () => <div data-testid="page-planner" /> }));
vi.mock('./components/ShoppingList', () => ({ __esModule: true, default: () => <div data-testid="page-shopping" /> }));
vi.mock('./components/Settings', () => ({ __esModule: true, default: () => <div data-testid="page-settings" /> }));
vi.mock('./components/Help', () => ({ __esModule: true, default: () => <div data-testid="page-help" /> }));
vi.mock('./components/BottomNav', () => ({ __esModule: true, default: () => <div data-testid="bottom-nav" /> }));
vi.mock('./components/Onboarding', () => ({ __esModule: true, default: () => <div data-testid="onboarding" /> }));
vi.mock('./components/VoiceControlUI', () => ({ __esModule: true, default: () => <div data-testid="voice-ui" /> }));
vi.mock('./components/CommandPalette', () => ({
  CommandPalette: () => <div data-testid="command-palette" />,
}));

vi.mock('./services/db', () => ({}));

const uiBase = {
  currentPage: 'pantry' as const,
  toasts: [] as { id: string; message: string; type: 'success' | 'error' | 'info' }[],
  focusAction: null as string | null,
  initialSelectedId: null as number | null,
  voiceAction: null as { type: string; payload: string } | null,
};

describe('App (Smoke)', () => {
  beforeEach(() => {
    window.localStorage.setItem('culinaSyncOnboarded', 'true');
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    });
  });

  it('rendert Skip-Link und Hauptbereich', async () => {
    render(
      <Provider store={createTestStore()}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>,
    );

    expect(await screen.findByRole('link', { name: /Zum Inhalt|Skip to content/i })).toBeInTheDocument();
    expect(document.getElementById('main-content')).toBeTruthy();
  });

  it('renderiert Stub-Seite entsprechend currentPage', async () => {
    const store = createTestStore({
      ui: { ...uiBase, currentPage: 'meal-planner' },
    });

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>,
    );

    expect(await screen.findByTestId('page-planner')).toBeInTheDocument();
  });

  it('zeigt Toast-Nachricht aus dem Store', async () => {
    const store = createTestStore({
      ui: {
        ...uiBase,
        toasts: [{ id: 't1', message: 'Smoke-Toast', type: 'success' }],
      },
    });

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>,
    );

    expect(await screen.findByText('Smoke-Toast')).toBeInTheDocument();
  });

  it('Footer zeigt Versionshinweis', async () => {
    render(
      <Provider store={createTestStore()}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>,
    );

    const footer = document.querySelector('footer');
    expect(footer).toBeTruthy();
    expect(footer?.textContent).toMatch(/v0\.0\.0-test|v[\d.]+/);
  });
});
