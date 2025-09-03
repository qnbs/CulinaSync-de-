import React from 'react';
import { Bot, ChefHat, Milk, BookOpen, CalendarDays, ShoppingCart, Settings, HelpCircle, Mic, TerminalSquare } from 'lucide-react';
import { Page } from '@/types';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  onCommandPaletteToggle: () => void;
}

const navItems = [
  { id: 'pantry', label: 'Vorratskammer', icon: Milk },
  { id: 'chef', label: 'KI-Chef', icon: Bot },
  { id: 'recipes', label: 'Rezepte', icon: BookOpen },
  { id: 'meal-planner', label: 'Essensplaner', icon: CalendarDays },
  { id: 'shopping-list', label: 'Einkaufsliste', icon: ShoppingCart },
];

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, isListening, startListening, stopListening, hasRecognitionSupport, onCommandPaletteToggle }) => {

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };


  return (
    <header className="bg-zinc-950/70 backdrop-blur-lg sticky top-0 z-40 border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <ChefHat className="h-8 w-8 text-amber-400" />
            <h1 className="text-xl font-bold text-zinc-100">CulinaSync</h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
             <button
                onClick={onCommandPaletteToggle}
                title="Befehlspalette öffnen (⌘K)"
                className="flex items-center justify-center p-2 rounded-md text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors duration-200"
              >
                <TerminalSquare className="h-5 w-5" />
              </button>
            {hasRecognitionSupport && (
              <button
                onClick={handleMicClick}
                title={isListening ? "Sprachsteuerung stoppen" : "Sprachsteuerung aktivieren"}
                className={`flex items-center justify-center p-2 rounded-md transition-colors duration-200 ${
                    isListening ? 'bg-red-600 text-white animate-pulse' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
             {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
              {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id as Page)}
                    title={item.label}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      currentPage === item.id
                        ? 'bg-amber-500 text-zinc-900'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                    }`}
                    aria-current={currentPage === item.id ? 'page' : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </button>
              ))}
            </div>
            {/* Mobile Settings/Help */}
             <button
                key="settings"
                onClick={() => setCurrentPage('settings')}
                title="Einstellungen"
                className={`flex items-center p-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentPage === 'settings'
                    ? 'bg-amber-500 text-zinc-900'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                }`}
                aria-current={currentPage === 'settings' ? 'page' : undefined}
              >
                <Settings className="h-5 w-5" />
              </button>
               <button
                key="help"
                onClick={() => setCurrentPage('help')}
                title="Hilfe"
                className={`flex items-center p-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentPage === 'help'
                    ? 'bg-amber-500 text-zinc-900'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                }`}
                aria-current={currentPage === 'help' ? 'page' : undefined}
              >
                <HelpCircle className="h-5 w-5" />
              </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;