import React from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '../types';
import { MAIN_NAV_ITEMS } from '../config/mainNav';

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('nav.ariaLabel')}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe border-t border-white/5 bg-zinc-950/90 backdrop-blur-xl"
    >
      <div className="flex justify-around items-center h-16 px-1 max-w-lg mx-auto">
        {MAIN_NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className="group flex flex-col items-center justify-center gap-0.5 w-full h-full relative"
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <div
                  className="absolute top-0 w-10 h-0.5 bg-[var(--color-accent-500)] rounded-b-full shadow-[0_2px_10px_var(--color-accent-glow-soft)]"
                  aria-hidden
                />
              )}
              <div
                className={`transition-all duration-[var(--motion-base)] p-1.5 rounded-xl ${
                  isActive
                    ? 'text-[var(--color-accent-400)] bg-[var(--color-accent-500)]/10 -translate-y-0.5'
                    : 'text-zinc-500 group-active:scale-95'
                }`}
              >
                <item.icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} aria-hidden />
              </div>
              <span
                className={`text-[10px] font-semibold tracking-wide transition-colors duration-[var(--motion-base)] ${
                  isActive ? 'text-[var(--color-accent-100)]' : 'text-zinc-500'
                }`}
              >
                {t(item.mobileLabelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
