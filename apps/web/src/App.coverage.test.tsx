import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import App from './App';
import i18n from './i18n';
import { createTestStore } from './test/createTestStore';
import { getDefaultSettings } from './services/settingsService';

const pwaMocks = vi.hoisted(() => ({
  showInstallDialog: false,
  showUpdateReadyNotice: false,
  handleInstallPWA: vi.fn(),
  handleInstallRemindLater: vi.fn(),
  handleInstallDismiss: vi.fn(),
  handleReloadForUpdate: vi.fn(),
  dismissUpdateNotice: vi.fn(),
}));

const speechMocks = vi.hoisted(() => ({
  finalTranscript: '',
  interimTranscript: '',
  startListening: vi.fn(),
  stopListening: vi.fn(),
  isListening: false,
  hasRecognitionSupport: true,
  error: null as string | null,
}));

let onlineStatus = true;

vi.mock('./hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => onlineStatus,
}));

vi.mock('./hooks/usePwaInstall', () => ({
  usePwaInstall: () => ({
    installPromptEvent: {},
    isStandalone: false,
    isIos: false,
    showInstallDialog: pwaMocks.showInstallDialog,
    handleInstallPWA: pwaMocks.handleInstallPWA,
    handleInstallRemindLater: pwaMocks.handleInstallRemindLater,
    handleInstallDismiss: pwaMocks.handleInstallDismiss,
  }),
}));

vi.mock('./hooks/usePwaUpdate', () => ({
  usePwaUpdate: () => ({
    showUpdateReadyNotice: pwaMocks.showUpdateReadyNotice,
    handleReloadForUpdate: pwaMocks.handleReloadForUpdate,
    dismissUpdateNotice: pwaMocks.dismissUpdateNotice,
  }),
}));

vi.mock('./hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => speechMocks,
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
  CommandPalette: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="command-palette-open" /> : null,
}));

vi.mock('./services/db', () => ({}));
vi.mock('./config/featureFlags', () => ({ INTRO_GATES_ENABLED: false }));
vi.mock('./components/WhatsNewModal', () => ({ WhatsNewModal: () => null }));
vi.mock('./components/local-ai/LocalAiSetupHost', () => ({ LocalAiSetupHost: () => null }));

const uiBase = {
  currentPage: 'pantry' as const,
  toasts: [] as { id: string; message: string; type: 'success' | 'error' | 'info' }[],
  focusAction: null as string | null,
  initialSelectedId: null as number | null,
  voiceAction: null as { type: string; payload: string } | null,
};

