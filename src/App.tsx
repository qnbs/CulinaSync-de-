import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import { type Command } from './components/CommandPalette';
import { Page, BeforeInstallPromptEvent, ShoppingListItem, PantryItem } from './types';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { processCommand, executeVoiceAction } from './services/voiceCommands';
import { CheckCircle, Bot, Milk, BookOpen, CalendarDays, ShoppingCart, Settings as SettingsIcon, HelpCircle, PlusCircle, RefreshCw, Trash2, Download, Upload, Mic, AlertTriangle, Info, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setCurrentPage, setCommandPaletteOpen, addToast as addToastAction, removeToast as removeToastAction } from './store/slices/uiSlice';


// Lazy load page components for code splitting and faster initial load
const AiChef = lazy(() => import('./components/AiChef'));
const PantryManager = lazy(() => import('./components/PantryManager'));
const RecipeBook = lazy(() => import('./components/RecipeBook'));
const MealPlanner = lazy(() => import('./components/MealPlanner'));
const ShoppingList = lazy(() => import('./components/ShoppingList'));
const Settings = lazy(() => import('./components/Settings'));
const Help = lazy(() => import('./components/Help'));
const BottomNav = lazy(() => import('./components/BottomNav'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const VoiceControlUI = lazy(() => import('./components/VoiceControlUI'));
const CommandPalette = lazy(() => import('./components/CommandPalette').then(m => ({ default: m.CommandPalette })));


const LoadingSpinner: React.FC = () => {
  const { t } = useTranslation();

  return (
  <div className="flex justify-center items-center h-64" role="status" aria-live="polite" aria-label={t('app.loading')}>
        <div className="w-16 h-16 border-4 border-[var(--color-accent-500)] border-t-transparent rounded-full animate-spin"></div>
    <span className="sr-only">{t('app.loading')}</span>
    </div>
  );
};

const App: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { currentPage, toasts, isCommandPaletteOpen } = useAppSelector((state) => state.ui);
  const settings = useAppSelector((state) => state.settings);

  const [appVersion, setAppVersion] = useState<string>('');
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInstallReminder, setShowInstallReminder] = useState(false);

  useEffect(() => {
    void import('./services/db');

    fetch('./package.json')
      .then(res => res.json())
      .then(data => setAppVersion(data.version || 'N/A'))
      .catch(() => setAppVersion('N/A'));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const hasOnboarded = localStorage.getItem('culinaSyncOnboarded');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('high-contrast', settings.appearance.highContrast);
    root.classList.toggle('kitchen-mode', settings.appearance.kitchenMode);
    root.classList.toggle('large-text', settings.appearance.largeText);

    return () => {
      root.classList.remove('high-contrast', 'kitchen-mode', 'large-text');
    };
  }, [settings.appearance.highContrast, settings.appearance.kitchenMode, settings.appearance.largeText]);

  useEffect(() => {
    if (!installPromptEvent || isStandalone) {
      return;
    }

    const dismissedUntil = Number(window.localStorage.getItem('culinaSyncInstallRemindAfter') || '0');
    const permanentlyDismissed = window.localStorage.getItem('culinaSyncInstallDismissed') === 'true';
    const now = Date.now();

    if (!permanentlyDismissed && now >= dismissedUntil) {
      setShowInstallReminder(true);
    }
  }, [installPromptEvent, isStandalone]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('culinaSyncOnboarded', 'true');
    setShowOnboarding(false);
  };

  const removeToast = useCallback((id: string) => {
    dispatch(removeToastAction(id));
  }, [dispatch]);
  
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    dispatch(addToastAction({ message, type }));
  }, [dispatch]);

  useEffect(() => {
    if (toasts.length > 0) {
      const latestToast = toasts[toasts.length - 1];
      const timer = setTimeout(() => {
        removeToast(latestToast.id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  const handleInstallPWA = async () => {
    if (!installPromptEvent) {
        addToast(t('app.install.unavailable'), 'info');
        return;
    }
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') {
      addToast(t('app.install.success'), 'success');
      window.localStorage.removeItem('culinaSyncInstallRemindAfter');
      window.localStorage.removeItem('culinaSyncInstallDismissed');
      setShowInstallReminder(false);
    } else {
      window.localStorage.setItem('culinaSyncInstallRemindAfter', String(Date.now() + 3 * 24 * 60 * 60 * 1000));
      setShowInstallReminder(false);
    }
    setInstallPromptEvent(null);
  };

  const handleInstallRemindLater = () => {
    window.localStorage.setItem('culinaSyncInstallRemindAfter', String(Date.now() + 3 * 24 * 60 * 60 * 1000));
    setShowInstallReminder(false);
  };

  const handleInstallDismiss = () => {
    window.localStorage.setItem('culinaSyncInstallDismissed', 'true');
    setShowInstallReminder(false);
  };

  const {
    finalTranscript,
    interimTranscript,
    startListening,
    stopListening,
    isListening,
    hasRecognitionSupport,
    error: speechError,
  } = useSpeechRecognition();
  
  useEffect(() => {
    if (speechError) {
        addToast(speechError, 'error');
    }
  }, [speechError, addToast]);
  
  
  const navigate = useCallback((page: Page, focusTarget?: string) => {
    dispatch(setCurrentPage({ page, focusTarget }));
  }, [dispatch]);

  useEffect(() => {
    if (finalTranscript) {
      if (import.meta.env.DEV) {
        console.log("Processing final command:", finalTranscript);
      }
        const action = processCommand(finalTranscript, currentPage);
        
        executeVoiceAction(action, {
            navigate,
            addToast,
            addShoppingListItem: async (item) => {
              const { addShoppingListItem } = await import('./services/repositories/shoppingListRepository');
              return addShoppingListItem(item as Omit<ShoppingListItem, 'id' | 'sortOrder' | 'category'>);
            },
            addOrUpdatePantryItem: async (item) => {
              const { addOrUpdatePantryItem } = await import('./services/repositories/pantryRepository');
              return addOrUpdatePantryItem(item as Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>);
            },
            removeItemFromPantry: async (name) => {
              const { removeItemFromPantry } = await import('./services/repositories/pantryRepository');
              return removeItemFromPantry(name);
            },
            dispatch,
        }, currentPage);
    }
  }, [finalTranscript, currentPage, addToast, navigate, dispatch]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        dispatch(setCommandPaletteOpen(!isCommandPaletteOpen));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, dispatch]);

  const canInstall = installPromptEvent && !isStandalone;

  const commands: Command[] = [
    { id: 'nav-pantry', title: t('app.commands.nav.pantry'), section: t('app.commandSections.navigation'), icon: Milk, action: () => navigate('pantry') },
    { id: 'nav-chef', title: t('app.commands.nav.chef'), section: t('app.commandSections.navigation'), icon: Bot, action: () => navigate('chef') },
    { id: 'nav-recipes', title: t('app.commands.nav.recipes'), section: t('app.commandSections.navigation'), icon: BookOpen, action: () => navigate('recipes') },
    { id: 'nav-planner', title: t('app.commands.nav.mealPlanner'), section: t('app.commandSections.navigation'), icon: CalendarDays, action: () => navigate('meal-planner') },
    { id: 'nav-shopping', title: t('app.commands.nav.shoppingList'), section: t('app.commandSections.navigation'), icon: ShoppingCart, action: () => navigate('shopping-list') },
    { id: 'nav-settings', title: t('app.commands.nav.settings'), section: t('app.commandSections.navigation'), icon: SettingsIcon, action: () => navigate('settings') },
    { id: 'nav-help', title: t('app.commands.nav.help'), section: t('app.commandSections.navigation'), icon: HelpCircle, action: () => navigate('help') },
    
    { id: 'pantry-add', title: t('app.commands.pantry.addItem'), section: t('app.commandSections.pantry'), icon: PlusCircle, action: () => navigate('pantry', 'addItem') },
    
    { id: 'chef-generate', title: t('app.commands.chef.generateRecipe'), section: t('app.commandSections.chef'), icon: Bot, action: () => navigate('chef', 'prompt') },

    { id: 'shopping-add', title: t('app.commands.shoppingList.addItem'), section: t('app.commandSections.shoppingList'), icon: PlusCircle, action: () => navigate('shopping-list', 'addItem') },
    { id: 'shopping-generate', title: t('app.commands.shoppingList.generateFromPlan'), section: t('app.commandSections.shoppingList'), icon: RefreshCw, action: () => navigate('shopping-list', 'generate') },
    { id: 'shopping-clear', title: t('app.commands.shoppingList.clear'), section: t('app.commandSections.shoppingList'), icon: Trash2, action: () => navigate('shopping-list', 'clear') },
    
    { id: 'data-export', title: t('app.commands.data.export'), section: t('app.commandSections.data'), icon: Download, action: () => navigate('settings', 'export') },
    { id: 'data-import', title: t('app.commands.data.import'), section: t('app.commandSections.data'), icon: Upload, action: () => navigate('settings', 'import') },
    
    { id: 'voice-toggle', title: t('app.commands.global.toggleVoiceControl'), section: t('app.commandSections.global'), icon: Mic, action: () => isListening ? stopListening() : startListening() },
  ];

  if (canInstall) {
    commands.push({ id: 'app-install', title: t('app.commands.global.installApp'), section: t('app.commandSections.global'), icon: Download, action: handleInstallPWA });
  }

  const onCommandPaletteClose = useCallback(() => {
    dispatch(setCommandPaletteOpen(false));
  }, [dispatch]);

  const renderPage = () => {
    switch (currentPage) {
        case 'pantry': return <PantryManager />;
        case 'chef': return <AiChef />;
        case 'recipes': return <RecipeBook />;
        case 'meal-planner': return <MealPlanner />;
        case 'shopping-list': return <ShoppingList />;
        case 'settings': return <Settings installPromptEvent={installPromptEvent} onInstallPWA={handleInstallPWA} isStandalone={isStandalone} />;
        case 'help': return <Help appVersion={appVersion} />;
        default: return <PantryManager />;
    }
  }

  return (
      <div className="min-h-screen text-zinc-200">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] bg-zinc-900 border border-zinc-600 text-zinc-100 rounded px-3 py-2">
          {t('app.skipToContent')}
        </a>
        <Suspense fallback={null}>
          {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
        </Suspense>
        <div data-tour="header">
          <Header 
            currentPage={currentPage} 
            setCurrentPage={navigate}
            isListening={isListening}
            startListening={startListening}
            stopListening={stopListening}
            hasRecognitionSupport={hasRecognitionSupport}
            onCommandPaletteToggle={() => dispatch(setCommandPaletteOpen(true))}
          />
        </div>
        <main id="main-content" key={currentPage} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in pb-20 md:pb-8">
          <Suspense fallback={<LoadingSpinner />}>
              {renderPage()}
          </Suspense>
        </main>

        <div data-tour="bottom-nav">
          <Suspense fallback={null}>
            <BottomNav currentPage={currentPage} setCurrentPage={navigate} />
          </Suspense>
        </div>

        {showInstallReminder && installPromptEvent && !isStandalone && (
          <div className="fixed bottom-24 right-4 z-40 w-[min(92vw,24rem)] rounded-2xl border border-[var(--color-accent-500)]/30 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur">
            <h4 className="text-sm font-bold text-zinc-100">{t('app.installReminder.title')}</h4>
            <p className="mt-1 text-sm text-zinc-400">{t('app.installReminder.description')}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={handleInstallPWA} className="flex-1 rounded-lg bg-[var(--color-accent-500)] px-3 py-2 text-sm font-bold text-zinc-900">
                {t('app.installReminder.install')}
              </button>
              <button onClick={handleInstallRemindLater} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-300">
                {t('app.installReminder.later')}
              </button>
              <button onClick={handleInstallDismiss} className="rounded-lg border border-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-500">
                {t('app.installReminder.dismiss')}
              </button>
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          <CommandPalette 
            isOpen={isCommandPaletteOpen}
            onClose={onCommandPaletteClose}
            commands={commands}
          />
        </Suspense>

        <Suspense fallback={null}>
          <VoiceControlUI isListening={isListening} transcript={interimTranscript} />
        </Suspense>
        
        <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {toasts.map((toast) => (
                    <div key={toast.id} className="max-w-sm w-full rounded-lg pointer-events-auto overflow-hidden page-fade-in glass-hud ring-1 ring-black/20">
                        <div className="p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    {toast.type === 'success' && <CheckCircle className="h-6 w-6 text-green-400" aria-hidden="true" />}
                                    {toast.type === 'error' && <AlertTriangle className="h-6 w-6 text-red-400" aria-hidden="true" />}
                                    {toast.type === 'info' && <Info className="h-6 w-6 text-blue-400" aria-hidden="true" />}
                                </div>
                                <div className="ml-3 w-0 flex-1 pt-0.5">
                                    <p className="text-sm font-medium text-zinc-100">{toast.message}</p>
                                </div>
                                <div className="ml-4 flex-shrink-0 flex">
                                    <button onClick={() => removeToast(toast.id)} className="bg-transparent rounded-md inline-flex text-zinc-400 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-500)] focus:ring-offset-zinc-800">
                                      <span className="sr-only">{t('app.close')}</span>
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
  );
};

export default App;