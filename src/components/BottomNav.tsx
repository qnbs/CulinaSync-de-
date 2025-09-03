
import React from 'react';
import { Bot, Milk, BookOpen, CalendarDays, ShoppingCart } from 'lucide-react';
import { Page } from '@/types';

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const navItems = [
  { id: 'pantry', label: 'Vorrat', icon: Milk },
  { id: 'chef', label: 'KI-Chef', icon: Bot },
  { id: 'recipes', label: 'Rezepte', icon: BookOpen },
  { id: 'meal-planner', label: 'Planer', icon: CalendarDays },
  { id: 'shopping-list', label: 'Einkauf', icon: ShoppingCart },
];

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-md border-t border-white/10 z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id as Page)}
            className={`flex flex-col items-center justify-center space-y-1 w-full h-full transition-colors duration-200 ${
              currentPage === item.id ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-100'
            }`}
            aria-current={currentPage === item.id ? 'page' : undefined}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
