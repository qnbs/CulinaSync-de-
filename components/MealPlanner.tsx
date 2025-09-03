import React, { useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, markMealAsCooked, removeRecipeFromMealPlan, addRecipeToMealPlan } from '@/services/db';
import { Recipe, MealPlanItem, PantryItem } from '@/types';
import { ChevronLeft, ChevronRight, Search, PlusCircle, FileText, Save } from 'lucide-react';
import RecipeCard from '@/components/RecipeCard';
import RecipeDetail from '@/components/RecipeDetail';
import { useSettings } from '@/contexts/SettingsContext';
import PlannedMealCard from '@/components/PlannedMealCard';
import { checkRecipePantryMatch } from '@/services/utils';

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
                    className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500"
                    rows={3}
                    autoFocus
                />
                <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-zinc-700">
                    <button onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                    <button onClick={handleSave} disabled={!note.trim()} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 flex items-center gap-2 disabled:bg-zinc-600">
                        <Save size={16}/> Speichern
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper to calculate pantry status for a recipe
const getPantryStatus = (recipe: Recipe | undefined, pantryMap: Map<string, number>): { status: 'ok' | 'partial' | 'missing' | 'unknown', missing: string[], missingCount: number, totalCount: number } => {
  if (!recipe || !recipe.ingredients) return { status: 'unknown', missing: [], missingCount: 0, totalCount: 0 };
  
  const allIngredients = recipe.ingredients.flatMap(g => g.items);
  if (allIngredients.length === 0) return { status: 'ok', missing: [], missingCount: 0, totalCount: 0 };

  const missingIngredients: string[] = [];
  allIngredients.forEach(ing => {
    if (ing.name.toLowerCase().includes('optional') || ing.name.toLowerCase().includes('nach geschmack')) return;
    const pantryQty = pantryMap.get(ing.name.toLowerCase()) || 0;
    const requiredQty = parseFloat(ing.quantity) || 0;
    if (pantryQty < requiredQty) {
      missingIngredients.push(ing.name);
    }
  });
  
  const missingCount = missingIngredients.length;
  const totalCount = allIngredients.length;

  if (missingCount === 0) return { status: 'ok', missing: [], missingCount, totalCount };
  if (missingCount / totalCount <= 0.3) return { status: 'partial', missing: missingIngredients, missingCount, totalCount };
  return { status: 'missing', missing: missingIngredients, missingCount, totalCount };
};

