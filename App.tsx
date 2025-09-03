import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Header from '@/components/Header';
import CommandPalette, { Command } from '@/components/CommandPalette';
import { Page } from '@/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { processCommand } from '@/services/voiceCommands';
import { addShoppingListItem, addOrUpdatePantryItem, removeItemFromPantry } from '@/services/db';
import VoiceControlUI from '@/components/VoiceControlUI';
import { CheckCircle, Bot, Milk, BookOpen, CalendarDays, ShoppingCart, Settings as SettingsIcon, HelpCircle, PlusCircle, Search, RefreshCw, Trash2, Download, Upload, TerminalSquare, Mic } from 'lucide-react';

// Lazy load page components for code splitting and faster initial load
const AiChef = lazy(() => import('@/components/AiChef'));
const PantryManager = lazy(() => import('@/components/PantryManager'));
const RecipeBook = lazy(() => import('@/components/RecipeBook'));
const MealPlanner = lazy(() => import('@/components/MealPlanner'));
const ShoppingList = lazy(() => import('@/components/ShoppingList'));
const Settings = lazy(() => import('@/components/Settings'));
const Help = lazy(() => import('@/components/Help'));
const AboutPage = lazy(() => import('@/components/AboutPage'));


interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64" aria-label="Loading content">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('pantry');
  const [voiceAction, setVoiceAction] = useState<{type: string, payload: any} | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [focusAction, setFocusAction] = useState<string | null>(null);
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    fetch('./package.json')
      .then(res => res.json())
      .then(data => setAppVersion(data.version || 'N/A'))
      .catch(() => setAppVersion('N/A'));
  }, []);

  const {
    finalTranscript,
    interimTranscript,
    startListening,
    stopListening,
    isListening,
    hasRecognitionSupport,
    error: speechError,
  } = useSpeechRecognition();

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
        removeToast(id);
    }, 4000);
  }, [removeToast]);
  
  
  const navigate = useCallback((page: Page, focusTarget?: string) => {
    setCurrentPage(page);
    if (focusTarget) {
      setFocusAction(focusTarget);
    }
  }, []);

  useEffect(() => {
    if (finalTranscript) {
        console.log("Processing final command:", finalTranscript);
        const action = processCommand(finalTranscript, currentPage);
        
        if (action.type === 'NAVIGATE') {
            setCurrentPage(action.payload);
            addToast(`Navigiere zu: ${action.payload.charAt(0).toUpperCase() + action.payload.slice(1)}`);
        } else if (action.type === 'ADD_SHOPPING_ITEM') {
            addShoppingListItem(action.payload).then(() => {
                addToast(`"${action.payload.name}" zur Einkaufsliste hinzugefügt.`);
                if (currentPage !== 'shopping-list') {
                  setCurrentPage('shopping-list');
                }
            });
        } else if (action.type === 'ADD_PANTRY_ITEM') {
            addOrUpdatePantryItem(action.payload).then(({ status, item }) => {
                 const message = status === 'added' 
                    ? `"${item.name}" zum Vorrat hinzugefügt.`
                    : `Vorrat für "${item.name}" aktualisiert.`;
                 addToast(message);
                 if (currentPage !== 'pantry') {
                    setCurrentPage('pantry');
                 }
            });
        } else if (action.type === 'REMOVE_PANTRY_ITEM') {
            removeItemFromPantry(action.payload).then((success) => {
                if(success) {
                    addToast(`"${action.payload}" aus dem Vorrat entfernt.`);
                } else {
                    addToast(`"${action.payload}" nicht im Vorrat gefunden.`, "error");
                }
                if (currentPage !== 'pantry') {
                    setCurrentPage('pantry');
                }
            });
        }
        else if (action.type !== 'UNKNOWN') {
            setVoiceAction({ type: action.type, payload: `${action.payload}#${Date.now()}` });
        } else {
            addToast("Befehl nicht erkannt.", "error");
        }
    }
  }, [finalTranscript, currentPage, addToast]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands: Command[] = [
    { id: 'nav-pantry', title: 'Gehe zur Vorratskammer', section: 'Navigation', icon: Milk, action: () => navigate('pantry') },
    { id: 'nav-chef', title: 'Gehe zum KI-Chef', section: 'Navigation', icon: Bot, action: () => navigate('chef') },
    { id: 'nav-recipes', title: 'Gehe zum Kochbuch', section: 'Navigation', icon: BookOpen, action: () => navigate('recipes') },
    { id: 'nav-planner', title: 'Gehe zum Essensplaner', section: 'Navigation', icon: CalendarDays, action: () => navigate('meal-planner') },
    { id: 'nav-shopping', title: 'Gehe zur Einkaufsliste', section: 'Navigation', icon: ShoppingCart, action: () => navigate('shopping-list') },
    { id: 'nav-settings', title: 'Gehe zu den Einstellungen', section: 'Navigation', icon: SettingsIcon, action: () => navigate('settings') },
    { id: 'nav-help', title: 'Gehe zur Hilfe', section: 'Navigation', icon: HelpCircle, action: () => navigate('help') },
    
    { id: 'pantry-add', title: 'Neuen Artikel zum Vorrat hinzufügen', section: 'Vorratskammer', icon: PlusCircle, action: () => navigate('pantry', 'addItem') },
    { id: 'pantry-search', title: 'Vorrat durchsuchen', section: 'Vorratskammer', icon: Search, action: () => navigate('pantry', 'search') },
    
    { id: 'chef-generate', title: 'Neues Rezept generieren', section: 'KI-Chef', icon: Bot, action: () => navigate('chef', 'prompt') },

    { id: 'recipe-search', title: 'Rezepte durchsuchen', section: 'Kochbuch', icon: Search, action: () => navigate('recipes', 'search') },

    { id: 'shopping-add', title: 'Artikel zur Einkaufsliste hinzufügen', section: 'Einkaufsliste', icon: PlusCircle, action: () => navigate('shopping-list', 'addItem') },
    { id: 'shopping-generate', title: 'Einkaufsliste aus Plan generieren', section: 'Einkaufsliste', icon: RefreshCw, action: () => navigate('shopping-list', 'generate') },
    { id: 'shopping-clear', title: 'Einkaufsliste leeren', section: 'Einkaufsliste', icon: Trash2, action: () => navigate('shopping-list', 'clear') },
    
    { id: 'data-export', title: 'Daten exportieren', section: 'Daten', icon: Download, action: () => navigate('settings', 'export') },
    { id: 'data-import', title: 'Daten importieren', section: 'Daten', icon: Upload, action: () => navigate('settings', 'import') },
    
    { id: 'voice-toggle', title: 'Sprachsteuerung umschalten', section: 'Global', icon: Mic, action: () => isListening ? stopListening() : startListening() },
    { id: 'cmd-palette', title: 'Befehlspalette öffnen', section: 'Global', icon: TerminalSquare, action: () => setCommandPaletteOpen(true) },
  ];

  const onCommandPaletteClose = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);


  const renderPage = () => {
    const payload = voiceAction?.payload?.split('#')[0];
    
    const pageProps = {
        focusAction,
        onActionHandled: () => setFocusAction(null),
        addToast,
    };
    
    switch (currentPage) {
        case 'pantry':
            return <PantryManager 
                        initialSearchTerm={voiceAction?.type === 'SEARCH' ? payload : undefined}
                        {...pageProps}
                    />;
        case 'chef':
            return <AiChef 
                        initialPrompt={voiceAction?.type === 'GENERATE_RECIPE' ? payload : undefined}
                        {...pageProps}
                    />;
        case 'recipes': return <RecipeBook {...pageProps} />;
        case 'meal-planner': return <MealPlanner {...pageProps} />;
        case 'shopping-list': 
            return <ShoppingList
                        triggerCheckItem={voiceAction?.type === 'CHECK_SHOPPING_ITEM' ? payload : undefined}
                        {...pageProps}
                    />;
        case 'settings': return <Settings {...pageProps} />;
        case 'help': return <Help setCurrentPage={setCurrentPage} appVersion={appVersion} />;
        case 'about': return <AboutPage onBack={() => setCurrentPage('help')} />;
        default: return <PantryManager {...pageProps} />;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isListening={isListening}
        startListening={startListening}
        stopListening={stopListening}
        hasRecognitionSupport={hasRecognitionSupport}
        onCommandPaletteToggle={() => setCommandPaletteOpen(true)}
       />
      <main key={currentPage} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">
        <Suspense fallback={<LoadingSpinner />}>
            {renderPage()}
        </Suspense>
      </main>

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={onCommandPaletteClose}
        commands={commands}
      />

      <VoiceControlUI isListening={isListening} transcript={interimTranscript} />
      {speechError && <div className="fixed bottom-16 sm:bottom-4 right-4 bg-red-800 text-white p-3 rounded-lg shadow-lg z-50 max-w-sm">{speechError}</div>}
      
      <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
          <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
              {toasts.map((toast) => (
                  <div key={toast.id} className="max-w-sm w-full bg-zinc-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden page-fade-in">
                      <div className="p-4">
                          <div className="flex items-start">
                              <div className="flex-shrink-0">
                                  <CheckCircle className={`h-6 w-6 ${toast.type === 'success' ? 'text-green-400' : 'text-red-400'}`} aria-hidden="true" />
                              </div>
                              <div className="ml-3 w-0 flex-1 pt-0.5">
                                  <p className="text-sm font-medium text-zinc-100">{toast.message}</p>
                              </div>
                              <div className="ml-4 flex-shrink-0 flex">
                                  <button onClick={() => removeToast(toast.id)} className="bg-zinc-800 rounded-md inline-flex text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                                      <span className="sr-only">Schließen</span>
                                      &times;
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