describe('App (coverage branches)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onlineStatus = true;
    pwaMocks.showInstallDialog = false;
    pwaMocks.showUpdateReadyNotice = false;
    speechMocks.finalTranscript = '';
    speechMocks.error = null;
    window.localStorage.setItem('culinaSyncOnboarded', 'true');
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    Object.defineProperty(window, 'scrollTo', { writable: true, value: vi.fn() });
  });

  const renderApp = (store = createTestStore()) =>
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>,
    );

  it('zeigt PWA-Install-Dialog wenn Hook es signalisiert', async () => {
    pwaMocks.showInstallDialog = true;
    renderApp();
    expect(await screen.findByText('CulinaSync auf dem Startbildschirm')).toBeInTheDocument();
  });

  it('zeigt PWA-Update-Dialog wenn Hook es signalisiert', async () => {
    pwaMocks.showUpdateReadyNotice = true;
    renderApp();
    expect(await screen.findByRole('dialog', { name: /update|Update/i })).toBeInTheDocument();
  });

  it('zeigt Speech-Error als Toast', async () => {
    speechMocks.error = 'Mikrofon blockiert';
    renderApp();
    expect(await screen.findByText('Mikrofon blockiert')).toBeInTheDocument();
  });

  it('wendet Appearance-Klassen auf documentElement an', async () => {
    const defaults = getDefaultSettings();
    renderApp(
      createTestStore({
        settings: {
          ...defaults,
          appearance: {
            ...defaults.appearance,
            highContrast: true,
            kitchenMode: true,
            largeText: true,
            reducedMotion: true,
            compactDensity: true,
          },
        },
      }),
    );
    await screen.findByTestId('page-pantry');
    const root = document.documentElement;
    expect(root.classList.contains('high-contrast')).toBe(true);
    expect(root.classList.contains('kitchen-mode')).toBe(true);
    expect(root.classList.contains('large-text')).toBe(true);
    expect(root.classList.contains('reduced-motion')).toBe(true);
    expect(root.classList.contains('compact-density')).toBe(true);
  });

  it('oeffnet Command-Palette per Strg+K', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.keyboard('{Control>}k{/Control}');
    expect(await screen.findByTestId('command-palette-open')).toBeInTheDocument();
  });

  it('zeigt Back-Online Toast nach Reconnect', async () => {
    onlineStatus = false;
    const store = createTestStore();
    const { rerender } = render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>,
    );
    onlineStatus = true;
    rerender(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>,
    );
    expect(await screen.findByText(/online|Online/i)).toBeInTheDocument();
  });

  it('entfernt Toast nach Timeout', async () => {
    vi.useFakeTimers();
    const store = createTestStore({
      ui: {
        ...uiBase,
        toasts: [{ id: 'auto', message: 'Auto-Toast', type: 'info' }],
      },
    });
    renderApp(store);
    expect(screen.getByText('Auto-Toast')).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });
    expect(store.getState().ui.toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it.each([
    ['chef', 'page-chef'],
    ['recipes', 'page-recipes'],
    ['meal-planner', 'page-planner'],
    ['shopping-list', 'page-shopping'],
    ['settings', 'page-settings'],
    ['help', 'page-help'],
  ] as const)('rendert Stub-Seite %s', async (page, testId) => {
    const store = createTestStore({ ui: { ...uiBase, currentPage: page } });
    renderApp(store);
    expect(await screen.findByTestId(testId)).toBeInTheDocument();
  });

  it('verarbeitet finalTranscript via Voice-Pipeline', async () => {
    speechMocks.finalTranscript = 'gehe zu chef';
    const store = createTestStore();
    renderApp(store);
    expect(await screen.findByTestId('page-chef')).toBeInTheDocument();
    expect(store.getState().ui.currentPage).toBe('chef');
  });

  it('PWA-Install-Dialog: Installieren ruft handleInstallPWA auf', async () => {
    pwaMocks.showInstallDialog = true;
    const user = userEvent.setup();
    renderApp();
    const installBtn = await screen.findByRole('button', { name: /Installieren|install/i });
    await user.click(installBtn);
    expect(pwaMocks.handleInstallPWA).toHaveBeenCalled();
  });

  it('PWA-Install-Dialog: Spaeter ruft handleInstallRemindLater auf', async () => {
    pwaMocks.showInstallDialog = true;
    const user = userEvent.setup();
    renderApp();
    const laterBtn = await screen.findByRole('button', { name: /Spaeter/i });
    await user.click(laterBtn);
    expect(pwaMocks.handleInstallRemindLater).toHaveBeenCalled();
  });

  it('PWA-Update-Dialog: Neu laden ruft handleReloadForUpdate auf', async () => {
    pwaMocks.showUpdateReadyNotice = true;
    const user = userEvent.setup();
    renderApp();
    const reloadBtn = await screen.findByRole('button', { name: /Neu laden/i });
    await user.click(reloadBtn);
    expect(pwaMocks.handleReloadForUpdate).toHaveBeenCalled();
  });

  it('PWA-Update-Dialog: Spaeter ruft dismissUpdateNotice auf', async () => {
    pwaMocks.showUpdateReadyNotice = true;
    const user = userEvent.setup();
    renderApp();
    const laterBtn = await screen.findByRole('button', { name: /Später/i });
    await user.click(laterBtn);
    expect(pwaMocks.dismissUpdateNotice).toHaveBeenCalled();
  });

  it('PWA-Install-Dialog: Nicht mehr erinnern ruft handleInstallDismiss auf', async () => {
    pwaMocks.showInstallDialog = true;
    const user = userEvent.setup();
    renderApp();
    const dismissBtn = await screen.findByRole('button', { name: /Nicht mehr erinnern/i });
    await user.click(dismissBtn);
    expect(pwaMocks.handleInstallDismiss).toHaveBeenCalled();
  });

  it('zeigt Offline-Banner wenn nicht online', async () => {
    onlineStatus = false;
    renderApp();
    expect(await screen.findByRole('status')).toBeInTheDocument();
    onlineStatus = true;
  });

  it('Settings-Seite rendert mit installPromptEvent', async () => {
    pwaMocks.showInstallDialog = false;
    const store = createTestStore({ ui: { ...uiBase, currentPage: 'settings' } });
    renderApp(store);
    expect(await screen.findByTestId('page-settings')).toBeInTheDocument();
  });

  it('rendert Toast-Typen und manuelles Schliessen', async () => {
    const user = userEvent.setup();
    const store = createTestStore({
      ui: {
        ...uiBase,
        toasts: [
          { id: 's', message: 'OK', type: 'success' },
          { id: 'e', message: 'Fehler', type: 'error' },
          { id: 'i', message: 'Info', type: 'info' },
        ],
      },
    });
    renderApp(store);
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Fehler')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    const closeButtons = screen.getAllByLabelText(/Schließen|close/i);
    await user.click(closeButtons[0]!);
    expect(store.getState().ui.toasts).toHaveLength(2);
  });

  it('geht offline ohne Back-Online Toast', async () => {
    onlineStatus = true;
    const store = createTestStore();
    const { rerender } = render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>,
    );
    onlineStatus = false;
    rerender(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>,
    );
    expect(store.getState().ui.toasts.some((t) => t.message.match(/online|Online/i))).toBe(false);
    onlineStatus = true;
  });
});
