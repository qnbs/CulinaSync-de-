import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/services/db';
import { Recipe } from '@/types';
import RecipeList from '@/components/RecipeList';
import RecipeDetail from '@/components/RecipeDetail';
import { BookOpen, Search, X, ListFilter, Star } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface RecipeBookProps {
    focusAction?: string | null;
    onActionHandled?: () => void;
    addToast: (message: string, type?: 'success' | 'error') => void;
}

const RecipeBook: React.FC<RecipeBookProps> = ({ focusAction, onActionHandled, addToast }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const savedRecipes = useLiveQuery(() => db.recipes.toArray(), []);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState('newest');
  const [courseFilter, setCourseFilter] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [mainIngredientFilter, setMainIngredientFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    if (focusAction === 'search' && searchInputRef.current) {
        searchInputRef.current.focus();
        onActionHandled?.();
    }
  }, [focusAction, onActionHandled]);

  // Generate filter options from saved recipes
  const filterOptions = useMemo(() => {
    if (!savedRecipes) return { courses: [], cuisines: [], mainIngredients: [], difficulties: [] };
    const courses = new Set<string>();
    const cuisines = new Set<string>();
    const mainIngredients = new Set<string>();
    const difficulties = new Set<string>();

    savedRecipes.forEach(recipe => {
      recipe.tags.course?.forEach(c => courses.add(c));
      recipe.tags.cuisine?.forEach(c => cuisines.add(c));
      recipe.tags.mainIngredient?.forEach(m => mainIngredients.add(m));
      recipe.tags.difficulty?.forEach(d => difficulties.add(d));
    });

    return {
      courses: Array.from(courses).sort(),
      cuisines: Array.from(cuisines).sort(),
      mainIngredients: Array.from(mainIngredients).sort(),
      difficulties: Array.from(difficulties).sort(),
    };
  }, [savedRecipes]);

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('newest');
    setCourseFilter('');
    setCuisineFilter('');
    setMainIngredientFilter('');
    setDifficultyFilter('');
    setShowFavoritesOnly(false);
  };

  // Filter and sort recipes based on state
  const filteredRecipes = useMemo(() => {
    if (!savedRecipes) return [];
    
    let recipes = [...savedRecipes];

    // 1. Filter by favorites
    if (showFavoritesOnly) {
        recipes = recipes.filter(recipe => recipe.isFavorite);
    }
    
    // 2. Filter by search term
    if (debouncedSearchTerm) {
      const lowerCaseSearch = debouncedSearchTerm.toLowerCase();
      recipes = recipes.filter(recipe => 
        recipe.recipeTitle.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // 3. Filter by categories
    recipes = recipes.filter(recipe => {
      const courseMatch = courseFilter ? recipe.tags.course?.includes(courseFilter) : true;
      const cuisineMatch = cuisineFilter ? recipe.tags.cuisine?.includes(cuisineFilter) : true;
      const mainIngredientMatch = mainIngredientFilter ? recipe.tags.mainIngredient?.includes(mainIngredientFilter) : true;
      const difficultyMatch = difficultyFilter ? recipe.tags.difficulty?.includes(difficultyFilter) : true;
      return courseMatch && cuisineMatch && mainIngredientMatch && difficultyMatch;
    });

    // 4. Sort
    switch (sortBy) {
        case 'a-z':
            recipes.sort((a, b) => a.recipeTitle.localeCompare(b.recipeTitle));
            break;
        case 'z-a':
            recipes.sort((a, b) => b.recipeTitle.localeCompare(a.recipeTitle));
            break;
        case 'favorites':
            recipes.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
            break;
        case 'newest':
        default:
             recipes.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
            break;
    }

    return recipes;
  }, [savedRecipes, debouncedSearchTerm, sortBy, courseFilter, cuisineFilter, mainIngredientFilter, difficultyFilter, showFavoritesOnly]);

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
      />
    );
  }
  
  const hasActiveFilters = searchTerm || sortBy !== 'newest' || courseFilter || cuisineFilter || mainIngredientFilter || difficultyFilter || showFavoritesOnly;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Mein Kochbuch</h2>
        <p className="text-zinc-400 mt-1">Deine Sammlung von generierten und gespeicherten Rezepten.</p>
      </div>

      {savedRecipes && savedRecipes.length > 0 && (
        <div className="space-y-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <input 
                      ref={searchInputRef}
                      type="text" 
                      placeholder="Rezepte nach Titel durchsuchen..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                      className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 pl-10 focus:ring-2 focus:ring-amber-500" 
                      aria-label="Rezepte durchsuchen"
                  />
              </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <select onChange={e => setSortBy(e.target.value)} value={sortBy} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" aria-label="Sortieren nach">
                <option value="newest">Sortieren: Neueste zuerst</option>
                <option value="favorites">Sortieren: Favoriten zuerst</option>
                <option value="a-z">Sortieren: Name (A-Z)</option>
                <option value="z-a">Sortieren: Name (Z-A)</option>
            </select>
            <select onChange={e => setCourseFilter(e.target.value)} value={courseFilter} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" aria-label="Nach Gang filtern">
              <option value="">Alle Gänge</option>
              {filterOptions.courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select onChange={e => setCuisineFilter(e.target.value)} value={cuisineFilter} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" aria-label="Nach Küche filtern">
              <option value="">Alle Küchen</option>
              {filterOptions.cuisines.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select onChange={e => setMainIngredientFilter(e.target.value)} value={mainIngredientFilter} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" aria-label="Nach Hauptzutat filtern">
              <option value="">Alle Hauptzutaten</option>
              {filterOptions.mainIngredients.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <select onChange={e => setDifficultyFilter(e.target.value)} value={difficultyFilter} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" aria-label="Nach Schwierigkeit filtern">
              <option value="">Alle Schwierigkeiten</option>
              {filterOptions.difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="pt-3 border-t border-zinc-800 flex justify-between items-center">
                <button onClick={clearFilters} disabled={!hasActiveFilters} className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-semibold disabled:text-zinc-600 disabled:cursor-not-allowed">
                    <X size={16} /> Alle Filter zurücksetzen
                </button>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={showFavoritesOnly} 
                        onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className="h-4 w-4 rounded bg-zinc-700 border-zinc-600 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-zinc-300 text-sm font-medium flex items-center gap-1"><Star size={14} className="text-amber-400" /> Nur Favoriten</span>
                </label>
            </div>
        </div>
      )}

      {filteredRecipes && filteredRecipes.length > 0 ? (
        <RecipeList recipes={filteredRecipes} onSelectRecipe={setSelectedRecipe} />
      ) : (
        <div className="text-center py-20 bg-zinc-950/50 border border-zinc-800 rounded-lg">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-600" />
          <h3 className="mt-4 text-lg font-medium text-zinc-300">
            {savedRecipes && savedRecipes.length > 0 ? 'Keine Rezepte entsprechen deiner Suche' : 'Dein Kochbuch ist leer'}
          </h3>
          <p className="mt-1 text-sm text-zinc-500 max-w-md mx-auto">
            {savedRecipes && savedRecipes.length > 0 ? 'Versuche, deine Filterauswahl anzupassen oder die Suche zurückzusetzen.' : 'Gehe zum KI-Chef, generiere ein Rezept und speichere es, um es hier zu finden.'}
          </p>
          {savedRecipes && savedRecipes.length > 0 && hasActiveFilters && (
              <button onClick={clearFilters} className="mt-6 flex mx-auto items-center gap-2 bg-amber-500 text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400 transition-colors">
                  <ListFilter size={18} /> Filter zurücksetzen
              </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeBook;
