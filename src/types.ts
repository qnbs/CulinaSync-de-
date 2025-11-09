export interface PantryItem {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  category?: string;
  createdAt: number;
  updatedAt: number;
  minQuantity?: number; // For "running low" alerts
  notes?: string; // For extra details like "buy organic"
}

export type Page = 'chef' | 'pantry' | 'recipes' | 'meal-planner' | 'shopping-list' | 'settings' | 'help';

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
  seedId?: string;
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
    diet: string[];
  };
  expertTips: ExpertTip[];
  isFavorite?: boolean;
  updatedAt?: number;
  pantryMatchPercentage?: number;
  ingredientCount?: number;
}

export interface MealPlanItem {
  id?: number;
  date: string; // YYYY-MM-DD
  mealType: 'Frühstück' | 'Mittagessen' | 'Abendessen';
  recipeId?: number; // Optional: A meal can be a note instead of a recipe
  note?: string; // For entries like "Eating Out" or "Leftovers"
  servings?: number; // To override the default recipe servings for this specific meal
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
    category: string;
    sortOrder: number;
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
  pantry: {
    defaultSort: 'name' | 'expiryDate' | 'updatedAt' | 'createdAt';
    isGrouped: boolean;
    expiryWarningDays: number;
  };
  recipeBook: {
    defaultSort: 'newest' | 'favorites' | 'a-z' | 'z-a';
  };
  shoppingList: {
    groupCheckedAtBottom: boolean;
    defaultSort: 'category' | 'alpha';
    autoCategorize: boolean;
  };
  speechSynthesis: {
    voice: string | null; // Stores voiceURI
    rate: number;
    pitch: number;
  };
  appearance: {
    accentColor: 'amber' | 'rose' | 'sky' | 'emerald';
  };
}

export interface StructuredPrompt {
  craving: string;
  includeIngredients: string[];
  excludeIngredients: string[];
  modifiers: string[];
}

export interface RecipeIdea {
  recipeTitle: string;
  shortDescription: string;
}

// For PWA installation prompt event
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// For data import/export
export interface FullBackupData {
    pantry?: PantryItem[];
    recipes?: Recipe[];
    mealPlan?: MealPlanItem[];
    shoppingList?: ShoppingListItem[];
    settings?: AppSettings;
    exportedAt?: string;
}