import { Type } from '@google/genai';

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
  };
  recipeBook: {
    defaultSort: 'newest' | 'favorites' | 'a-z' | 'z-a';
  };
  shoppingList: {
    groupCheckedAtBottom: boolean;
  };
  speechSynthesis: {
    voice: string | null; // Stores voiceURI
    rate: number;
    pitch: number;
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

export const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipeTitle: { type: Type.STRING, description: "Ein kreativer und ansprechender Titel für das Rezept auf Deutsch." },
        shortDescription: { type: Type.STRING, description: "Eine kurze, verlockende Beschreibung des Gerichts auf Deutsch." },
        prepTime: { type: Type.STRING, description: "Vorbereitungszeit als Text, z.B. '15 Min.'" },
        cookTime: { type: Type.STRING, description: "Kochzeit als Text, z.B. '30 Min.'" },
        totalTime: { type: Type.STRING, description: "Gesamtzeit als Text, z.B. '45 Min.'" },
        servings: { type: Type.STRING, description: "Anzahl der Portionen, z.B. '4 Personen'" },
        difficulty: { type: Type.STRING, description: "Schwierigkeitsgrad, z.B. 'Einfach', 'Mittel', 'Schwer'" },
        ingredients: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    sectionTitle: { type: Type.STRING, description: "Titel für eine Zutatengruppe, z.B. 'Für den Teig'." },
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                quantity: { type: Type.STRING },
                                unit: { type: Type.STRING },
                                name: { type: Type.STRING }
                            },
                        }
                    }
                }
            }
        },
        instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Schritt-für-Schritt-Anleitung zur Zubereitung des Gerichts."
        },
        nutritionPerServing: {
            type: Type.OBJECT,
            properties: {
                calories: { type: Type.STRING },
                protein: { type: Type.STRING },
                fat: { type: Type.STRING },
                carbs: { type: Type.STRING }
            }
        },
        tags: {
            type: Type.OBJECT,
            properties: {
                course: { type: Type.ARRAY, items: { type: Type.STRING } },
                cuisine: { type: Type.ARRAY, items: { type: Type.STRING } },
                occasion: { type: Type.ARRAY, items: { type: Type.STRING } },
                mainIngredient: { type: Type.ARRAY, items: { type: Type.STRING } },
                prepMethod: { type: Type.ARRAY, items: { type: Type.STRING } },
                diet: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        expertTips: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                }
            }
        }
    },
    propertyOrdering: [
        "recipeTitle", "shortDescription", "prepTime", "cookTime", "totalTime",
        "servings", "difficulty", "ingredients", "instructions",
        "nutritionPerServing", "tags", "expertTips"
    ],
    required: ["recipeTitle", "shortDescription", "totalTime", "servings", "difficulty", "ingredients", "instructions"]
};
