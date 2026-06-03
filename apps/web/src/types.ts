import type { MealType } from './constants/mealTypes';

export type { MealType };

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
  imageUrl?: string; // Base64 encoded image or URL
}

export interface MealPlanItem {
  id?: number;
  date: string; // YYYY-MM-DD
  mealType: MealType;
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

export type AiRoutingMode = 'local-only' | 'local-first' | 'cloud-first';
export type AiResponseStyle = 'concise' | 'balanced' | 'detailed';
export type GpuTierPreference = 'auto' | 'high' | 'balanced' | 'efficient';
export type LocalAiGenerativeModel =
  | 'auto'
  | 'webllm-qwen-2.5-1.5b'
  | 'webllm-phi-3.5'
  | 'webllm-llama-3.2-1b'
  | 'heuristic-only';
export type SpeechRecognitionMode = 'browser' | 'whisper';
export type WhisperModelSize = 'tiny' | 'base' | 'small';
export type PantryUnitSystem = 'metric' | 'imperial';

export interface AppSettings {
  language: 'de' | 'en';
  displayName: string;
  defaultServings: number;
  weekStart: 'Monday' | 'Sunday';
  aiPreferences: {
    dietaryRestrictions: string[];
    preferredCuisines: string[];
    customInstruction: string;
    creativityLevel: number;
    routingMode: AiRoutingMode;
    responseStyle: AiResponseStyle;
    usePantryContext: boolean;
    useMealPlanContext: boolean;
    useRecipeHistoryContext: boolean;
    maxRagChunks: number;
    structuredOutputStrict: boolean;
  };
  localAi: {
    enabled: boolean;
    localOnlyMode: boolean;
    allowCloudFallback: boolean;
    preferWebGpu: boolean;
    gpuTierPreference: GpuTierPreference;
    preferredGenerativeModel: LocalAiGenerativeModel;
    enableVision: boolean;
    enableEmbeddings: boolean;
    enableInferenceCache: boolean;
    cacheTtlHours: number;
    maxConcurrentJobs: number;
    maxModelStorageMb: number;
    downloadedModels: string[];
    stripExifOnVision: boolean;
    ollamaEnabled: boolean;
    ollamaBaseUrl: string;
  };
  privacy: {
    analyticsEnabled: boolean;
    shareDiagnostics: boolean;
    persistAiPromptsLocally: boolean;
    autoClearInferenceCache: boolean;
    redactPiiInLogs: boolean;
  };
  pantry: {
    defaultSort: 'name' | 'expiryDate' | 'updatedAt' | 'createdAt';
    isGrouped: boolean;
    expiryWarningDays: number;
    showExpiryBadges: boolean;
    unitSystem: PantryUnitSystem;
    highlightLowStock: boolean;
  };
  recipeBook: {
    defaultSort: 'newest' | 'favorites' | 'a-z' | 'z-a';
    showNutritionPreview: boolean;
    defaultView: 'grid' | 'list';
  };
  shoppingList: {
    groupCheckedAtBottom: boolean;
    defaultSort: 'category' | 'alpha';
    autoCategorize: boolean;
    smartMergeDuplicates: boolean;
    suggestQuantitiesFromRecipes: boolean;
  };
  mealPlanner: {
    preferVariety: boolean;
    respectExpiryDates: boolean;
    suggestFromPantry: boolean;
    avoidRepeatWithinDays: number;
  };
  cookMode: {
    aiAssistantEnabled: boolean;
    autoAdvanceSteps: boolean;
    timerSoundEnabled: boolean;
    keepScreenAwake: boolean;
    showIngredientChecklist: boolean;
  };
  speechSynthesis: {
    voice: string | null;
    rate: number;
    pitch: number;
    volume: number;
  };
  speechRecognition: {
    mode: SpeechRecognitionMode;
    whisperModelSize: WhisperModelSize;
    continuousListening: boolean;
    confirmDestructiveCommands: boolean;
  };
  appearance: {
    accentColor: 'amber' | 'rose' | 'sky' | 'emerald';
    highContrast: boolean;
    kitchenMode: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    compactDensity: boolean;
    showNutritionBadges: boolean;
  };
  policies: {
    avoidAllergens: string[];
    ingredientBlacklist: string[];
    minPantryStock: { name: string; min: number }[];
    strictAllergenEnforcement: boolean;
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

export interface AppLogEntry {
  id?: number;
  level: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  stack?: string;
  metadata?: string;
  createdAt: number;
  synced: boolean;
}