import React from 'react';
import { Bot, Milk, BookOpen, CalendarDays, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Page } from '../types';

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'pantry', label: t('nav.pantry'), icon: Milk },
    { id: 'chef', label: t('nav.chef'), icon: Bot },
    { id: 'recipes', label: t('nav.recipes'), icon: BookOpen },
    { id: 'meal-planner', label: t('nav.mealPlanner'), icon: CalendarDays },
    { id: 'shopping-list', label: t('nav.shoppingList'), icon: ShoppingCart },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/85 backdrop-blur-xl border-t border-white/5 z-50 pb-safe transition-all duration-300">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as Page)}
                className="group flex flex-col items-center justify-center space-y-1 w-full h-full relative"
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                    <div className="absolute top-0 w-12 h-1 bg-[var(--color-accent-500)] rounded-b-full shadow-[0_2px_10px_var(--color-accent-glow)]"></div>
                )}
                
                <div className={`transition-all duration-300 p-1.5 rounded-xl ${isActive ? 'text-[var(--color-accent-400)] bg-[var(--color-accent-500)]/10 -translate-y-1' : 'text-zinc-400 group-active:scale-95'}`}>
                    <item.icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors duration-300 ${
                  isActive ? 'text-[var(--color-accent-100)]' : 'text-zinc-500'
                }`}>
                    {item.label}
                </span>
              </button>
            );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;