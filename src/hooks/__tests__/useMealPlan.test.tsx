import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useMealPlan } from '../useMealPlan';
import type { MealPlanItem, Recipe } from '@/types';

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (fn: () => unknown) => fn(),
}));

const mockRecipes: Recipe[] = [
  {
    id: 1,
    recipeTitle: 'A',
    shortDescription: '',
    prepTime: '0',
    cookTime: '0',
    totalTime: '0',
    servings: '1',
    difficulty: 'einfach',
    ingredients: [],
    instructions: [],
    nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
    tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
    expertTips: [],
  },
];

const mockMeals: MealPlanItem[] = [
  { id: 1, date: '2026-05-04', mealType: 'Mittagessen', recipeId: 1 },
];

vi.mock('../../services/dbInstance', () => ({
  db: {
    recipes: { toArray: () => mockRecipes },
    mealPlan: { toArray: () => mockMeals },
  },
}));

describe('useMealPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('baut recipesById aus Live-Daten', () => {
    const { result } = renderHook(() => useMealPlan(new Date('2026-05-06T12:00:00'), true));
    expect(result.current.recipesById.get(1)?.recipeTitle).toBe('A');
  });

  it('mappt Mahlzeiten nach Datum-Typ-Schlüssel', () => {
    const { result } = renderHook(() => useMealPlan(new Date('2026-05-06T12:00:00'), true));
    expect(result.current.mealsByDate['2026-05-04-Mittagessen']).toMatchObject({ recipeId: 1 });
  });

  it('startet die Woche montags, wenn weekStartsOnMonday true', () => {
    const { result } = renderHook(() => useMealPlan(new Date('2026-05-06T12:00:00'), true));
    const monday = result.current.week[0];
    expect(monday.getDay()).toBe(1);
    expect(monday.getFullYear()).toBe(2026);
    expect(monday.getMonth()).toBe(4);
    expect(monday.getDate()).toBe(4);
  });

  it('startet die Woche sonntags, wenn weekStartsOnMonday false', () => {
    const { result } = renderHook(() => useMealPlan(new Date('2026-05-06T12:00:00'), false));
    const sunday = result.current.week[0];
    expect(sunday.getDay()).toBe(0);
    expect(sunday.getFullYear()).toBe(2026);
    expect(sunday.getMonth()).toBe(4);
    expect(sunday.getDate()).toBe(3);
  });
});
