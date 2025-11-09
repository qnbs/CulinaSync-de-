import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Header from './components/Header';
import { CommandPalette, type Command } from './components/CommandPalette';
import { Page, BeforeInstallPromptEvent, ShoppingListItem, PantryItem } from './types';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { processCommand, executeVoiceAction } from './services/voiceCommands';
import { addShoppingListItem, addOrUpdatePantryItem, removeItemFromPantry } from './services/db';
import VoiceControlUI from './components/VoiceControlUI';
import { CheckCircle, Bot, Milk, BookOpen, CalendarDays, ShoppingCart, Settings as SettingsIcon, HelpCircle, PlusCircle, Search, RefreshCw, Trash2, Download, Upload, TerminalSquare, Mic, AlertTriangle, Info, X } from 'lucide-react';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setCurrentPage, navigateToItem as navigateToItemAction, setCommandPaletteOpen, addToast as addToastAction, removeToast as removeToastAction, setFocusAction, setVoiceAction } from './store/slices/uiSlice';


// Lazy load page components for code splitting and faster initial load
const AiChef = lazy(() => import('./components/AiChef'));
const PantryManager = lazy(() => import('./components/PantryManager'));
const RecipeBook = lazy(() => import('./components/RecipeBook'));
const MealPlanner = lazy(() => import('./components/MealPlanner'));
const ShoppingList = lazy(() => import('./components/ShoppingList'));
const Settings = lazy(() => import('./components/Settings'));
const Help = lazy(() => import('./components/Help'));


const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64" aria-label="Loading content">
        <div className="w-16 h-16 border-4 border-[var(--color-accent-500)] border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentPage, toasts, isCommandPaletteOpen } = useAppSelector((state) => state.ui);

  const [appVersion, setAppVersion] = useState<string>('');
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
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
        addToast('App kann derzeit nicht installiert werden.', 'info');
        return;
    }
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') {
        addToast('App erfolgreich installiert!', 'success');
    }
    setInstallPromptEvent(null);
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
        console.log("Processing final command:", finalTranscript);
        const action = processCommand(finalTranscript, currentPage);
        
        executeVoiceAction(action, {
            navigate,
            addToast,
            addShoppingListItem: (item) => addShoppingListItem(item as Omit<ShoppingListItem, 'id' | 'sortOrder' | 'category'>),
            addOrUpdatePantryItem: (item) => addOrUpdatePantryItem(item as Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>),
            removeItemFromPantry,
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
    { id: 'nav-pantry', title: 'Gehe zur Vorratskammer', section: 'Navigation', icon: Milk, action: () => navigate('pantry') },
    { id: 'nav-chef', title: 'Gehe zum KI-Chef', section: 'Navigation', icon: Bot, action: () => navigate('chef') },
    { id: 'nav-recipes', title: 'Gehe zum Kochbuch', section: 'Navigation', icon: BookOpen, action: () => navigate('recipes') },
    { id: 'nav-planner', title: 'Gehe zum Essensplaner', section: 'Navigation', icon: CalendarDays, action: () => navigate('meal-planner') },
    { id: 'nav-shopping', title: 'Gehe zur Einkaufsliste', section: 'Navigation', icon: ShoppingCart, action: () => navigate('shopping-list') },
    { id: 'nav-settings', title: 'Gehe zu den Einstellungen', section: 'Navigation', icon: SettingsIcon, action: () => navigate('settings') },
    { id: 'nav-help', title: 'Gehe zur Hilfe', section: 'Navigation', icon: HelpCircle, action: () => navigate('help') },
    
    { id: 'pantry-add', title: 'Neuen Artikel zum Vorrat hinzufügen', section: 'Vorratskammer', icon: PlusCircle, action: () => navigate('pantry', 'addItem') },
    
    { id: 'chef-generate', title: 'Neues Rezept generieren', section: 'KI-Chef', icon: Bot, action: () => navigate('chef', 'prompt') },

    { id: 'shopping-add', title: 'Artikel zur Einkaufsliste hinzufügen', section: 'Einkaufsliste', icon: PlusCircle, action: () => navigate('shopping-list', 'addItem') },
    { id: 'shopping-generate', title: 'Einkaufsliste aus Plan generieren', section: 'Einkaufsliste', icon: RefreshCw, action: () => navigate('shopping-list', 'generate') },
    { id: 'shopping-clear', title: 'Einkaufsliste leeren', section: 'Einkaufsliste', icon: Trash2, action: () => navigate('shopping-list', 'clear') },
    
    { id: 'data-export', title: 'Daten exportieren', section: 'Daten', icon: Download, action: () => navigate('settings', 'export') },
    { id: 'data-import', title: 'Daten importieren', section: 'Daten', icon: Upload, action: () => navigate('settings', 'import') },
    
    { id: 'voice-toggle', title: 'Sprachsteuerung umschalten', section: 'Global', icon: Mic, action: () => isListening ? stopListening() : startListening() },
  ];

  if (canInstall) {
    commands.push({ id: 'app-install', title: 'App installieren', section: 'Global', icon: Download, action: handleInstallPWA });
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
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
        <Header 
          currentPage={currentPage} 
          setCurrentPage={navigate}
          isListening={isListening}
          startListening={startListening}
          stopListening={stopListening}
          hasRecognitionSupport={hasRecognitionSupport}
          onCommandPaletteToggle={() => dispatch(setCommandPaletteOpen(true))}
        />
        <main key={currentPage} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in pb-20 md:pb-8">
          <Suspense fallback={<LoadingSpinner />}>
              {renderPage()}
          </Suspense>
        </main>
        
        <BottomNav currentPage={currentPage} setCurrentPage={navigate} />

        <CommandPalette 
          isOpen={isCommandPaletteOpen}
          onClose={onCommandPaletteClose}
          commands={commands}
        />

        <VoiceControlUI isListening={isListening} transcript={interimTranscript} />
        
        <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {toasts.map((toast) => (
                    <div key={toast.id} className="max-w-sm w-full bg-zinc-800/80 backdrop-blur-md shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden page-fade-in">
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
                                        <span className="sr-only">Schließen</span>
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