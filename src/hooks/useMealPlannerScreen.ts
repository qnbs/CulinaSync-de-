import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppSelector } from '../store/hooks';
import { useMealPlan } from './useMealPlan';
import { db } from '../services/dbInstance';
import type { PantryItem } from '../types';

export const useMealPlannerScreen = () => {
  const weekStartsOnMonday = useAppSelector((s) => s.settings.weekStart === 'Monday');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { recipes, mealPlanItems, recipesById, week, mealsByDate } = useMealPlan(currentDate, weekStartsOnMonday);

  const pantryItemsResult = useLiveQuery(() => db.pantry.toArray(), []);
  const pantryItems = useMemo(() => pantryItemsResult ?? ([] as PantryItem[]), [pantryItemsResult]);

  return {
    currentDate,
    setCurrentDate,
    pantryItems,
    recipes,
    mealPlanItems,
    recipesById,
    week,
    mealsByDate,
  };
};

export type MealPlannerScreenContextValue = ReturnType<typeof useMealPlannerScreen>;
