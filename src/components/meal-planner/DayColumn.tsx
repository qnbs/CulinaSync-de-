import React, { useState } from 'react';
import { PlusCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { MealPlanItem, Recipe } from '../../types';
import PlannedMealCard from '../PlannedMealCard';
import { removeRecipeFromMealPlan } from '../../services/db'; // Direct import or prop drilling

interface DayColumnProps {
    date: Date;
    isToday: boolean;
    meals: Record<'Frühstück' | 'Mittagessen' | 'Abendessen', MealPlanItem | undefined>;
    recipesById: Map<number, Recipe>;
    onDrop: (e: React.DragEvent, date: string, mealType: string) => void;
    onAddNote: (date: string, mealType: string) => void;
    onMealAction: (action: string, payload: Recipe | MealPlanItem) => void;
}

// Helper to calculate pantry status for a planned meal
const getPantryStatus = (recipe: Recipe | undefined) => {
    if (!recipe || typeof recipe.pantryMatchPercentage === 'undefined' || typeof recipe.ingredientCount === 'undefined') {
        return { status: 'unknown', have: 0, total: 0 } as const;
    }
    const { pantryMatchPercentage, ingredientCount } = recipe;
    const have = Math.round(ingredientCount * (pantryMatchPercentage / 100));
    let status: 'ok' | 'partial' | 'missing' = 'missing';
    if (pantryMatchPercentage === 100) status = 'ok';
    else if (pantryMatchPercentage >= 70) status = 'partial';
    return { status, have, total: ingredientCount };
};

export const DayColumn: React.FC<DayColumnProps> = ({ date, isToday, meals, recipesById, onDrop, onAddNote, onMealAction }) => {
    const dateString = date.toISOString().split('T')[0];
    const [dragOverType, setDragOverType] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent, mealType: string) => {
        e.preventDefault();
        setDragOverType(mealType);
    };

    const handleDragLeave = () => {
        setDragOverType(null);
    };

    const handleDropInternal = (e: React.DragEvent, mealType: string) => {
        onDrop(e, dateString, mealType);
        setDragOverType(null);
    };
    
    const handleClearDay = async () => {
        if(window.confirm(`Möchtest du wirklich alle Mahlzeiten für den ${date.toLocaleDateString('de-DE')} löschen?`)) {
             Object.values(meals).forEach(meal => {
                 if (meal) onMealAction('remove', meal);
             });
        }
    };

    return (
        <div className={`flex flex-col flex-shrink-0 w-full sm:w-[320px] lg:w-auto lg:flex-1 rounded-2xl border transition-all duration-300 ${isToday ? 'bg-zinc-900/60 border-[var(--color-accent-500)]/30 ring-1 ring-[var(--color-accent-500)]/20 shadow-[0_0_20px_rgba(0,0,0,0.3)]' : 'bg-zinc-900/30 border-zinc-800/50'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isToday ? 'border-[var(--color-accent-500)]/20 bg-[var(--color-accent-500)]/5' : 'border-zinc-800/50'}`}>
                <div>
                    <h3 className={`font-bold text-lg ${isToday ? 'text-[var(--color-accent-400)]' : 'text-zinc-200'}`}>
                        {date.toLocaleDateString('de-DE', { weekday: 'long' })}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                        {date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
                    </p>
                </div>
                 <div className="group relative">
                    <button className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800">
                        <MoreHorizontal size={18}/>
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-32 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10 overflow-hidden">
                         <button onClick={handleClearDay} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-zinc-800">
                            <Trash2 size={12}/> Tag leeren
                        </button>
                    </div>
                </div>
            </div>

            {/* Slots */}
            <div className="flex flex-col p-2 gap-2 flex-grow">
                {(['Frühstück', 'Mittagessen', 'Abendessen'] as const).map(mealType => {
                    const meal = meals[mealType];
                    const recipe = meal?.recipeId ? recipesById.get(meal.recipeId) : undefined;
                    const isDragOver = dragOverType === mealType;

                    return (
                        <div 
                            key={mealType}
                            className={`relative min-h-[100px] rounded-xl transition-all duration-200 flex flex-col ${isDragOver ? 'bg-[var(--color-accent-500)]/10 border-2 border-dashed border-[var(--color-accent-500)]' : 'border border-transparent'}`}
                            onDragOver={(e) => handleDragOver(e, mealType)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDropInternal(e, mealType)}
                        >
                            {!meal && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 opacity-0 hover:opacity-100 transition-opacity group">
                                    <p className="text-[10px] uppercase tracking-widest font-bold mb-1">{mealType}</p>
                                    <button 
                                        onClick={() => onAddNote(dateString, mealType)}
                                        className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-[var(--color-accent-400)] hover:bg-zinc-700 shadow-sm"
                                        title="Notiz hinzufügen"
                                    >
                                        <PlusCircle size={20}/>
                                    </button>
                                </div>
                            )}
                            
                            {/* Label for empty slots to guide user, visible when not hovering */}
                            {!meal && !isDragOver && (
                                <div className="absolute top-2 left-2 text-[10px] font-bold text-zinc-800 uppercase tracking-wider pointer-events-none">
                                    {mealType}
                                </div>
                            )}

                            {meal && (
                                <>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1">{mealType}</div>
                                    <PlannedMealCard 
                                        meal={meal} 
                                        recipe={recipe} 
                                        pantryStatus={getPantryStatus(recipe)} 
                                        onAction={onMealAction} 
                                    />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};