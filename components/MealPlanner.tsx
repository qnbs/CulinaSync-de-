import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, markMealAsCooked, removeRecipeFromMealPlan, addMissingIngredientsToShoppingList } from '@/services/db';
import { Recipe, MealPlanItem, PantryItem } from '@/types';
import { ChevronLeft, ChevronRight, Search, ChefHat, CheckCircle, Trash2, ShoppingCart, Info, X, Star, BookOpen, MoreVertical } from 'lucide-react';
import RecipeCard from '@/components/RecipeCard';
import RecipeDetail from '@/components/RecipeDetail';
import { loadSettings } from '@/services/settingsService';

// Helper to calculate pantry status for a recipe
const getPantryStatus = (recipe: Recipe, pantryMap: Map<string, number>): { status: 'ok' | 'partial' | 'missing' | 'unknown', missing: string[] } => {
  const allIngredients = recipe.ingredients.flatMap(g => g.items);
  if (allIngredients.length === 0) return { status: 'ok', missing: [] };

  const missingIngredients: string[] = [];
  allIngredients.forEach(ing => {
    const pantryQty = pantryMap.get(ing.name.toLowerCase()) || 0;
    if (pantryQty <= 0) {
      missingIngredients.push(ing.name);
    }
  });

  if (missingIngredients.length === 0) return { status: 'ok', missing: [] };
  const missingPercentage = missingIngredients.length / allIngredients.length;
  if (missingPercentage <= 0.3) return { status: 'partial', missing: missingIngredients };
  return { status: 'missing', missing: missingIngredients };
};

const RecipeSidebar = React.memo<{ recipes: Recipe[], onDragStart: (id: number) => void }>(({ recipes, onDragStart }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFavOnly, setIsFavOnly] = useState(false);

    const filteredRecipes = useMemo(() => {
        return recipes.filter(r =>
            (isFavOnly ? r.isFavorite : true) &&
            r.recipeTitle.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }, [recipes, searchTerm, isFavOnly]);

    return (
        <aside className="lg:w-80 xl:w-96 flex-shrink-0 bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 flex flex-col lg:h-[80vh]">
            <h3 className="text-lg font-bold flex items-center gap-2 text-zinc-100"><ChefHat /> Dein Kochbuch</h3>
            <div className="flex items-center gap-2 my-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input type="text" placeholder="Suchen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md py-1.5 pl-8 pr-2 text-sm focus:ring-2 focus:ring-amber-500" />
                </div>
                <button onClick={() => setIsFavOnly(!isFavOnly)} title="Nur Favoriten anzeigen" className={`p-2 rounded-md transition-colors ${isFavOnly ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                    <Star size={16} />
                </button>
            </div>
            <div className="overflow-y-auto flex-grow space-y-3 pr-2 -mr-2">
                {filteredRecipes.length > 0 ? filteredRecipes.map(recipe => (
                    <div key={recipe.id} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', `recipe:${recipe.id}`); onDragStart(recipe.id!); }} className="cursor-grab active:cursor-grabbing">
                        <RecipeCard recipe={recipe} size="small" />
                    </div>
                )) : <p className="text-center text-zinc-500 text-sm py-8">Keine Rezepte gefunden.</p>}
            </div>
        </aside>
    );
});

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) return;
            handler();
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

const PlannedMealCard = React.memo<{ meal: MealPlanItem; recipe: Recipe; pantryMap: Map<string, number>; onDragStart: (id: number) => void; onAction: (action: string, payload: any) => void; }>(({ meal, recipe, pantryMap, onDragStart, onAction }) => {
    const { status, missing } = useMemo(() => getPantryStatus(recipe, pantryMap), [recipe, pantryMap]);
    const [isPopoverOpen, setPopoverOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    useClickOutside(popoverRef, () => setPopoverOpen(false));

    const statusConfig = {
        ok: { color: 'bg-green-500', title: 'Alle Zutaten im Vorrat' },
        partial: { color: 'bg-yellow-500', title: `Fehlende Zutaten: ${missing.join(', ')}` },
        missing: { color: 'bg-red-500', title: `Fehlende Zutaten: ${missing.join(', ')}` },
        unknown: { color: 'bg-zinc-600', title: 'Status unbekannt' },
    };

    return (
        <div draggable={!meal.isCooked} onDragStart={(e) => { e.dataTransfer.setData('text/plain', `meal:${meal.id}`); onDragStart(meal.id!); }}
             className={`p-2 rounded-md group relative transition-all duration-300 ${meal.isCooked ? 'bg-zinc-800/50 opacity-60' : 'bg-zinc-700 cursor-grab active:cursor-grabbing'}`}>
            <div className="flex items-center gap-2">
                <span title={statusConfig[status].title} className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusConfig[status].color}`}></span>
                <p className="text-xs font-medium truncate flex-grow text-zinc-200">{recipe.recipeTitle}</p>
                {meal.isCooked ? <CheckCircle size={14} className="text-green-400" /> :
                    <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setPopoverOpen(p => !p); }} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-opacity"><MoreVertical size={14} /></button>
                        {isPopoverOpen && (
                            <div ref={popoverRef} className="absolute top-full right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg w-48 z-20 page-fade-in">
                                <button onClick={() => onAction('view', recipe)} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-zinc-700"> <BookOpen size={14}/> Ansehen</button>
                                <button onClick={() => onAction('add_missing', recipe.id)} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-zinc-700"> <ShoppingCart size={14}/> Fehlendes kaufen</button>
                                <button onClick={() => onAction('cooked', meal.id)} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-zinc-700 text-green-400"> <CheckCircle size={14}/> Gekocht</button>
                                <button onClick={() => onAction('remove', {id: meal.id, title: recipe.recipeTitle })} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-zinc-700 text-red-400"> <Trash2 size={14}/> Entfernen</button>
                            </div>
                        )}
                    </div>
                }
            </div>
        </div>
    );
});


