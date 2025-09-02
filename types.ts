export interface PantryItem {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  category?: string;
  createdAt: number;
}

export type Page = 'chef' | 'pantry' | 'recipes' | 'meal-planner' | 'shopping-list' | 'settings' | 'help' | 'readme';

export interface IngredientItem {
  quantity: string;
  unit: string;
  name: string;
}

export interface IngredientGroup {
  sectionTitle: string;
  items: IngredientItem[];
}

export interface Nutrition {
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
}

export interface ExpertTip {
  title: string;
  content: string;
}

export interface Recipe {
  id?: number;
  recipeTitle: string;
  shortDescription: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  difficulty: string;
  ingredients: IngredientGroup[];
  instructions: string[];
  nutritionPerServing: Nutrition;
  tags: {
    course: string[];
    cuisine: string[];
    occasion: string[];
    mainIngredient: string[];
    prepMethod: string[];
    difficulty: string[];
    totalTime: string[];
  };
  expertTips: ExpertTip[];
  isFavorite?: boolean;
}

export interface MealPlanItem {
  id?: number;
  date: string; // YYYY-MM-DD
  mealType: 'Frühstück' | 'Mittagessen' | 'Abendessen';
  recipeId: number;
  isCooked?: boolean;
  cookedDate?: string;
}

export interface ShoppingListItem {
    id?: number;
    name: string;
    quantity: number;
    unit: string;
    isChecked: boolean;
    recipeId?: number; // Optional: to trace back to recipe
}

export interface AppSettings {
  displayName: string;
  defaultServings: number;
  weekStart: 'Monday' | 'Sunday';
  aiPreferences: {
    dietaryRestrictions: string[];
    preferredCuisines: string[];
    customInstruction: string;
  };
}