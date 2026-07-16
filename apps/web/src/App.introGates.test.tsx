import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import App from './App';
import i18n from './i18n';
import { createTestStore } from './test/createTestStore';

// Force the intro gates ON to exercise the flag's truthy branches (onboarding /
// What's-New / demo banner) — the App.smoke suite covers the default path.
vi.mock('./config/featureFlags', () => ({ INTRO_GATES_ENABLED: true }));

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
vi.mock('./components/CommandPalette', () => ({ CommandPalette: () => <div data-testid="command-palette" /> }));
vi.mock('./components/WhatsNewModal', () => ({ WhatsNewModal: () => <div data-testid="whats-new" /> }));
vi.mock('./components/DemoModeBanner', () => ({ DemoModeBanner: () => <div data-testid="demo-banner" /> }));

vi.mock('./services/db', () => ({}));

describe('App intro gates (INTRO_GATES_ENABLED = true)', () => {
  beforeEach(() => {
    window.localStorage.removeItem('culinaSyncOnboarded');
    window.localStorage.removeItem('culinasync_version');
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

  it('shows onboarding without stacking What\'s-New on first run', async () => {
    render(
      <Provider store={createTestStore()}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>,
    );

    expect(await screen.findByTestId('onboarding')).toBeInTheDocument();
    expect(screen.queryByTestId('whats-new')).not.toBeInTheDocument();
    expect(screen.getByTestId('demo-banner')).toBeInTheDocument();
  });

  it('shows What\'s-New after onboarding is completed', async () => {
    window.localStorage.setItem('culinaSyncOnboarded', 'true');
    // Force What's New open by mismatching version key
    window.localStorage.setItem('culinasync_version', '0.0.0-old');

    render(
      <Provider store={createTestStore()}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>,
    );

    expect(screen.queryByTestId('onboarding')).not.toBeInTheDocument();
    expect(await screen.findByTestId('whats-new')).toBeInTheDocument();
  });
});
