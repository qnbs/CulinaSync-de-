import type { Page } from '../types';

const PAGE_FROM_QUERY: Record<string, Page> = {
  pantry: 'pantry',
  chef: 'chef',
  recipes: 'recipes',
  'meal-planner': 'meal-planner',
  'shopping-list': 'shopping-list',
  settings: 'settings',
  help: 'help',
};

// QNBS-v3: PWA-Manifest-Shortcuts nutzen ?page=… — zentrale Zuordnung für App-Start
export const getPageFromLocationSearch = (search: string): Page | null => {
  const pageParam = new URLSearchParams(search).get('page');
  if (!pageParam) {
    return null;
  }
  return PAGE_FROM_QUERY[pageParam] ?? null;
};