interface MealPlannerProps {
    addToast: (message: string, type?: 'success' | 'error') => void;
}

const MealPlanner: React.FC<MealPlannerProps> = ({ addToast }) => {
    const [weekOffset, setWeekOffset] = useState(0);
    const [showRecipeDetail, setShowRecipeDetail] = useState<Recipe | null>(null);
    const [draggedItem, setDraggedItem] = useState<{ type: string; id: number } | null>(null);
    const [dropTarget, setDropTarget] = useState<{ date: string; mealType: string } | null>(null);

    const recipes = useLiveQuery(() => db.recipes.toArray(), []);
    const pantryItems = useLiveQuery(() => db.pantry.toArray(), []);

    const weekStartDay = useMemo(() => loadSettings().weekStart, []);

    const week = useMemo(() => {
        const start = new Date();
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 && weekStartDay === 'Monday' ? -6 : (weekStartDay === 'Monday' ? 1: 0));
        const weekStart = new Date(start.setDate(diff));
        weekStart.setDate(weekStart.getDate() + weekOffset * 7);
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            return date;
        });
    }, [weekOffset, weekStartDay]);

    const weekDateStrings = useMemo(() => week.map(d => d.toISOString().split('T')[0]), [week]);
    const mealPlan = useLiveQuery(() => db.mealPlan.where('date').anyOf(weekDateStrings).toArray(), [weekDateStrings]);

    // FIX: Provide a fallback empty array to the Map constructor.
    // This ensures correct type inference for the maps even when `recipes` or `pantryItems`
    // from useLiveQuery are initially undefined, preventing type errors.
    const recipesById = useMemo(() => new Map<number, Recipe>((recipes || []).map(r => [r.id!, r])), [recipes]);
    const pantryMap = useMemo(() => new Map<string, number>((pantryItems || []).map(p => [p.name.toLowerCase(), p.quantity])), [pantryItems]);
    
    const handleAction = useCallback(async (action: string, payload: any) => {
        if (action === 'view') setShowRecipeDetail(payload);
        else if (action === 'remove') {
            if (window.confirm(`Mahlzeit "${payload.title}" wirklich aus dem Plan entfernen?`)) {
                await removeRecipeFromMealPlan(payload.id);
                 addToast(`"${payload.title}" aus dem Plan entfernt.`);
            }
        }
        else if (action === 'cooked') {
            const { success, changes } = await markMealAsCooked(payload);
            if(success) {
                let message = "Mahlzeit als gekocht markiert.";
                if(changes && (changes.updated.length > 0 || changes.deleted.length > 0)) {
                    const allChanges = [...changes.deleted, ...changes.updated];
                    const summary = allChanges.slice(0, 2).join(', ');
                    message += ` Vorrat aktualisiert: ${summary}${allChanges.length > 2 ? '...' : ''}.`;
                }
                addToast(message);
            }
        }
        else if (action === 'add_missing') {
            const count = await addMissingIngredientsToShoppingList(payload);
            addToast(count > 0 ? `${count} Artikel zur Einkaufsliste hinzugefügt.` : 'Alle Zutaten sind im Vorrat vorhanden!');
        }
    }, [addToast]);

    const handleDrop = async (date: string, mealType: 'Frühstück' | 'Mittagessen' | 'Abendessen') => {
        setDropTarget(null);
        if (!draggedItem) return;
        if (draggedItem.type === 'recipe') {
            await db.mealPlan.add({ recipeId: draggedItem.id, date, mealType, isCooked: false });
        } else if (draggedItem.type === 'meal') {
            await db.mealPlan.update(draggedItem.id, { date, mealType });
        }
    };
    
    const handleDragStart = useCallback((id: number, type: 'recipe' | 'meal') => {
        setDraggedItem({ type, id });
    }, []);

    if (showRecipeDetail) return <RecipeDetail recipe={showRecipeDetail} onBack={() => setShowRecipeDetail(null)} />;

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Essensplaner</h2>
          <p className="text-zinc-400 mt-1">Plane deine Mahlzeiten per Drag & Drop. Die Punkte zeigen, ob Zutaten im Vorrat sind.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow space-y-4">
                <div className="flex justify-between items-center bg-zinc-800 p-2 rounded-lg">
                    <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-2 rounded-md hover:bg-zinc-700"><ChevronLeft/></button>
                    <h3 className="text-lg font-semibold text-zinc-100">{week[0].toLocaleDateString('de-DE', {day: '2-digit', month: 'short'})} - {week[6].toLocaleDateString('de-DE', {day: '2-digit', month: 'short', year: 'numeric'})}</h3>
                    <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 rounded-md hover:bg-zinc-700"><ChevronRight/></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-2">
                  {week.map(day => {
                      const dateString = day.toISOString().split('T')[0];
                      const dayMeals = mealPlan?.filter(item => item.date === dateString);
                      return (
                        <div key={dateString} className="bg-zinc-900 rounded-md p-2 space-y-2 flex flex-col">
                            <h4 className="font-bold text-center text-amber-400">{day.toLocaleDateString('de-DE', { weekday: 'short' })} <span className="text-zinc-400 font-normal">{day.getDate()}.</span></h4>
                            {(['Frühstück', 'Mittagessen', 'Abendessen'] as const).map(mealType => {
                                const mealItem = dayMeals?.find(m => m.mealType === mealType);
                                const isTarget = dropTarget?.date === dateString && dropTarget?.mealType === mealType;
                                return (
                                    <div key={mealType} onDragOver={(e) => { e.preventDefault(); setDropTarget({ date: dateString, mealType }); }} onDragLeave={() => setDropTarget(null)} onDrop={() => handleDrop(dateString, mealType)} 
                                         className={`p-1.5 rounded-md min-h-[80px] flex flex-col gap-1.5 transition-colors ${isTarget ? 'bg-amber-500/10' : ''}`}>
                                        <p className="text-xs font-semibold text-zinc-500">{mealType}</p>
                                        <div className="space-y-1.5 flex-grow">
                                            {mealItem && recipesById.has(mealItem.recipeId) ? (
                                                <PlannedMealCard meal={mealItem} recipe={recipesById.get(mealItem.recipeId)!} pantryMap={pantryMap} onDragStart={(id) => handleDragStart(id, 'meal')} onAction={handleAction} />
                                            ) : <div className="h-full"></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                      );
                  })}
                </div>
            </div>

            <RecipeSidebar recipes={recipes || []} onDragStart={(id) => handleDragStart(id, 'recipe')} />
        </div>
      </div>
    );
};

export default MealPlanner;