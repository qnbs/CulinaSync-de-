import React from 'react';
import { ChefHat, HelpCircle, Mic, Settings, TerminalSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Page } from '../types';
import { MAIN_NAV_ITEMS } from '../config/mainNav';
import { IconButton } from './ui';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  onCommandPaletteToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  isListening,
  startListening,
  stopListening,
  hasRecognitionSupport,
  onCommandPaletteToggle,
}) => {
  const { t } = useTranslation();

  return (
    <header className="glass-panel-strong sticky top-0 z-50 border-b-0 shadow-lg backdrop-blur-xl">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8" aria-label={t('header.barAria')}>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-accent-500)]/20 blur-xl rounded-full" aria-hidden />
              <ChefHat className="relative h-8 w-8 text-[var(--color-accent-400)] drop-shadow-md" aria-hidden />
            </div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight text-glow">CulinaSync</h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton label={t('header.actions.openCommandPalette')} onClick={onCommandPaletteToggle}>
              <TerminalSquare className="h-5 w-5" aria-hidden />
            </IconButton>

            {hasRecognitionSupport && (
              <IconButton
                label={isListening ? t('header.actions.stopVoiceControl') : t('header.actions.startVoiceControl')}
                tone="danger"
                active={isListening}
                onClick={isListening ? stopListening : startListening}
                aria-pressed={isListening}
              >
                <Mic className="h-5 w-5" aria-hidden />
              </IconButton>
            )}

            <nav
              className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5"
              aria-label={t('header.primaryNavAria')}
            >
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    title={t(item.headerLabelKey)}
                    aria-label={t(item.headerLabelKey)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-[var(--motion-base)] ${
                      isActive
                        ? 'bg-[var(--color-accent-500)] text-zinc-900 shadow-[0_0_12px_var(--color-accent-glow-soft)]'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="hidden lg:inline">{t(item.headerLabelKey)}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-1 border-l border-white/10 pl-2 ml-1">
              <IconButton
                label={t('header.actions.settings')}
                tone={currentPage === 'settings' ? 'accent' : 'default'}
                onClick={() => setCurrentPage('settings')}
                aria-current={currentPage === 'settings' ? 'page' : undefined}
              >
                <Settings className="h-5 w-5" aria-hidden />
              </IconButton>
              <IconButton
                label={t('header.actions.help')}
                tone={currentPage === 'help' ? 'accent' : 'default'}
                onClick={() => setCurrentPage('help')}
                aria-current={currentPage === 'help' ? 'page' : undefined}
              >
                <HelpCircle className="h-5 w-5" aria-hidden />
              </IconButton>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