interface MealPlannerProps {
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const MealPlanner: React.FC<MealPlannerProps> = ({ addToast }) => {
  const { settings } = useSettings();
  const weekStartsOnMonday = settings.weekStart === 'Monday';
  const [currentDate, setCurrentDate] = useState(new Date());

  const recipes = useLiveQuery(() => db.recipes.toArray(), []);
  const mealPlanItems = useLiveQuery(() => db.mealPlan.toArray(), []);
  const pantryItems = useLiveQuery(() => db.pantry.toArray(), []);
  
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<Recipe | null>(null);
  const [dropTarget, setDropTarget] = useState<{ date: string; mealType: string } | null>(null);
  const [noteModalState, setNoteModalState] = useState<{isOpen: boolean; date: string; mealType: string} | null>(null);
  const [recipeSearchTerm, setRecipeSearchTerm] = useState('');

  const pantryMap: Map<string, number> = useMemo(() => new Map(pantryItems?.map((p: PantryItem) => [p.name.toLowerCase(), p.quantity]) || []), [pantryItems]);
  const recipesById = useMemo(() => new Map<number, Recipe>(recipes?.map(r => [r.id!, r]) || []), [recipes]);
  
  const week = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const diff = startOfWeek.getDate() - dayOfWeek + (weekStartsOnMonday ? (dayOfWeek === 0 ? -6 : 1) : 0);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        return date;
    });
  }, [currentDate, weekStartsOnMonday]);
  
  const weekString = `Woche vom ${week[0].toLocaleDateString('de-DE')} - ${week[6].toLocaleDateString('de-DE')}`;
  
  const mealsByDate = useMemo(() => {
    return (mealPlanItems || []).reduce((acc, meal) => {
      const key = `${meal.date}-${meal.mealType}`;
      acc[key] = meal;
      return acc;
    }, {} as Record<string, MealPlanItem>);
  }, [mealPlanItems]);
  
  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    return recipes.filter(r => r.recipeTitle.toLowerCase().includes(recipeSearchTerm.toLowerCase()));
  }, [recipes, recipeSearchTerm]);

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
  
  const handleMealAction = useCallback(async (action: string, payload: any) => {
    switch (action) {
        case 'view': setSelectedRecipeForDetail(payload); break;
        case 'cooked': {
            const { success, changes } = await markMealAsCooked(payload.id!);
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
                await removeRecipeFromMealPlan(payload.id!);
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
    return <RecipeDetail recipe={selectedRecipeForDetail} onBack={() => setSelectedRecipeForDetail(null)} addToast={addToast} />;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 md:h-[calc(100vh-8rem)]">
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
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Essensplaner</h2>
                    <p className="text-zinc-400 mt-1">Plane Mahlzeiten per Drag & Drop oder füge Notizen hinzu.</p>
                </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-zinc-950/50 border border-zinc-800 rounded-lg flex-shrink-0">
                <button onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() - 7)))} className="p-2 rounded-md hover:bg-zinc-700"><ChevronLeft/></button>
                <div className="flex items-center gap-4 text-center">
                  <h3 className="font-semibold text-lg text-zinc-100 tabular-nums">{weekString}</h3>
                  <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold py-1 px-3 rounded-md bg-zinc-700 hover:bg-zinc-600 text-amber-300">Heute</button>
                </div>
                <button onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() + 7)))} className="p-2 rounded-md hover:bg-zinc-700"><ChevronRight/></button>
            </div>
       
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden flex-grow">
                {week.map(date => {
                    const dateString = date.toISOString().split('T')[0];
                    const today = isToday(date);
                    return (
                        <div key={dateString} className={`flex flex-col ${today ? 'bg-zinc-800/50' : 'bg-zinc-900'}`}>
                            <div className={`text-center py-2 font-semibold text-sm border-b border-zinc-800 ${today ? 'text-amber-400' : 'text-zinc-300'}`}>
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
                                            className={`p-2 min-h-[120px] flex flex-col justify-start transition-colors group flex-grow ${isDropTarget ? 'bg-amber-500/20' : ''}`}
                                            onDragOver={e => { e.preventDefault(); setDropTarget({ date: dateString, mealType }); }}
                                            onDragLeave={() => setDropTarget(null)}
                                            onDrop={handleDrop}
                                        >
                                            <span className="text-xs text-zinc-500">{mealType}</span>
                                            {meal ? <PlannedMealCard meal={meal} recipe={recipe} pantryStatus={getPantryStatus(recipe, pantryMap)} onAction={handleMealAction} />
                                            : <div className="w-full h-full flex items-center justify-center text-zinc-600 rounded-md ">
                                                <button onClick={() => setNoteModalState({ isOpen: true, date: dateString, mealType })} title="Notiz hinzufügen" className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-zinc-700/50 hover:text-amber-400">
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

        <div className="w-full md:w-1/3 lg:w-1/4 bg-zinc-950/50 border-t md:border-t-0 md:border-l border-zinc-800 p-4 flex flex-col flex-shrink-0">
            <h3 className="text-lg font-bold mb-4">Rezepte ziehen</h3>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input type="text" placeholder="Suchen..." value={recipeSearchTerm} onChange={e => setRecipeSearchTerm(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="overflow-y-auto flex-grow pr-2 -mr-2 space-y-3">
                {(filteredRecipes && filteredRecipes.length > 0 && pantryItems) ? filteredRecipes.map(recipe => (
                    <div key={recipe.id} draggable onDragStart={(e) => handleDragStart(e, recipe)} className="cursor-grab">
                        <RecipeCard recipe={recipe} size="small" pantryMatch={checkRecipePantryMatch(recipe, pantryItems)} />
                    </div>
                )) : <p className="text-sm text-zinc-500 text-center py-4">Keine Rezepte gefunden.</p>}
            </div>
        </div>
    </div>
  );
};

export default MealPlanner;