import React, { useState, useCallback } from 'react';
import { addRecipeToMealPlan, markMealAsCooked, removeRecipeFromMealPlan } from '../services/repositories/mealPlanRepository';
import { Recipe, MealPlanItem } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToast as addToastAction } from '../store/slices/uiSlice';
import { useMealPlan } from '../hooks/useMealPlan';
import RecipeDetail from './RecipeDetail';
import CookModeView from './CookModeView';
import { MealPlannerHeader } from './meal-planner/MealPlannerHeader';
import { DayColumn } from './meal-planner/DayColumn';
import { PlannerSidebar } from './meal-planner/PlannerSidebar';
import { Save, FileText, X } from 'lucide-react';

const AddMealNoteModal: React.FC<{
    date: string;
    mealType: string;
    onClose: () => void;
    onSave: (note: string) => void;
}> = ({ date, mealType, onClose, onSave }) => {
    const [note, setNote] = useState('');

    const handleSave = () => {
        if (note.trim()) onSave(note.trim());
    };

    return (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50 page-fade-in" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4 text-[var(--color-accent-400)]">
                    <FileText size={24}/> 
                    <h3 className="text-lg font-bold text-zinc-100">Notiz hinzufügen</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                    Für {mealType} am {new Date(date).toLocaleDateString('de-DE')}.
                </p>
                <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="z.B. 'Essen gehen' oder 'Reste vom Vortag'"
                    className="w-full bg-zinc-950/50 border border-zinc-700 rounded-xl p-3 text-zinc-200 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none resize-none"
                    rows={3}
                    autoFocus
                />
                <div className="flex justify-end gap-3 pt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors text-sm font-medium">Abbrechen</button>
                    <button onClick={handleSave} disabled={!note.trim()} className="px-4 py-2 rounded-lg bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center gap-2 transition-all">
                        <Save size={16}/> Speichern
                    </button>
                </div>
            </div>
        </div>
    );
};

const MealPlanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const [currentDate, setCurrentDate] = useState(new Date());

  const { recipes, recipesById, week, mealsByDate } = useMealPlan(currentDate, settings.weekStart === 'Monday');
  
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<Recipe | null>(null);
  const [noteModalState, setNoteModalState] = useState<{isOpen: boolean; date: string; mealType: string} | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCookMode, setIsCookMode] = useState(false);
  const [recipeForCookMode, setRecipeForCookMode] = useState<Recipe | null>(null);

  // New State for "Tap to Place" interaction (Mobile support)
  const [pendingRecipeId, setPendingRecipeId] = useState<number | null>(null);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    dispatch(addToastAction({ message, type }));
  };
  
  const weekString = `${week[0].toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} - ${week[6].toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}`;
  
  const handleDragStart = (e: React.DragEvent, recipe: Recipe) => {
    e.dataTransfer.setData('recipeId', recipe.id!.toString());
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handles both Drag&Drop (desktop) and Tap-to-Place (mobile)
  const handleAddRecipeToSlot = async (date: string, mealType: string, recipeId: number) => {
      await addRecipeToMealPlan({ date, mealType: mealType as any, recipeId });
      if (pendingRecipeId) {
          setPendingRecipeId(null); // Clear pending state after placement
          addToast('Rezept geplant.');
      }
  };

  const handleDrop = async (e: React.DragEvent, date: string, mealType: string) => {
    e.preventDefault();
    const recipeIdStr = e.dataTransfer.getData('recipeId');
    if (recipeIdStr) {
        const recipeId = parseInt(recipeIdStr, 10);
        await handleAddRecipeToSlot(date, mealType, recipeId);
    }
  };
  
  // Handler for tapping a recipe in the sidebar (starts selection mode)
  const handleSelectRecipeForPlacement = (recipe: Recipe) => {
      setPendingRecipeId(prev => prev === recipe.id ? null : recipe.id!);
      if (pendingRecipeId !== recipe.id) {
          addToast("Wähle nun einen Tag für das Rezept aus.", "info");
      }
  };

  // Handler for tapping a slot when a recipe is selected
  const handleSlotClick = (date: string, mealType: string) => {
      if (pendingRecipeId) {
          handleAddRecipeToSlot(date, mealType, pendingRecipeId);
      } else {
          // Normal behavior: Add Note
           setNoteModalState({ isOpen: true, date: date, mealType: mealType });
      }
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
                    message += ` ${[...changes.updated, ...changes.deleted].length} Artikel im Vorrat aktualisiert.`
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
    await addRecipeToMealPlan({ date, mealType: mealType as any, note });
    addToast('Notiz hinzugefügt.');
    setNoteModalState(null);
  }, [addToast]);

  const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  if (selectedRecipeForDetail) {
    return <RecipeDetail recipe={selectedRecipeForDetail} onBack={() => setSelectedRecipeForDetail(null)} />;
  }
  
  const pendingRecipe = pendingRecipeId ? recipesById.get(pendingRecipeId) : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-140px)] relative pb-24 md:pb-8">
         {isCookMode && recipeForCookMode && <CookModeView recipe={recipeForCookMode} onExit={() => setIsCookMode(false)} />}
         
         {noteModalState?.isOpen && (
            <AddMealNoteModal
                date={noteModalState.date}
                mealType={noteModalState.mealType}
                onClose={() => setNoteModalState(null)}
                onSave={(note) => handleSaveNote(note, noteModalState.date, noteModalState.mealType)}
            />
        )}
        
        {/* Placement Mode Indicator Overlay */}
        {pendingRecipe && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-[var(--color-accent-500)] text-zinc-900 px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <span>Wähle einen Tag für "{pendingRecipe.recipeTitle}"</span>
                <button onClick={() => setPendingRecipeId(null)} className="bg-black/20 p-1 rounded-full hover:bg-black/30">
                    <X size={16}/>
                </button>
            </div>
        )}

        <div className="flex-grow flex flex-col min-w-0">
            <MealPlannerHeader 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate} 
                weekString={weekString} 
                mealsByDate={mealsByDate}
                recipesById={recipesById}
                weekDates={week}
            />
       
            {/* Kanban Board Scroll Container with Snap */}
            <div className="flex-grow overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x-mandatory scroll-smooth no-scrollbar">
                <div className="flex gap-4 min-w-max lg:min-w-0">
                  {week.map(date => {
                      const dateString = date.toISOString().split('T')[0];
                      const meals = {
                          'Frühstück': mealsByDate[`${dateString}-Frühstück`],
                          'Mittagessen': mealsByDate[`${dateString}-Mittagessen`],
                          'Abendessen': mealsByDate[`${dateString}-Abendessen`]
                      };

                      return (
                          <div key={dateString} className="snap-center w-[85vw] sm:w-[300px] lg:w-auto lg:flex-1">
                              <DayColumn 
                                date={date}
                                isToday={isToday(date)}
                                meals={meals}
                                recipesById={recipesById}
                                onDrop={handleDrop}
                                onSlotClick={handleSlotClick}
                                onMealAction={handleMealAction}
                                isPlacementMode={!!pendingRecipeId}
                              />
                          </div>
                      );
                  })}
                </div>
            </div>
        </div>
        
        <PlannerSidebar
          recipes={recipes || []}
          onDragStart={handleDragStart}
          onSelectRecipe={handleSelectRecipeForPlacement}
          selectedRecipeId={pendingRecipeId}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setSidebarCollapsed(prev => !prev)}
        />
    </div>
  );
};

export default MealPlanner;