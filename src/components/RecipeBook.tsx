import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Recipe } from '../types';
import RecipeList from './RecipeList';
import RecipeDetail from './RecipeDetail';
import { BookOpen, ListFilter, CheckSquare, CalendarPlus, LoaderCircle, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setVoiceAction, setFocusAction, addToast as addToastAction, clearInitialSelectedId } from '../store/slices/uiSlice';
import { RecipeBookHeader } from './recipe-book/RecipeBookHeader';
import { RecipeToolbar } from './recipe-book/RecipeToolbar';
import { BulkAddToPlanModal } from './recipe-book/BulkAddToPlanModal';

const RecipeBook: React.FC = () => {
  const dispatch = useAppDispatch();
  const { voiceAction, initialSelectedId, focusAction } = useAppSelector(state => state.ui);

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const savedRecipes = useLiveQuery(() => db.recipes.toArray(), []);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // State for Search & Sort
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState('newest');

  // State for Filters
  const [filters, setFilters] = useState({
      course: '',
      cuisine: '',
      mainIngredient: '',
      difficulty: '',
      diet: '',
      favoritesOnly: false,
      pantryReady: false
  });

  // Bulk add state
  const [isSelectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkModalOpen, setBulkModalOpen] = useState(false);

  // Voice and external actions handling
  const initialSearchTerm = voiceAction?.type === 'SEARCH' ? voiceAction.payload : undefined;

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    dispatch(addToastAction({ message, type }));
  };

  const handleToggleSelectMode = () => {
    setSelectMode(!isSelectMode);
    setSelectedIds([]);
  };

  const handleToggleSelect = (id: number) => {
    if(!isSelectMode) return;
    setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  useEffect(() => {
    if (initialSearchTerm) {
        setSearchTerm(initialSearchTerm.split('#')[0]);
        dispatch(setVoiceAction(null));
    }
  }, [initialSearchTerm, dispatch]);

  useEffect(() => {
    if (focusAction === 'search' && searchInputRef.current) {
        searchInputRef.current.focus();
        dispatch(setFocusAction(null));
    }
  }, [focusAction, dispatch]);

  useEffect(() => {
    if (initialSelectedId && savedRecipes) {
      const recipeToSelect = savedRecipes.find(r => r.id === initialSelectedId);
      if (recipeToSelect) {
        setSelectedRecipe(recipeToSelect);
        dispatch(clearInitialSelectedId());
      }
    }
  }, [initialSelectedId, savedRecipes, dispatch]);

  const filterOptions = useMemo(() => {
    if (!savedRecipes) return { courses: [], cuisines: [], mainIngredients: [], difficulties: [], diets: [] };
    const courses = new Set<string>();
    const cuisines = new Set<string>();
    const mainIngredients = new Set<string>();
    const difficulties = new Set<string>();
    const diets = new Set<string>();

    savedRecipes.forEach(recipe => {
      recipe.tags.course?.forEach(c => courses.add(c));
      recipe.tags.cuisine?.forEach(c => cuisines.add(c));
      recipe.tags.mainIngredient?.forEach(m => mainIngredients.add(m));
      if (recipe.difficulty) difficulties.add(recipe.difficulty);
      recipe.tags.diet?.forEach(d => diets.add(d));
    });

    return {
      courses: Array.from(courses).sort(),
      cuisines: Array.from(cuisines).sort(),
      mainIngredients: Array.from(mainIngredients).sort(),
      difficulties: Array.from(difficulties).sort(),
      diets: Array.from(diets).sort(),
    };
  }, [savedRecipes]);

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('newest');
    setFilters({
        course: '',
        cuisine: '',
        mainIngredient: '',
        difficulty: '',
        diet: '',
        favoritesOnly: false,
        pantryReady: false
    });
  };

  // Filter Logic (Client-side for simplicity with complex filters)
  const filteredRecipes = useMemo(() => {
      if (!savedRecipes) return [];
      let result = [...savedRecipes];

      // Search
      if (debouncedSearchTerm) {
          const lower = debouncedSearchTerm.toLowerCase();
          result = result.filter(r => r.recipeTitle.toLowerCase().includes(lower));
      }

      // Filters
      if (filters.favoritesOnly) result = result.filter(r => r.isFavorite);
      if (filters.pantryReady) result = result.filter(r => (r.pantryMatchPercentage || 0) === 100);
      if (filters.course) result = result.filter(r => r.tags.course?.includes(filters.course));
      if (filters.cuisine) result = result.filter(r => r.tags.cuisine?.includes(filters.cuisine));
      if (filters.mainIngredient) result = result.filter(r => r.tags.mainIngredient?.includes(filters.mainIngredient));
      if (filters.difficulty) result = result.filter(r => r.difficulty === filters.difficulty);
      if (filters.diet) result = result.filter(r => r.tags.diet?.includes(filters.diet));

      // Sort
      switch (sortBy) {
          case 'a-z': result.sort((a, b) => a.recipeTitle.localeCompare(b.recipeTitle)); break;
          case 'z-a': result.sort((a, b) => b.recipeTitle.localeCompare(a.recipeTitle)); break;
          case 'favorites': result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)); break;
          case 'newest': 
          default: result.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)); break;
      }
      
      return result;
  }, [savedRecipes, debouncedSearchTerm, filters, sortBy]);

  const hasActiveFilters = useMemo(() => {
      return !!(searchTerm || Object.values(filters).some(v => !!v));
  }, [searchTerm, filters]);

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
      />
    );
  }

  if (!savedRecipes) {
      return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin text-[var(--color-accent-500)]" size={48} /></div>;
  }

  return (
    <div className="space-y-8 pb-24">
      <BulkAddToPlanModal 
        isOpen={isBulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        recipeIds={selectedIds}
        onSave={(count) => {
            addToast(`${count} Rezepte zum Plan hinzugefügt.`);
            setBulkModalOpen(false);
            handleToggleSelectMode();
        }}
      />

      <RecipeBookHeader recipes={savedRecipes} />

      <RecipeToolbar 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchInputRef={searchInputRef}
        sortBy={sortBy} setSortBy={setSortBy}
        filters={filters} setFilters={setFilters} clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters} filterOptions={filterOptions}
      />

      {/* Results Area */}
      <div className="relative min-h-[300px]">
          {filteredRecipes.length > 0 ? (
             <RecipeList 
                recipes={filteredRecipes} 
                onSelectRecipe={setSelectedRecipe} 
                isSelectMode={isSelectMode}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                <div className="bg-zinc-900 p-4 rounded-full mb-4">
                    <BookOpen className="h-10 w-10 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-zinc-300">Keine Rezepte gefunden</h3>
                <p className="mt-1 text-sm text-zinc-500 max-w-md">
                    {savedRecipes.length > 0 ? 'Versuche es mit anderen Filtern oder Suchbegriffen.' : 'Dein Kochbuch ist noch leer. Besuche den KI-Chef, um Rezepte zu erstellen!'}
                </p>
                {hasActiveFilters && (
                    <button onClick={clearFilters} className="mt-6 flex items-center gap-2 bg-zinc-800 text-zinc-200 font-medium py-2 px-4 rounded-lg hover:bg-zinc-700 transition-colors">
                        <ListFilter size={16} /> Filter zurücksetzen
                    </button>
                )}
            </div>
          )}
      </div>

      {/* Selection Mode Toggle & Floating Bar */}
      {!isSelectMode && filteredRecipes.length > 0 && (
          <div className="fixed bottom-24 right-4 md:right-8 z-30">
              <button 
                onClick={handleToggleSelectMode}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 shadow-lg transition-all"
                title="Auswahlmodus starten"
              >
                  <CheckSquare size={20}/>
              </button>
          </div>
      )}

      {isSelectMode && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40 page-fade-in">
             <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-2xl p-3 shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 px-2">
                    <button onClick={handleToggleSelectMode} className="p-1 text-zinc-400 hover:text-zinc-200"><X size={20}/></button>
                    <span className="font-medium text-zinc-200 text-sm">{selectedIds.length} ausgewählt</span>
                </div>
                <button 
                    onClick={() => setBulkModalOpen(true)} 
                    disabled={selectedIds.length === 0}
                    className="flex items-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-2 px-4 rounded-xl hover:bg-[var(--color-accent-400)] transition-colors disabled:bg-zinc-800 disabled:text-zinc-600 text-sm"
                >
                    <CalendarPlus size={18}/> Zum Plan
                </button>
             </div>
          </div>
      )}
    </div>
  );
};

export default RecipeBook;