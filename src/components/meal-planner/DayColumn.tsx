import React, { useRef, useState } from 'react';
import { PlusCircle, MoreHorizontal, Trash2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useModalA11y } from '../../hooks/useModalA11y';
import { MealPlanItem, Recipe } from '../../types';
import PlannedMealCard from '../PlannedMealCard';

interface DayColumnProps {
    date: Date;
    isToday: boolean;
    meals: Record<'Frühstück' | 'Mittagessen' | 'Abendessen', MealPlanItem | undefined>;
    recipesById: Map<number, Recipe>;
    onDrop: (e: React.DragEvent, date: string, mealType: string) => void;
    onSlotClick: (date: string, mealType: string) => void;
    onMealAction: (action: string, payload: Recipe | MealPlanItem) => void;
    isPlacementMode?: boolean;
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

const ClearDayConfirmationModal: React.FC<{
    dateLabel: string;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ dateLabel, onClose, onConfirm }) => {
    const { t } = useTranslation();
    const modalRef = useRef<HTMLDivElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useModalA11y({
        isOpen: true,
        onClose,
        containerRef: modalRef,
        initialFocusRef: cancelButtonRef,
    });

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 page-fade-in glass-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                className="rounded-2xl p-6 w-full max-w-md glass-modal"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="clear-day-title"
                aria-describedby="clear-day-description"
                tabIndex={-1}
            >
                <div className="flex items-center gap-3 text-red-500 mb-4">
                    <div className="p-2 bg-red-500/10 rounded-full"><Trash2 size={24} /></div>
                    <h4 id="clear-day-title" className="text-lg font-bold text-zinc-100">{t('mealPlanner.confirm.clearDayTitle')}</h4>
                </div>
                <p id="clear-day-description" className="text-zinc-400 text-sm mb-6">
                    {t('mealPlanner.confirm.clearDayDescription', { date: dateLabel })}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        ref={cancelButtonRef}
                        type="button"
                        onClick={onClose}
                        className="py-2.5 px-4 rounded-xl text-zinc-400 hover:bg-zinc-800 font-medium"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 flex items-center gap-2 transition-all"
                    >
                        <Trash2 size={16} /> {t('mealPlanner.confirm.clearDayAction')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const DayColumn: React.FC<DayColumnProps> = ({ date, isToday, meals, recipesById, onDrop, onSlotClick, onMealAction, isPlacementMode }) => {
    const { t } = useTranslation();
    const dateString = date.toISOString().split('T')[0];
    const [dragOverType, setDragOverType] = useState<string | null>(null);
    const [isClearDayModalOpen, setIsClearDayModalOpen] = useState(false);

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
    
    const handleClearDay = () => {
        setIsClearDayModalOpen(false);
        Object.values(meals).forEach(meal => {
            if (meal) onMealAction('remove', meal);
        });
    };

    return (
        <div className={`flex flex-col h-full rounded-2xl border transition-all duration-300 ${isToday ? 'bg-zinc-900/60 border-[var(--color-accent-500)]/30 ring-1 ring-[var(--color-accent-500)]/20 shadow-[0_0_20px_rgba(0,0,0,0.3)]' : 'bg-zinc-900/30 border-zinc-800/50'}`}>
            {isClearDayModalOpen && (
                <ClearDayConfirmationModal
                    dateLabel={date.toLocaleDateString('de-DE')}
                    onClose={() => setIsClearDayModalOpen(false)}
                    onConfirm={handleClearDay}
                />
            )}
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
                    <button type="button" aria-label={t('mealPlanner.actions.dayActionsAria', { date: date.toLocaleDateString('de-DE') })} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800">
                        <MoreHorizontal size={18}/>
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-32 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity z-10 overflow-hidden">
                                 <button type="button" onClick={() => setIsClearDayModalOpen(true)} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-zinc-800">
                                     <Trash2 size={12}/> {t('mealPlanner.confirm.clearDayAction')}
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
                    
                    // Visual cue for placement mode
                    const placementHighlight = isPlacementMode && !meal ? "ring-2 ring-dashed ring-[var(--color-accent-500)] bg-[var(--color-accent-500)]/5 cursor-pointer hover:bg-[var(--color-accent-500)]/10" : "";

                    return (
                        <div 
                            key={mealType}
                            className={`relative min-h-[100px] rounded-xl transition-all duration-200 flex flex-col ${isDragOver ? 'bg-[var(--color-accent-500)]/10 border-2 border-dashed border-[var(--color-accent-500)]' : 'border border-transparent'} ${placementHighlight}`}
                            onDragOver={(e) => handleDragOver(e, mealType)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDropInternal(e, mealType)}
                            onClick={() => (!meal || isPlacementMode) && onSlotClick(dateString, mealType)}
                        >
                            {!meal && (
                                <div className={`absolute inset-0 flex flex-col items-center justify-center text-zinc-700 transition-opacity group ${isPlacementMode ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                                    {isPlacementMode ? (
                                        <div className="flex flex-col items-center gap-1 text-[var(--color-accent-400)] animate-pulse">
                                            <CheckCircle2 size={24} />
                                            <span className="text-[10px] font-bold uppercase">{t('mealPlanner.overlay.insertHere')}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-[10px] uppercase tracking-widest font-bold mb-1">{mealType}</p>
                                            <button 
                                                type="button"
                                                aria-label={t('mealPlanner.addNote.aria', { mealType })}
                                                className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-[var(--color-accent-400)] hover:bg-zinc-700 shadow-sm"
                                                title={t('mealPlanner.addNote.title')}
                                            >
                                                <PlusCircle size={20}/>
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                            
                            {/* Label for empty slots to guide user, visible when not hovering */}
                            {!meal && !isDragOver && !isPlacementMode && (
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