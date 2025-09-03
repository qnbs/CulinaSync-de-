import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, markMealAsCooked, removeRecipeFromMealPlan, addRecipeToMealPlan, addMissingIngredientsForMeals, addMissingIngredientsToShoppingList } from '@/services/db';
import { Recipe, MealPlanItem, PantryItem } from '@/types';
import { ChevronLeft, ChevronRight, Search, CheckCircle, Trash2, ShoppingCart, Info, X, Star, BookOpen, MoreVertical, PlusCircle, Square, CheckSquare, FileText, CookingPot, LoaderCircle, GripVertical, Minus, Plus, X as XIcon, Filter } from 'lucide-react';
import RecipeCard from '@/components/RecipeCard';
import RecipeDetail from '@/components/RecipeDetail';
import { useSettings } from '@/contexts/SettingsContext';
import { useDebounce } from '@/hooks/useDebounce';

// Helper to calculate pantry status for a recipe
const getPantryStatus = (recipe: Recipe, pantryMap: Map<string, number>): { status: 'ok' | 'partial' | 'missing' | 'unknown', missing: string[], missingCount: number, totalCount: number } => {
  const allIngredients = recipe.ingredients.flatMap(g => g.items);
  if (allIngredients.length === 0) return { status: 'ok', missing: [], missingCount: 0, totalCount: 0 };

  const missingIngredients: string[] = [];
  allIngredients.forEach(ing => {
    if (ing.name.toLowerCase().includes('optional') || ing.name.toLowerCase().includes('nach geschmack')) return;
    const pantryQty = pantryMap.get(ing.name.toLowerCase()) || 0;
    if (pantryQty <= 0) {
      missingIngredients.push(ing.name);
    }
  });
  
  const missingCount = missingIngredients.length;
  const totalCount = allIngredients.length;

  if (missingCount === 0) return { status: 'ok', missing: [], missingCount, totalCount };
  if (missingCount / totalCount <= 0.3) return { status: 'partial', missing: missingIngredients, missingCount, totalCount };
  return { status: 'missing', missing: missingIngredients, missingCount, totalCount };
};


