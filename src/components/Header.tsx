import React from 'react';
import { Bot, ChefHat, Milk, BookOpen, CalendarDays, ShoppingCart, Settings, HelpCircle, Mic, TerminalSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Page } from '../types';

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
  const { t } = useTranslation();
  const navItems = [
    { id: 'pantry', label: t('header.nav.pantry'), icon: Milk },
    { id: 'chef', label: t('header.nav.chef'), icon: Bot },
    { id: 'recipes', label: t('header.nav.recipes'), icon: BookOpen },
    { id: 'meal-planner', label: t('header.nav.mealPlanner'), icon: CalendarDays },
    { id: 'shopping-list', label: t('header.nav.shoppingList'), icon: ShoppingCart },
  ];

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <header className="glass-panel-strong sticky top-0 z-50 border-b-0 border-b-white/0 shadow-lg backdrop-blur-xl">
      {/* Subtle Gradient Line at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="relative">
               <div className="absolute inset-0 bg-[var(--color-accent-500)]/20 blur-xl rounded-full"></div>
               <ChefHat className="relative h-8 w-8 text-[var(--color-accent-400)] drop-shadow-md" />
            </div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">CulinaSync</h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
             <button
                onClick={onCommandPaletteToggle}
                title={t('header.actions.openCommandPalette')}
                className="glass-button flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-zinc-100"
              >
                <TerminalSquare className="h-5 w-5" />
              </button>
            {hasRecognitionSupport && (
              <button
                onClick={handleMicClick}
                title={isListening ? t('header.actions.stopVoiceControl') : t('header.actions.startVoiceControl')}
                className={`glass-button flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${
                    isListening ? 'bg-red-500/20 !border-red-500/50 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
             {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 p-1 bg-white/5 rounded-lg border border-white/5">
              {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id as Page)}
                    title={item.label}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-[var(--color-accent-500)] text-zinc-900 shadow-[0_0_10px_rgba(var(--color-accent-glow),0.4)]'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                    }`}
                    aria-current={currentPage === item.id ? 'page' : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </button>
              ))}
            </div>
            {/* Mobile Settings/Help */}
            <div className="flex items-center space-x-1 border-l border-white/10 pl-2 ml-1">
                 <button
                    key="settings"
                    onClick={() => setCurrentPage('settings')}
                    title={t('header.actions.settings')}
                    className={`glass-button flex items-center p-2 rounded-lg text-sm font-medium ${
                      currentPage === 'settings'
                        ? 'text-[var(--color-accent-400)] border-[var(--color-accent-500)]/30'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                   <button
                    key="help"
                    onClick={() => setCurrentPage('help')}
                    title={t('header.actions.help')}
                    className={`glass-button flex items-center p-2 rounded-lg text-sm font-medium ${
                      currentPage === 'help'
                        ? 'text-[var(--color-accent-400)] border-[var(--color-accent-500)]/30'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;