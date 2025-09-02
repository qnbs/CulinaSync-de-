

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

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, isListening, startListening, stopListening, hasRecognitionSupport, onCommandPaletteToggle }) => {
  const navItems = [
    { id: 'pantry', label: 'Vorratskammer', icon: Milk },
    { id: 'chef', label: 'KI-Chef', icon: Bot },
    { id: 'recipes', label: 'Rezepte', icon: BookOpen },
    { id: 'meal-planner', label: 'Essensplaner', icon: CalendarDays },
    { id: 'shopping-list', label: 'Einkaufsliste', icon: ShoppingCart },
    { id: 'settings', label: 'Einstellungen', icon: Settings },
    { id: 'help', label: 'Hilfe', icon: HelpCircle },
  ];

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };


  return (
    <header className="bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10 border-b border-zinc-800">
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
                className="flex items-center justify-center p-2 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors duration-200"
              >
                <TerminalSquare className="h-5 w-5" />
              </button>
            {hasRecognitionSupport && (
              <button
                onClick={handleMicClick}
                title={isListening ? "Sprachsteuerung stoppen" : "Sprachsteuerung aktivieren"}
                className={`flex items-center justify-center p-2 rounded-md transition-colors duration-200 ${
                    isListening ? 'bg-red-600 text-white animate-pulse' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
            {navItems.map((item) => {
              const isIconOnly = item.id === 'settings' || item.id === 'help';
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as Page)}
                  title={item.label}
                  className={`flex items-center py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isIconOnly ? 'px-2' : 'space-x-2 px-2 sm:px-3'
                  } ${
                    currentPage === item.id
                      ? 'bg-amber-500 text-zinc-900'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  }`}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  {!isIconOnly && <span className="hidden md:inline">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;