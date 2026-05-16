import type { MealPlanItem, PantryItem, Recipe } from '../types';

interface Suggestion {
  date: string;
  mealType: 'Frühstück' | 'Mittagessen' | 'Abendessen';
  recipeId: number;
}

const getDateKey = (date: Date): string => date.toISOString().split('T')[0];

const parseExpiryDaysDiff = (expiryDate?: string): number | null => {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const getSoonExpiringPantryNames = (pantryItems: PantryItem[], withinDays = 4): Set<string> => {
  return new Set(
    pantryItems
      .filter((item) => {
        const diff = parseExpiryDaysDiff(item.expiryDate);
        return diff !== null && diff >= 0 && diff <= withinDays;
      })
      .map((item) => item.name.toLowerCase())
  );
};

const getRecipeScore = (recipe: Recipe, expiringNames: Set<string>): number => {
  if (!recipe.id) return 0;

  let score = 0;
  const ingredientNames = recipe.ingredients.flatMap((group) => group.items).map((item) => item.name.toLowerCase());

  ingredientNames.forEach((name) => {
    for (const expiringName of expiringNames) {
      if (name.includes(expiringName) || expiringName.includes(name)) {
        score += 2;
      }
    }
  });

  if (recipe.pantryMatchPercentage) {
    score += recipe.pantryMatchPercentage / 40;
  }

  if (recipe.isFavorite) {
    score += 0.6;
  }

  return score;
};

export const buildAutoPlanSuggestionsFromExpiring = (
  weekDates: Date[],
  mealsByDate: Record<string, MealPlanItem>,
  recipes: Recipe[],
  expiringNames: Set<string>
): Suggestion[] => {
  if (recipes.length === 0 || expiringNames.size === 0) return [];

  const ranked = recipes
    .filter((recipe) => recipe.id)
    .map((recipe) => ({ recipe, score: getRecipeScore(recipe, expiringNames) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return [];

  const suggestions: Suggestion[] = [];
  const usedRecipeIds = new Set<number>();

  for (const date of weekDates) {
    const dateKey = getDateKey(date);
    const mealType: Suggestion['mealType'] = 'Abendessen';
    const slotKey = `${dateKey}-${mealType}`;

    if (mealsByDate[slotKey]) continue;

    const candidate = ranked.find((entry) => !usedRecipeIds.has(entry.recipe.id!));
    if (!candidate) break;

    usedRecipeIds.add(candidate.recipe.id!);
    suggestions.push({
      date: dateKey,
      mealType,
      recipeId: candidate.recipe.id!,
    });
  }

  return suggestions;
};
