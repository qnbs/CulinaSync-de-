import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/services/db';
import { Recipe, PantryItem } from '@/types';
import RecipeList from '@/components/RecipeList';
import RecipeDetail from '@/components/RecipeDetail';
import { BookOpen, Search, X, ListFilter, Star, CheckSquare, CalendarPlus, LoaderCircle, CookingPot } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { checkRecipePantryMatch } from '@/services/utils';

interface BulkAddToPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipeIds: number[];
    onSave: (count: number) => void;
}

const BulkAddToPlanModal: React.FC<BulkAddToPlanModalProps> = ({ isOpen, onClose, recipeIds, onSave }) => {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [mealType, setMealType] = useState<'Frühstück' | 'Mittagessen' | 'Abendessen'>('Abendessen');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const date = new Date(startDate);
        // Adjust for timezone offset
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

        for (const recipeId of recipeIds) {
            const dateString = date.toISOString().split('T')[0];
            await db.mealPlan.add({ recipeId, date: dateString, mealType, isCooked: false });
            date.setDate(date.getDate() + 1); // Increment day for the next recipe
        }
        setIsSaving(false);
        onSave(recipeIds.length);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 page-fade-in" onClick={onClose}>
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Rezepte zum Plan hinzufügen</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-zinc-400 mb-1">Startdatum</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500"/>
                    </div>
                    <div>
                        <label htmlFor="mealType" className="block text-sm font-medium text-zinc-400 mb-1">Mahlzeit</label>
                        <select id="mealType" value={mealType} onChange={e => setMealType(e.target.value as any)} className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500">
                            <option>Abendessen</option>
                            <option>Mittagessen</option>
                            <option>Frühstück</option>
                        </select>
                    </div>
                    <p className="text-xs text-zinc-500">Die {recipeIds.length} Rezepte werden ab dem {new Date(startDate).toLocaleDateString('de-DE')} als aufeinanderfolgende '{mealType}' geplant.</p>
                </div>
                <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-zinc-700">
                    <button onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                    <button onClick={handleSave} disabled={isSaving} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 flex items-center gap-2 disabled:bg-zinc-600">
                        {isSaving && <LoaderCircle size={18} className="animate-spin" />}
                        Hinzufügen
                    </button>
                </div>
            </div>
        </div>
    );
};


interface RecipeBookProps {
    initialSearchTerm?: string;
    initialSelectedId?: number | null;
    focusAction?: string | null;
    onActionHandled?: () => void;
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    voiceAction?: {type: string, payload: any} | null;
}