// MODALS AND SUB-COMPONENTS
const RecipePickerModal: React.FC<{ isOpen: boolean; onClose: () => void; onSelectRecipe: (recipeId: number) => void; onAddNote: (note: string) => void; recipes: Recipe[];}> = ({ isOpen, onClose, onSelectRecipe, onAddNote, recipes }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [note, setNote] = useState('');
    const [view, setView] = useState<'recipe' | 'note'>('recipe');

    const filteredRecipes = useMemo(() => {
        return recipes.filter(r => r.recipeTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [recipes, searchTerm]);

    const handleAddNote = () => {
        if(note.trim()) {
            onAddNote(note.trim());
            setNote('');
        }
    };
    
    useEffect(() => { if(isOpen) { setView('recipe'); setSearchTerm(''); setNote(''); } }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 page-fade-in" onClick={onClose}>
            <div className="bg-zinc-800 rounded-lg p-4 w-full max-w-2xl shadow-xl flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-zinc-100">{view === 'recipe' ? 'Rezept auswählen' : 'Notiz hinzufügen'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-700"><X size={20}/></button>
                </div>
                 <div className="flex border-b border-zinc-700 mb-4">
                    <button onClick={() => setView('recipe')} className={`py-2 px-4 text-sm font-semibold ${view === 'recipe' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-zinc-400'}`}>Rezepte</button>
                    <button onClick={() => setView('note')} className={`py-2 px-4 text-sm font-semibold ${view === 'note' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-zinc-400'}`}>Notiz</button>
                </div>

                {view === 'recipe' ? (
                    <>
                        <div className="relative mb-4">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                           <input type="text" placeholder="Rezepte durchsuchen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-700 border-zinc-600 rounded-md py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-amber-500" />
                        </div>
                        <div className="overflow-y-auto flex-grow pr-2 -mr-2 space-y-4">
                            {filteredRecipes.length > 0 ? filteredRecipes.map(recipe => (
                                <div key={recipe.id} onClick={() => onSelectRecipe(recipe.id!)} className="cursor-pointer">
                                    <RecipeCard recipe={recipe} size="small" />
                                </div>
                            )) : <p className="text-center text-zinc-500 py-10">Keine Rezepte gefunden.</p>}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-4 p-4">
                        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="z.B. Reste essen, Essen gehen..." className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500" rows={4}/>
                        <button onClick={handleAddNote} className="bg-amber-500 text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400 self-end">Notiz speichern</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const GenerateShoppingListModal: React.FC<{isOpen: boolean, onClose: () => void, meals: MealPlanItem[], recipes: Map<number, Recipe>, onGenerate: (ids: number[]) => void}> = ({ isOpen, onClose, meals, recipes, onGenerate }) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    
    useEffect(() => { if (isOpen) setSelectedIds(meals.map(m => m.id!)); }, [isOpen, meals]);
    
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md shadow-xl flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Liste generieren</h3>
            <p className="text-zinc-400 text-sm mb-4">Wähle die Mahlzeiten aus, für die du fehlende Zutaten zur Einkaufsliste hinzufügen möchtest.</p>
            <div className="overflow-y-auto flex-grow border-y border-zinc-700 py-2 my-2 -mx-6 px-6">
                {meals.map(meal => {
                    const recipe = meal.recipeId ? recipes.get(meal.recipeId) : null;
                    if (!recipe) return null;
                    const isSelected = selectedIds.includes(meal.id!);
                    return (
                        <div key={meal.id} onClick={() => setSelectedIds(p => isSelected ? p.filter(id => id !== meal.id) : [...p, meal.id!])} className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-zinc-700">
                            {isSelected ? <CheckSquare className="text-amber-400"/> : <Square className="text-zinc-500"/>}
                            <div>
                                <p className="font-semibold text-zinc-200">{recipe.recipeTitle}</p>
                                <p className="text-xs text-zinc-400">{new Date(meal.date).toLocaleDateString('de-DE', {weekday: 'long'})}, {meal.mealType}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
             <div className="flex justify-end gap-3 pt-4">
                <button onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                <button onClick={() => onGenerate(selectedIds)} disabled={selectedIds.length === 0} className="py-2 px-4 rounded bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 disabled:bg-zinc-600">Liste generieren</button>
            </div>
        </div>
      </div>
    );
};

const PlannedMealCard = React.memo<{ meal: MealPlanItem; recipe: Recipe | undefined; pantryMap: Map<string, number>; isToday: boolean; onAction: (action: string, payload: any) => void; onDragStart: (e: React.DragEvent, meal: MealPlanItem) => void; onCook: (recipe: Recipe) => void;}>(({ meal, recipe, pantryMap, isToday, onAction, onDragStart, onCook }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (meal.note) {
        return (
             <div className="p-3 rounded-lg bg-zinc-700/50 border border-dashed border-zinc-600 flex items-start gap-3 relative group">
                <FileText size={18} className="text-zinc-400 mt-0.5 flex-shrink-0"/>
                <p className="text-sm text-zinc-300 flex-grow italic">{meal.note}</p>
                 <button onClick={() => onAction('remove', meal)} className="absolute top-1 right-1 p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
            </div>
        )
    }

    if (!recipe) return null;

    const pantryStatus = getPantryStatus(recipe, pantryMap);
    const statusConfig = {
        ok: { color: 'bg-green-500', title: 'Alle Zutaten im Vorrat' },
        partial: { color: 'bg-yellow-500', title: `Fehlt: ${pantryStatus.missing.slice(0, 3).join(', ')}...` },
        missing: { color: 'bg-red-500', title: `Fehlt: ${pantryStatus.missing.slice(0, 3).join(', ')}...` },
        unknown: { color: 'bg-zinc-600', title: 'Status unbekannt' },
    };

    return (
        <div draggable={!meal.isCooked} onDragStart={(e) => onDragStart(e, meal)}
             className={`p-3 rounded-lg group relative transition-all duration-300 flex flex-col gap-2 ${meal.isCooked ? 'bg-zinc-800/80 opacity-60' : 'bg-zinc-800/80 border border-zinc-700 cursor-grab active:cursor-grabbing'}`}>
            <div className="flex items-start gap-2">
                <GripVertical size={18} className="text-zinc-600 flex-shrink-0 cursor-grab group-hover:opacity-100 opacity-0 transition-opacity mt-0.5" />
                <div className="flex-grow">
                    <p className={`font-semibold text-zinc-100 text-sm leading-tight ${meal.isCooked ? 'line-through' : ''}`}>{recipe.recipeTitle}</p>
                     {meal.servings && meal.servings !== parseInt(recipe.servings) && <p className="text-xs text-zinc-400">{meal.servings} Portionen</p>}
                    <div className="flex items-center gap-2 mt-2" title={statusConfig[pantryStatus.status].title}>
                        <div className="w-full bg-zinc-700 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${statusConfig[pantryStatus.status].color}`} style={{width: `${(pantryStatus.totalCount - pantryStatus.missingCount) / pantryStatus.totalCount * 100}%`}}></div></div>
                        <span className="text-xs text-zinc-400">{pantryStatus.totalCount > 0 ? `${pantryStatus.totalCount - pantryStatus.missingCount}/${pantryStatus.totalCount}`: ''}</span>
                    </div>
                </div>
                 <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(p => !p)} className={`p-1 rounded-full ${isMenuOpen ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white group-hover:opacity-100 opacity-0'}`}><MoreVertical size={16}/></button>
                    {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg w-48 z-20 page-fade-in">
                            <button onClick={() => { onAction('view', recipe); setMenuOpen(false); }} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-zinc-700"><BookOpen size={14}/> Ansehen</button>
                            <button onClick={() => { onAction('add_missing', recipe.id); setMenuOpen(false); }} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-zinc-700"><ShoppingCart size={14}/> Fehlendes kaufen</button>
                            {!meal.isCooked && <button onClick={() => { onAction('cooked', meal); setMenuOpen(false); }} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-zinc-700 text-green-400"><CheckCircle size={14}/> Gekocht</button>}
                            <button onClick={() => { onAction('remove', meal); setMenuOpen(false); }} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-zinc-700 text-red-400"><Trash2 size={14}/> Entfernen</button>
                        </div>
                    )}
                </div>
            </div>
            {isToday && !meal.isCooked && <button onClick={() => onCook(recipe)} className="mt-2 w-full flex items-center justify-center gap-2 text-sm bg-amber-600/80 text-white font-semibold py-1 px-2 rounded-md hover:bg-amber-600 transition-colors"><CookingPot size={14}/> Kochen</button>}
            {meal.isCooked && <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center"><CheckCircle className="text-green-400" size={24}/></div>}
        </div>
    );
});

const CookModeView: React.FC<{ recipe: Recipe, currentStep: number, setCurrentStep: (updater: (s: number) => number) => void, onExit: () => void }> = ({ recipe, currentStep, setCurrentStep, onExit }) => (
    <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col p-4 sm:p-8 text-zinc-100 font-sans">
        <header className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-xl font-bold text-amber-400 truncate pr-4">{recipe.recipeTitle}</h3>
            <button onClick={onExit} className="flex items-center gap-2 py-2 px-4 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors">
                <XIcon size={18} /> <span className="hidden sm:inline">Kochmodus beenden</span>
            </button>
        </header>
        <div className="flex-grow flex flex-col justify-center items-center text-center overflow-y-auto">
            <p className="text-zinc-400 mb-4 font-semibold">Schritt {currentStep + 1} von {recipe.instructions.length}</p>
            <p className="text-2xl md:text-4xl leading-relaxed max-w-4xl animate-fade-in">{recipe.instructions[currentStep]}</p>
        </div>
        <footer className="flex justify-center items-center gap-4 pt-4 flex-shrink-0">
            <button onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 0} className="py-3 px-6 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 transition-colors">Zurück</button>
            <span className="font-bold text-lg tabular-nums">{currentStep + 1} / {recipe.instructions.length}</span>
            <button onClick={() => setCurrentStep(s => s + 1)} disabled={currentStep >= recipe.instructions.length - 1} className="py-3 px-6 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 disabled:opacity-50 transition-colors">Weiter</button>
        </footer>
    </div>
);

const AddMealModal: React.FC<{ state: { recipe?: Recipe; date: string; mealType: string }; onClose: () => void; onSave: (item: Omit<MealPlanItem, 'id'>) => void; }> = ({ state, onClose, onSave }) => {
    const defaultServings = parseInt(state.recipe?.servings || '2');
    const [servings, setServings] = useState(defaultServings);

    useEffect(() => {
        setServings(parseInt(state.recipe?.servings || '2'))
    }, [state.recipe]);

    const handleSave = () => {
        if (!state.recipe) return;
        onSave({
            recipeId: state.recipe.id!,
            date: state.date,
            mealType: state.mealType as any,
            servings: servings,
            isCooked: false
        });
    };

    if (!state.recipe) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-1">Zum Plan hinzufügen</h3>
                <p className="text-amber-400 font-semibold mb-4">{state.recipe.recipeTitle}</p>
                <div className="space-y-4">
                     <p className="text-sm text-zinc-300">Am {new Date(state.date).toLocaleDateString('de-DE', {weekday: 'long', day: 'numeric', month: 'long'})} als {state.mealType}.</p>
                    <div className="flex items-center justify-center gap-4">
                         <label htmlFor="servings-input" className="font-semibold text-zinc-200">Portionen:</label>
                         <div className="flex items-center gap-2">
                             <button onClick={() => setServings(s => Math.max(1, s - 1))} className="p-2 rounded-full bg-zinc-700 hover:bg-zinc-600"><Minus size={18} /></button>
                             <input id="servings-input" type="number" value={servings} onChange={(e) => setServings(parseInt(e.target.value, 10) || 1)} className="w-16 text-center bg-zinc-900 border border-zinc-700 rounded-md p-2 font-bold text-lg text-amber-400"/>
                             <button onClick={() => setServings(s => s + 1)} className="p-2 rounded-full bg-zinc-700 hover:bg-zinc-600"><Plus size={18} /></button>
                         </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                        <button onClick={handleSave} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400">Hinzufügen</button>
                    </div>
                </div>
            </div>
        </div>
    )
};


// MAIN COMPONENT
const MealPlanner: React.FC<{ addToast: (message: string, type?: 'success' | 'error') => void; }> = ({ addToast }) => {
    const [weekOffset, setWeekOffset] = useState(0);
    const [showRecipeDetail, setShowRecipeDetail] = useState<Recipe | null>(null);
    const [draggedMeal, setDraggedMeal] = useState<MealPlanItem | null>(null);
    const [dropTarget, setDropTarget] = useState<{ date: string; mealType: string } | null>(null);
    const [pickerState, setPickerState] = useState<{isOpen: boolean, date: string, mealType: string} | null>(null);
    const [addMealState, setAddMealState] = useState<{isOpen: boolean, recipeId?: number, date?: string, mealType?: string}>({isOpen: false});
    const [genListModalOpen, setGenListModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
    const [cookingStep, setCookingStep] = useState(0);
    const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
    const debouncedSidebarSearch = useDebounce(sidebarSearchTerm, 300);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const { settings } = useSettings();
    const allRecipes = useLiveQuery(() => db.recipes.toArray(), []);
    const pantryItems = useLiveQuery(() => db.pantry.toArray(), []);
    
    const weekStartDay = useMemo(() => settings.weekStart, [settings.weekStart]);
    const week = useMemo(() => {
        const start = new Date();
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 && weekStartDay === 'Monday' ? -6 : (weekStartDay === 'Monday' ? 1 : 0));
        const weekStart = new Date(start.setDate(diff));
        weekStart.setHours(0,0,0,0);
        weekStart.setDate(weekStart.getDate() + weekOffset * 7);
        return Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });
    }, [weekOffset, weekStartDay]);

    const weekDateStrings = useMemo(() => week.map(d => d.toISOString().split('T')[0]), [week]);
    const mealPlan = useLiveQuery(() => db.mealPlan.where('date').anyOf(weekDateStrings).toArray(), [weekDateStrings]);

    const recipesById = useMemo(() => new Map<number, Recipe>((allRecipes || []).map(r => [r.id!, r])), [allRecipes]);
    const pantryMap = useMemo(() => new Map<string, number>((pantryItems || []).map(p => [p.name.toLowerCase(), p.quantity])), [pantryItems]);
    
    const sidebarRecipes = useMemo(() => {
        if (!allRecipes) return [];
        return allRecipes
            .filter(r => showFavoritesOnly ? r.isFavorite : true)
            .filter(r => r.recipeTitle.toLowerCase().includes(debouncedSidebarSearch.toLowerCase()));
    }, [allRecipes, debouncedSidebarSearch, showFavoritesOnly]);
    
    const handleAction = useCallback(async (action: string, payload: any) => {
        if (action === 'view') setShowRecipeDetail(payload);
        else if (action === 'remove') {
            if (window.confirm(`Eintrag wirklich aus dem Plan entfernen?`)) {
                await removeRecipeFromMealPlan(payload.id);
                addToast(`Eintrag entfernt.`);
            }
        } else if (action === 'cooked') {
            const { success, changes } = await markMealAsCooked(payload.id);
            if (success) {
                let msg = `"${recipesById.get(payload.recipeId)?.recipeTitle}" als gekocht markiert.`;
                if(changes && (changes.updated.length > 0 || changes.deleted.length > 0)) msg += ` Vorrat aktualisiert.`;
                addToast(msg);
            }
        } else if (action === 'add_missing') {
            const count = await addMissingIngredientsToShoppingList(payload);
            addToast(count > 0 ? `${count} Artikel zur Einkaufsliste hinzugefügt.` : 'Alle Zutaten sind bereits vorhanden!');
        }
    }, [addToast, recipesById]);
    
    const handleGenerateList = async (mealIds: number[]) => {
        setIsGenerating(true);
        const { added, existing } = await addMissingIngredientsForMeals(mealIds);
        let msg = '';
        if (added > 0) msg += `${added} neue Artikel zur Einkaufsliste hinzugefügt.`;
        if (existing > 0) msg += ` ${existing} benötigte Artikel waren bereits auf der Liste.`;
        if (!msg) msg = 'Alle Zutaten für die ausgewählten Mahlzeiten sind im Vorrat vorhanden!';
        addToast(msg);
        setIsGenerating(false);
        setGenListModalOpen(false);
    };

    const handleDrop = async (e: React.DragEvent, date: string, mealType: 'Frühstück' | 'Mittagessen' | 'Abendessen') => {
        e.preventDefault();
        setDropTarget(null);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.type === 'mealPlanItem') {
                await db.mealPlan.update(data.id, { date, mealType });
            } else if (data.type === 'recipe') {
                setAddMealState({ isOpen: true, recipeId: data.id, date, mealType });
            }
        } catch (error) { console.error("Drop failed:", error) }
        setDraggedMeal(null);
    };

    const handleSelectRecipeForSlot = (recipeId: number) => {
        if (!pickerState) return;
        setPickerState(null);
        setAddMealState({isOpen: true, recipeId, date: pickerState.date, mealType: pickerState.mealType });
    };

    const handleAddNoteForSlot = async (note: string) => {
        if (!pickerState) return;
        await addRecipeToMealPlan({ note, date: pickerState.date, mealType: pickerState.mealType as any, isCooked: false });
        setPickerState(null);
    };
    
    const handleSaveNewMeal = async (item: Omit<MealPlanItem, 'id'>) => {
        await addRecipeToMealPlan(item as MealPlanItem);
        setAddMealState({isOpen: false});
    };

    const handleStartCookMode = (recipe: Recipe) => {
        setCookingRecipe(recipe);
        setCookingStep(0);
    };

    if (showRecipeDetail) return <RecipeDetail recipe={showRecipeDetail} onBack={() => setShowRecipeDetail(null)} />;
    if (cookingRecipe) return <CookModeView recipe={cookingRecipe} currentStep={cookingStep} setCurrentStep={setCookingStep} onExit={() => setCookingRecipe(null)} />;

    return (
      <div className="space-y-8">
        <RecipePickerModal isOpen={!!pickerState} onClose={() => setPickerState(null)} onSelectRecipe={handleSelectRecipeForSlot} onAddNote={handleAddNoteForSlot} recipes={allRecipes || []} />
        <GenerateShoppingListModal isOpen={genListModalOpen} onClose={() => setGenListModalOpen(false)} meals={mealPlan?.filter(m => m.recipeId && !m.isCooked) || []} recipes={recipesById} onGenerate={handleGenerateList} />
        {/* FIX: Correctly construct the `state` prop for AddMealModal to satisfy type requirements. */}
        {(() => {
            if (addMealState.isOpen && addMealState.recipeId && addMealState.date && addMealState.mealType) {
                const recipe = recipesById.get(addMealState.recipeId);
                if (recipe) {
                    return <AddMealModal state={{ recipe, date: addMealState.date, mealType: addMealState.mealType }} onClose={() => setAddMealState({ isOpen: false })} onSave={handleSaveNewMeal} />;
                }
            }
            return null;
        })()}
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Essensplaner</h2>
                <p className="text-zinc-400 mt-1">Plane Mahlzeiten per Drag & Drop aus deiner Rezeptsammlung.</p>
            </div>
            <button onClick={() => setGenListModalOpen(true)} disabled={isGenerating} className="flex items-center justify-center gap-2 bg-amber-500 text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400 transition-colors disabled:bg-zinc-600">
                {isGenerating ? <LoaderCircle size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                Einkaufsliste für Woche generieren
            </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
            <main className="flex-grow">
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4">
                     <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-2 rounded-md hover:bg-zinc-700"><ChevronLeft/></button>
                        <h3 className="text-lg font-semibold text-zinc-100 text-center">{week[0].toLocaleDateString('de-DE', {day: '2-digit', month: 'short'})} - {week[6].toLocaleDateString('de-DE', {day: '2-digit', month: 'short', year: 'numeric'})}</h3>
                        <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 rounded-md hover:bg-zinc-700"><ChevronRight/></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
                        {week.map(day => {
                            const dateString = day.toISOString().split('T')[0];
                            const dayMeals = mealPlan?.filter(item => item.date === dateString) || [];
                            const isToday = new Date().toISOString().split('T')[0] === dateString;
                            return (
                                <div key={dateString} className={`rounded-lg p-3 flex flex-col gap-4 ${isToday ? 'bg-zinc-800/50' : 'bg-zinc-900'}`}>
                                    <h4 className={`font-bold text-center ${isToday ? 'text-amber-400' : 'text-zinc-300'}`}>{day.toLocaleDateString('de-DE', { weekday: 'short' })} <span className="text-zinc-400 font-normal">{day.getDate()}.</span></h4>
                                     {(['Frühstück', 'Mittagessen', 'Abendessen'] as const).map(mealType => {
                                        const mealsInSlot = dayMeals.filter(m => m.mealType === mealType);
                                        const isTarget = dropTarget?.date === dateString && dropTarget?.mealType === mealType;
                                        return (
                                            <div key={mealType} onDragOver={(e) => { e.preventDefault(); setDropTarget({ date: dateString, mealType }); }} onDragLeave={() => setDropTarget(null)} onDrop={(e) => handleDrop(e, dateString, mealType)} 
                                                className={`rounded-lg min-h-[100px] flex flex-col gap-2 p-2 transition-colors ${isTarget ? 'bg-amber-900/50 ring-2 ring-amber-500' : ''}`}>
                                                <p className="text-xs font-semibold text-zinc-500">{mealType}</p>
                                                <div className="space-y-2 flex-grow">
                                                    {mealsInSlot.map(meal => <PlannedMealCard key={meal.id} meal={meal} recipe={meal.recipeId ? recipesById.get(meal.recipeId) : undefined} pantryMap={pantryMap} isToday={isToday} onAction={handleAction} onDragStart={(e, m) => { e.dataTransfer.setData('application/json', JSON.stringify({type: 'mealPlanItem', id: m.id})); setDraggedMeal(m);}} onCook={handleStartCookMode} /> )}
                                                    <button onClick={() => setPickerState({isOpen: true, date: dateString, mealType})} className="w-full text-zinc-500 border-2 border-dashed border-zinc-700 rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-amber-400 hover:border-amber-500 transition-colors">
                                                        <PlusCircle size={16}/> Mahlzeit
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                     })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
            <aside className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
                 <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 sticky top-20">
                     <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><BookOpen />Rezeptbuch</h3>
                     <div className="flex gap-2 mb-4">
                        <div className="relative flex-grow"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} /><input type="text" placeholder="Suchen..." value={sidebarSearchTerm} onChange={e => setSidebarSearchTerm(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-amber-500" /></div>
                        <button onClick={() => setShowFavoritesOnly(p => !p)} className={`p-2 rounded-md ${showFavoritesOnly ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-300'}`} title="Nur Favoriten"><Star size={18}/></button>
                     </div>
                     <div className="h-[60vh] overflow-y-auto space-y-4 pr-2 -mr-2">
                        {sidebarRecipes?.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} size="small" isDraggable={true} onSelectRecipe={setShowRecipeDetail}/>)}
                     </div>
                 </div>
            </aside>
        </div>
      </div>
    );
};

export default MealPlanner;
