import React, { useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, markMealAsCooked, removeRecipeFromMealPlan, addRecipeToMealPlan } from '../services/db';
import { Recipe, MealPlanItem } from '../types';
import { ChevronLeft, ChevronRight, Search, PlusCircle, FileText, Save, ChevronsRight, X as XIcon, CookingPot } from 'lucide-react';
import RecipeCard from './RecipeCard';
import RecipeDetail from './RecipeDetail';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addToast as addToastAction } from '../store/slices/uiSlice';
import PlannedMealCard from './PlannedMealCard';
import { useMealPlan } from '../hooks/useMealPlan';
import CookModeView from './CookModeView';

const AddMealNoteModal: React.FC<{
    date: string;
    mealType: string;
    onClose: () => void;
    onSave: (note: string) => void;
}> = ({ date, mealType, onClose, onSave }) => {
    const [note, setNote] = useState('');

    const handleSave = () => {
        if (note.trim()) {
            onSave(note.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 page-fade-in" onClick={onClose}>
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText size={18}/> Notiz hinzufügen</h3>
                <p className="text-xs text-zinc-400 mb-4">
                    Füge eine kurze Notiz für "{mealType}" am {new Date(date).toLocaleDateString('de-DE')} hinzu (z.B. "Reste essen", "Essen gehen").
                </p>
                <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Deine Notiz..."
                    className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]"
                    rows={3}
                    autoFocus
                />
                <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-zinc-700">
                    <button onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                    <button onClick={handleSave} disabled={!note.trim()} className="py-2 px-4 rounded-md bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] flex items-center gap-2 disabled:bg-zinc-600">
                        <Save size={16}/> Speichern
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper to calculate pantry status for a planned meal using pre-computed data
const getPantryStatusForPlannedMeal = (recipe: Recipe | undefined): { status: 'ok' | 'partial' | 'missing' | 'unknown'; have: number; total: number } => {
    if (!recipe || typeof recipe.pantryMatchPercentage === 'undefined' || typeof recipe.ingredientCount === 'undefined') {
        return { status: 'unknown', have: 0, total: 0 };
    }
    
    const { pantryMatchPercentage, ingredientCount } = recipe;
    
    const have = Math.round(ingredientCount * (pantryMatchPercentage / 100));
    
    let status: 'ok' | 'partial' | 'missing' = 'missing';
    if (pantryMatchPercentage === 100) status = 'ok';
    else if (pantryMatchPercentage >= 70) status = 'partial';
    
    return { status, have, total: ingredientCount };
};


const RecipeSidebar = ({ recipes, onDragStart, isCollapsed, onToggle }: { recipes: Recipe[], onDragStart: (e: React.DragEvent, recipe: Recipe) => void, isCollapsed: boolean, onToggle: () => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredRecipes = useMemo(() => {
        return recipes.filter(r => r.recipeTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [recipes, searchTerm]);
    
    if (isCollapsed) {
        return (
            <div className="bg-zinc-950/50 border-l border-zinc-800 flex flex-col items-center p-2">
                <button onClick={onToggle} title="Rezepte anzeigen" className="p-2 rounded-md hover:bg-zinc-700 text-zinc-400">
                    <ChevronLeft size={20} />
                </button>
            </div>
        )
    }

    return (
        <div className="w-full lg:w-1/3 xl:w-1/4 bg-zinc-950/50 border-l border-zinc-800 p-4 flex flex-col flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Rezepte ziehen</h3>
              <button onClick={onToggle} title="Seitenleiste einklappen" className="p-2 rounded-md hover:bg-zinc-700 text-zinc-400">
                  <ChevronsRight size={20}/>
              </button>
            </div>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input type="text" placeholder="Suchen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-[var(--color-accent-500)]" />
            </div>
            <div className="overflow-y-auto flex-grow pr-2 -mr-2 space-y-3">
                {(filteredRecipes && filteredRecipes.length > 0) ? filteredRecipes.map(recipe => (
                    <div key={recipe.id} draggable onDragStart={(e) => onDragStart(e, recipe)} className="cursor-grab">
                        <RecipeCard recipe={recipe} size="small" />
                    </div>
                )) : <p className="text-sm text-zinc-500 text-center py-4">Keine Rezepte gefunden.</p>}
            </div>
        </div>
    );
};

const MealPlanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
      recipes,
      recipesById,
      week,
      mealsByDate
  } = useMealPlan(currentDate, settings.weekStart === 'Monday');
  
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<Recipe | null>(null);
  const [dropTarget, setDropTarget] = useState<{ date: string; mealType: string } | null>(null);
  const [noteModalState, setNoteModalState] = useState<{isOpen: boolean; date: string; mealType: string} | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCookMode, setIsCookMode] = useState(false);
  const [recipeForCookMode, setRecipeForCookMode] = useState<Recipe | null>(null);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    dispatch(addToastAction({ message, type }));
  };
  
  const weekString = `Woche vom ${week[0].toLocaleDateString('de-DE')} - ${week[6].toLocaleDateString('de-DE')}`;
  
  const handleDragStart = (e: React.DragEvent, recipe: Recipe) => {
    e.dataTransfer.setData('recipeId', recipe.id!.toString());
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (dropTarget) {
        const recipeId = parseInt(e.dataTransfer.getData('recipeId'), 10);
        await addRecipeToMealPlan({ date: dropTarget.date, mealType: dropTarget.mealType as any, recipeId });
    }
    setDropTarget(null);
  };
  
  const handleMealAction = useCallback(async (action: string, payload: Recipe | MealPlanItem) => {
    switch (action) {
        case 'view': setSelectedRecipeForDetail(payload as Recipe); break;
        case 'cook':
            setRecipeForCookMode(payload as Recipe);
            setIsCookMode(true);
            break;
        case 'cooked': {
            const { success, changes } = await markMealAsCooked((payload as MealPlanItem).id!);
            if (success) {
                let message = "Mahlzeit als gekocht markiert.";
                if(changes?.updated.length || changes.deleted.length) {
                    message += ` ${[...changes.updated, ...changes.deleted].length} Artikel im Vorrat angepasst.`
                }
                addToast(message);
            }
            break;
        }
        case 'remove': {
            if(window.confirm("Mahlzeit wirklich aus dem Plan entfernen?")) {
                await removeRecipeFromMealPlan((payload as MealPlanItem).id!);
                addToast("Mahlzeit entfernt.");
            }
            break;
        }
    }
  }, [addToast]);
  
  const handleSaveNote = useCallback(async (note: string, date: string, mealType: string) => {
    await addRecipeToMealPlan({
        date,
        mealType: mealType as any,
        note,
    });
    addToast('Notiz zum Plan hinzugefügt.');
    setNoteModalState(null);
  }, [addToast]);

  const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  if (selectedRecipeForDetail) {
    return <RecipeDetail recipe={selectedRecipeForDetail} onBack={() => setSelectedRecipeForDetail(null)} />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8rem)]">
         {isCookMode && recipeForCookMode && <CookModeView recipe={recipeForCookMode} onExit={() => setIsCookMode(false)} />}
         {noteModalState?.isOpen && (
            <AddMealNoteModal
                date={noteModalState.date}
                mealType={noteModalState.mealType}
                onClose={() => setNoteModalState(null)}
                onSave={(note) => handleSaveNote(note, noteModalState.date, noteModalState.mealType)}
            />
        )}

        <div className="flex-grow flex flex-col space-y-4 overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">Essensplaner</h2>
                    <p className="text-zinc-400 mt-1">Plane Mahlzeiten per Drag & Drop oder füge Notizen hinzu.</p>
                </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-zinc-950/50 border border-zinc-800 rounded-lg flex-shrink-0">
                <button onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() - 7)))} className="p-2 rounded-md hover:bg-zinc-700"><ChevronLeft/></button>
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-center">
                  <h3 className="font-semibold text-base sm:text-lg text-zinc-100 tabular-nums">{weekString}</h3>
                  <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold py-1 px-3 rounded-md bg-zinc-700 hover:bg-zinc-600 text-[var(--color-accent-300)]">Heute</button>
                </div>
                <button onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() + 7)))} className="p-2 rounded-md hover:bg-zinc-700"><ChevronRight/></button>
            </div>
       
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex-grow">
                <div className="flex overflow-x-auto lg:grid lg:grid-cols-7 gap-px">
                  {week.map(date => {
                      const dateString = date.toISOString().split('T')[0];
                      const today = isToday(date);
                      return (
                          <div key={dateString} className={`flex flex-col w-4/5 min-w-[280px] sm:min-w-[320px] lg:w-auto lg:min-w-0 flex-shrink-0 ${today ? 'bg-zinc-800/50' : 'bg-zinc-900'}`}>
                              <div className={`text-center py-2 font-semibold text-sm border-b border-zinc-800 ${today ? 'text-[var(--color-accent-400)]' : 'text-zinc-300'}`}>
                                  <div>{date.toLocaleDateString('de-DE', { weekday: 'short' })}</div>
                                  <div className="text-xs text-zinc-400">{date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</div>
                              </div>
                              <div className="flex flex-col gap-px flex-grow">
                                  {(['Frühstück', 'Mittagessen', 'Abendessen'] as const).map(mealType => {
                                      const meal = mealsByDate[`${dateString}-${mealType}`];
                                      const recipe = meal?.recipeId ? recipesById.get(meal.recipeId) : undefined;
                                      const isDropTarget = dropTarget?.date === dateString && dropTarget.mealType === mealType;
                                      return (
                                          <div 
                                              key={mealType} 
                                              className={`p-2 min-h-[120px] flex flex-col justify-start transition-colors group flex-grow ${isDropTarget ? 'bg-[var(--color-accent-500)]/20' : ''}`}
                                              onDragOver={e => { e.preventDefault(); setDropTarget({ date: dateString, mealType }); }}
                                              onDragLeave={() => setDropTarget(null)}
                                              onDrop={handleDrop}
                                          >
                                              <span className="text-xs text-zinc-500">{mealType}</span>
                                              {meal ? <PlannedMealCard meal={meal} recipe={recipe} pantryStatus={getPantryStatusForPlannedMeal(recipe)} onAction={handleMealAction} />
                                              : <div className="w-full h-full flex items-center justify-center text-zinc-600 rounded-md ">
                                                  <button onClick={() => setNoteModalState({ isOpen: true, date: dateString, mealType })} title="Notiz hinzufügen" className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-zinc-700/50 hover:text-[var(--color-accent-400)]">
                                                      <PlusCircle size={20}/>
                                                  </button>
                                                </div>}
                                          </div>
                                      )
                                  })}
                              </div>
                          </div>
                      )
                  })}
                </div>
            </div>
        </div>
        
        <RecipeSidebar
          recipes={recipes || []}
          onDragStart={handleDragStart}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setSidebarCollapsed(prev => !prev)}
        />
    </div>
  );
};

export default MealPlanner;