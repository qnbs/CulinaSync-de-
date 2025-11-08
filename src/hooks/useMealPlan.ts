import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Recipe, MealPlanItem } from '../types';

export const useMealPlan = (currentDate: Date, weekStartsOnMonday: boolean) => {
    const recipes = useLiveQuery(() => db.recipes.toArray(), []);
    const mealPlanItems = useLiveQuery(() => db.mealPlan.toArray(), []);

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

    const mealsByDate = useMemo(() => {
        return (mealPlanItems || []).reduce((acc, meal) => {
            const key = `${meal.date}-${meal.mealType}`;
            acc[key] = meal;
            return acc;
        }, {} as Record<string, MealPlanItem>);
    }, [mealPlanItems]);

    return {
        recipes,
        mealPlanItems,
        recipesById,
        week,
        mealsByDate,
    };
};