const RecipeBook: React.FC<RecipeBookProps> = ({ initialSearchTerm, initialSelectedId, focusAction, onActionHandled, addToast, voiceAction }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const savedRecipes = useLiveQuery(() => db.recipes.toArray(), []);
  const pantryItems = useLiveQuery(() => db.pantry.toArray(), []);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState('newest');
  const [courseFilter, setCourseFilter] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [mainIngredientFilter, setMainIngredientFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [dietFilter, setDietFilter] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [pantryFilter, setPantryFilter] = useState(false);

  // Bulk add state
  const [isSelectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkModalOpen, setBulkModalOpen] = useState(false);

  const handleToggleSelectMode = () => {
    setSelectMode(!isSelectMode);
    setSelectedIds([]); // Reset selection when toggling mode
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
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    if (focusAction === 'search' && searchInputRef.current) {
        searchInputRef.current.focus();
        onActionHandled?.();
    }
  }, [focusAction, onActionHandled]);

  useEffect(() => {
    if (initialSelectedId && savedRecipes) {
      const recipeToSelect = savedRecipes.find(r => r.id === initialSelectedId);
      if (recipeToSelect) {
        setSelectedRecipe(recipeToSelect);
      }
    }
  }, [initialSelectedId, savedRecipes]);

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
    setCourseFilter('');
    setCuisineFilter('');
    setMainIngredientFilter('');
    setDifficultyFilter('');
    setDietFilter('');
    setShowFavoritesOnly(false);
    setPantryFilter(false);
  };

  const filteredRecipes = useLiveQuery(
    async () => {
      if (!pantryItems) return [];
  
      let collection = db.recipes.toCollection();
  
      if (showFavoritesOnly) collection = collection.filter(r => !!r.isFavorite);
      if (courseFilter) collection = collection.filter(r => r.tags.course.includes(courseFilter));
      if (cuisineFilter) collection = collection.filter(r => r.tags.cuisine.includes(cuisineFilter));
      if (mainIngredientFilter) collection = collection.filter(r => r.tags.mainIngredient.includes(mainIngredientFilter));
      if (difficultyFilter) collection = collection.filter(r => r.difficulty === difficultyFilter);
      if (dietFilter) collection = collection.filter(r => r.tags.diet.includes(dietFilter));
  
      let recipes = await collection.toArray();
  
      if (pantryFilter) {
        recipes = recipes.filter(r => {
          const match = checkRecipePantryMatch(r, pantryItems);
          return match.have === match.total;
        });
      }
      if (debouncedSearchTerm) {
        const lowerCaseSearch = debouncedSearchTerm.toLowerCase();
        recipes = recipes.filter(r => r.recipeTitle.toLowerCase().includes(lowerCaseSearch));
      }
  
      switch (sortBy) {
        case 'a-z':
          return recipes.sort((a, b) => a.recipeTitle.localeCompare(b.recipeTitle));
        case 'z-a':
          return recipes.sort((a, b) => b.recipeTitle.localeCompare(a.recipeTitle));
        case 'favorites':
          return recipes.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
        case 'newest':
        default:
          return recipes.sort((a, b) => (b.updatedAt ?? b.id ?? 0) - (a.updatedAt ?? a.id ?? 0));
      }
    },
    [
      pantryItems,
      debouncedSearchTerm,
      sortBy,
      courseFilter,
      cuisineFilter,
      mainIngredientFilter,
      difficultyFilter,
      dietFilter,
      showFavoritesOnly,
      pantryFilter,
    ],
    []
  );


  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
        addToast={addToast}
        voiceAction={voiceAction}
      />
    );
  }
  
  const hasActiveFilters = searchTerm || sortBy !== 'newest' || courseFilter || cuisineFilter || mainIngredientFilter || difficultyFilter || dietFilter || showFavoritesOnly || pantryFilter;

  return (
    <div className="space-y-8 pb-24">
      <BulkAddToPlanModal 
        isOpen={isBulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        recipeIds={selectedIds}
        onSave={(count) => {
            addToast(`${count} Rezepte zum Plan hinzugefügt.`);
            setBulkModalOpen(false);
            handleToggleSelectMode(); // Exit select mode
        }}
      />

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
             <select onChange={e => setDietFilter(e.target.value)} value={dietFilter} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" aria-label="Nach Ernährungsweise filtern">
              <option value="">Alle Ernährungsweisen</option>
              {filterOptions.diets.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button onClick={clearFilters} disabled={!hasActiveFilters} className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-semibold disabled:text-zinc-600 disabled:cursor-not-allowed">
                    <X size={16} /> Alle Filter zurücksetzen
                </button>
                <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={pantryFilter} onChange={() => setPantryFilter(!pantryFilter)} className="h-4 w-4 rounded bg-zinc-700 border-zinc-600 text-amber-500 focus:ring-amber-500"/>
                        <span className="text-zinc-300 text-sm font-medium flex items-center gap-1"><CookingPot size={14} className="text-amber-400" /> Nur Kochbereite</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={showFavoritesOnly} onChange={() => setShowFavoritesOnly(!showFavoritesOnly)} className="h-4 w-4 rounded bg-zinc-700 border-zinc-600 text-amber-500 focus:ring-amber-500"/>
                        <span className="text-zinc-300 text-sm font-medium flex items-center gap-1"><Star size={14} className="text-amber-400" /> Nur Favoriten</span>
                    </label>
                     <button onClick={handleToggleSelectMode} className={`flex items-center gap-2 text-sm font-semibold py-1 px-3 rounded-md transition-colors ${isSelectMode ? 'bg-amber-500 text-zinc-900' : 'text-amber-400 hover:text-amber-300'}`}>
                        <CheckSquare size={16} /> {isSelectMode ? 'Abbrechen' : 'Auswählen'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {filteredRecipes && pantryItems ? (
        filteredRecipes.length > 0 ? (
        <RecipeList 
            recipes={filteredRecipes} 
            pantryItems={pantryItems}
            onSelectRecipe={setSelectedRecipe} 
            isSelectMode={isSelectMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
        />
        ) : (
            <div className="text-center py-20 bg-zinc-950/50 border border-zinc-800 rounded-lg">
                <BookOpen className="mx-auto h-12 w-12 text-zinc-600" />
                <h3 className="mt-4 text-lg font-medium text-zinc-300">
                {savedRecipes && savedRecipes.length > 0 ? 'Keine Rezepte entsprechen deiner Suche' : 'Dein Kochbuch ist leer'}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 max-w-md mx-auto">
                {savedRecipes && savedRecipes.length > 0
                  ? 'Versuche, deine Filterauswahl anzupassen oder die Suche zurückzusetzen.'
                  : 'Gehe zum KI-Chef, um dein erstes Rezept zu generieren. Gespeicherte Rezepte erscheinen hier.'
                }
                </p>
                {savedRecipes && savedRecipes.length > 0 && hasActiveFilters && (
                    <button onClick={clearFilters} className="mt-6 flex mx-auto items-center gap-2 bg-amber-500 text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400 transition-colors">
                        <ListFilter size={18} /> Filter zurücksetzen
                    </button>
                )}
            </div>
        )
      ) : (
        <div className="text-center p-12"><LoaderCircle className="mx-auto animate-spin text-amber-500" size={32} /></div>
      )}

      {isSelectMode && selectedIds.length > 0 && (
          <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 bg-zinc-800/80 backdrop-blur-md border border-zinc-700 rounded-lg p-3 flex justify-between items-center w-full max-w-sm shadow-xl page-fade-in z-20">
              <span className="font-semibold text-zinc-200">{selectedIds.length} Rezept(e) ausgewählt</span>
              <button onClick={() => setBulkModalOpen(true)} className="flex items-center gap-2 bg-amber-500 text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400 transition-colors">
                  <CalendarPlus size={18}/> Zum Plan
              </button>
          </div>
      )}
    </div>
  );
};

export default RecipeBook;