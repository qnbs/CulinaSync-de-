import type { LucideIcon } from 'lucide-react';
import { Bot, BookOpen, CalendarDays, Milk, ShoppingCart } from 'lucide-react';
import type { Page } from '../types';

export type MainNavItem = {
  id: Page;
  headerLabelKey: string;
  mobileLabelKey: string;
  icon: LucideIcon;
};

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  { id: 'pantry', headerLabelKey: 'header.nav.pantry', mobileLabelKey: 'nav.pantry', icon: Milk },
  { id: 'chef', headerLabelKey: 'header.nav.chef', mobileLabelKey: 'nav.chef', icon: Bot },
  { id: 'recipes', headerLabelKey: 'header.nav.recipes', mobileLabelKey: 'nav.recipes', icon: BookOpen },
  { id: 'meal-planner', headerLabelKey: 'header.nav.mealPlanner', mobileLabelKey: 'nav.mealPlanner', icon: CalendarDays },
  { id: 'shopping-list', headerLabelKey: 'header.nav.shoppingList', mobileLabelKey: 'nav.shoppingList', icon: ShoppingCart },
];
