import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, ShoppingCart, CalendarPlus, WandSparkles } from 'lucide-react';
import { Recipe, MealPlanItem } from '../../types';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/uiSlice';
import { generateFromPlanAsync } from '../../store/slices/shoppingListSlice';
import { useTranslation } from 'react-i18next';

interface MealPlannerHeaderProps {
    currentDate: Date;
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
    weekString: string;
    mealsByDate: Record<string, MealPlanItem>;
    recipesById: Map<number, Recipe>;
    weekDates: Date[];
    onExportIcs: () => void;
    onAutoPlanExpiring: () => void;
}

const NutrientBadge = ({ label, value, unit, color }: { label: string, value: number, unit: string, color: string }) => (
    <div className="flex flex-col items-center px-3 py-1 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{Math.round(value)}{unit}</span>
    </div>
);

export const MealPlannerHeader: React.FC<MealPlannerHeaderProps> = ({ setCurrentDate, weekString, mealsByDate, recipesById, weekDates, onExportIcs, onAutoPlanExpiring }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const weekNutrition = useMemo(() => {
        let calories = 0;
        let protein = 0;
        let carbs = 0;
        let fat = 0;

        weekDates.forEach(date => {
            const dateStr = date.toISOString().split('T')[0];
            (['Frühstück', 'Mittagessen', 'Abendessen'] as const).forEach(type => {
                const meal = mealsByDate[`${dateStr}-${type}`];
                if (meal && meal.recipeId) {
                    const recipe = recipesById.get(meal.recipeId);
                    if (recipe && recipe.nutritionPerServing) {
                         // Parse "500 kcal" -> 500
                         const parseNutrient = (str: string) => parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
                         
                         const servingsRatio = (meal.servings || parseInt(recipe.servings) || 1) / (parseInt(recipe.servings) || 1);

                         calories += parseNutrient(recipe.nutritionPerServing.calories) * servingsRatio;
                         protein += parseNutrient(recipe.nutritionPerServing.protein) * servingsRatio;
                         carbs += parseNutrient(recipe.nutritionPerServing.carbs) * servingsRatio;
                         fat += parseNutrient(recipe.nutritionPerServing.fat) * servingsRatio;
                    }
                }
            });
        });

        return { calories, protein, carbs, fat };
    }, [weekDates, mealsByDate, recipesById]);

    const handleGenerateShoppingList = async () => {
        const resultAction = await dispatch(generateFromPlanAsync());
        if (generateFromPlanAsync.fulfilled.match(resultAction)) {
             const { added } = resultAction.payload;
             dispatch(addToast({ message: t('mealPlanner.toast.shoppingListUpdated', { added }) }));
        }
    };

    return (
        <div className="space-y-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-100 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">{t('mealPlanner.header.title')}</h2>
                    <p className="text-zinc-400 mt-1">{t('mealPlanner.header.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={onExportIcs} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-2 px-4 rounded-xl transition-colors border border-zinc-700">
                        <CalendarPlus size={18} /> <span className="hidden sm:inline">{t('mealPlanner.actions.exportIcs')}</span>
                    </button>
                    <button type="button" onClick={onAutoPlanExpiring} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-2 px-4 rounded-xl transition-colors border border-zinc-700">
                        <WandSparkles size={18} /> <span className="hidden sm:inline">{t('mealPlanner.actions.autoPlan')}</span>
                    </button>
                    <button type="button" aria-label={t('mealPlanner.actions.generateShoppingListAria')} onClick={handleGenerateShoppingList} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-2 px-4 rounded-xl transition-colors border border-zinc-700">
                        <ShoppingCart size={18} /> <span className="hidden sm:inline">{t('mealPlanner.actions.fillShoppingList')}</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-4 items-center bg-zinc-950/50 border border-zinc-800 rounded-2xl p-2 backdrop-blur-sm">
                {/* Navigation */}
                <div className="flex items-center justify-between w-full xl:w-auto gap-4 bg-zinc-900/80 rounded-xl p-1.5 border border-zinc-800/50">
                    <button type="button" aria-label={t('mealPlanner.actions.previousWeekAria')} onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() - 7)))} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft size={20}/>
                    </button>
                    <div className="flex flex-col items-center px-4">
                        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{t('mealPlanner.header.currentWeek')}</span>
                         <span className="font-bold text-zinc-100 tabular-nums">{weekString}</span>
                    </div>
                    <button type="button" aria-label={t('mealPlanner.actions.nextWeekAria')} onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() + 7)))} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                        <ChevronRight size={20}/>
                    </button>
                     <div className="w-px h-8 bg-zinc-800 mx-2 hidden sm:block"></div>
                     <button type="button" onClick={() => setCurrentDate(new Date())} className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--color-accent-400)] hover:bg-[var(--color-accent-500)]/10 rounded-lg transition-colors">
                        <RefreshCw size={14}/> {t('mealPlanner.actions.today')}
                    </button>
                </div>
                
                {/* Nutrition Dashboard */}
                <div className="flex-grow w-full overflow-x-auto no-scrollbar">
                    <div className="flex items-center justify-start xl:justify-end gap-3 min-w-max px-2">
                        <span className="text-xs font-medium text-zinc-500 mr-2 uppercase tracking-wider">{t('mealPlanner.header.weeklyAverage')}</span>
                        <NutrientBadge label={t('mealPlanner.header.calories')} value={weekNutrition.calories / 7} unit=" kcal" color="text-white" />
                        <NutrientBadge label={t('mealPlanner.header.protein')} value={weekNutrition.protein / 7} unit="g" color="text-emerald-400" />
                        <NutrientBadge label={t('mealPlanner.header.carbs')} value={weekNutrition.carbs / 7} unit="g" color="text-amber-400" />
                        <NutrientBadge label={t('mealPlanner.header.fat')} value={weekNutrition.fat / 7} unit="g" color="text-rose-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};