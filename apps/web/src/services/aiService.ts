import type { AppSettings, PantryItem, Recipe, RecipeIdea, ShoppingListItem, StructuredPrompt } from '../types';
import { getCategoryForItem } from './utils';
import {
  generateRecipe as generateRecipeWithGemini,
  generateRecipeIdeas as generateRecipeIdeasWithGemini,
  generateShoppingList as generateShoppingListWithGemini,
} from './geminiService';

const recipeIdeaTemplates = [
  'Pfannengericht',
  'Ofenblech',
  'Schnelle Bowl',
  'Cremige Pasta',
  'Herzhafte Suppe',
];

const shoppingIntentCatalog: Record<string, string[]> = {
  fruhstuck: ['Brot', 'Butter', 'Milch', 'Eier', 'Marmelade'],
  grill: ['Baguette', 'Tomaten', 'Mozzarella', 'Bratwurst', 'Senf'],
  kuchen: ['Mehl', 'Zucker', 'Butter', 'Eier', 'Backpulver'],
  pasta: ['Spaghetti', 'Parmesan', 'Tomaten', 'Knoblauch', 'Basilikum'],
  lasagne: ['Lasagneplatten', 'Passata', 'Hackfleisch', 'Mozzarella', 'Zwiebeln'],
  salat: ['Gurke', 'Tomaten', 'Salat', 'Olivenoel', 'Zitronen'],
};

const normalizeToken = (value: string) => value.toLowerCase().replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u').replace(/ß/g, 'ss');

const getPantryHighlights = (pantryItems: PantryItem[], limit = 5) => pantryItems
  .slice()
  .sort((left, right) => right.quantity - left.quantity)
  .slice(0, limit);

const getPromptKeywords = (prompt: StructuredPrompt | string): string[] => {
  const raw = typeof prompt === 'string'
    ? prompt
    : [prompt.craving, ...prompt.includeIngredients, ...prompt.modifiers].join(' ');

  return raw
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
};

const shouldUseOfflineFallback = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = normalizeToken(message);

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }

  return [
    'kein api-schlussel konfiguriert',
    'api-schlussel ist ungultig',
    'ki-dienst konnte nicht erreicht werden',
    'network',
    'fetch_error',
    '429',
  ].some((needle) => normalized.includes(needle));
};

const buildLocalRecipeIdeas = (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences'],
): RecipeIdea[] => {
  const pantryHighlights = getPantryHighlights(pantryItems, 3).map((item) => item.name);
  const keywords = getPromptKeywords(prompt);
  const cuisine = aiPreferences.preferredCuisines[0] ?? 'Alltagskueche';
  const baseTopic = keywords[0] ?? pantryHighlights[0] ?? 'Vorratskueche';

  return recipeIdeaTemplates.slice(0, 3).map((template, index) => {
    const pantryPart = pantryHighlights[index] ?? pantryHighlights[0] ?? 'Saisonzutaten';
    return {
      recipeTitle: `${baseTopic} ${template} mit ${pantryPart}`,
      shortDescription: `Lokaler Offline-Vorschlag mit Fokus auf ${pantryPart} und ${cuisine}.`,
    };
  });
};

const buildLocalRecipe = (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  chosenIdea: RecipeIdea,
): Recipe => {
  const pantryHighlights = getPantryHighlights(pantryItems, 6);
  const ingredientItems = pantryHighlights.length > 0
    ? pantryHighlights.map((item) => ({
        quantity: String(Math.max(1, Math.round(item.quantity))),
        unit: item.unit,
        name: item.name,
      }))
    : [
        { quantity: '250', unit: 'g', name: 'Pasta' },
        { quantity: '1', unit: 'Dose', name: 'Tomaten' },
        { quantity: '1', unit: 'Stk', name: 'Zwiebel' },
      ];

  const promptFocus = prompt.includeIngredients[0] ?? (prompt.craving || 'deinen Vorrat');

  return {
    recipeTitle: `${chosenIdea.recipeTitle} (Offline-Modus)`,
    shortDescription: `${chosenIdea.shortDescription} Das Rezept wurde lokal ohne Cloud-KI erzeugt.`,
    prepTime: '15 Min.',
    cookTime: '25 Min.',
    totalTime: '40 Min.',
    servings: '2 Personen',
    difficulty: 'Einfach',
    ingredients: [
      {
        sectionTitle: 'Hauptzutaten',
        items: ingredientItems,
      },
      {
        sectionTitle: 'Abstimmung',
        items: [
          { quantity: '1', unit: 'Prise', name: 'Salz' },
          { quantity: '1', unit: 'Prise', name: 'Pfeffer' },
          { quantity: '1', unit: 'EL', name: promptFocus },
        ],
      },
    ],
    instructions: [
      'Alle Zutaten vorbereiten und grob sortieren.',
      'Aromatische Zutaten zuerst anschwitzen, danach die Hauptzutaten zugeben.',
      'Mit etwas Fluessigkeit oder Fett binden und abschmecken.',
      'Kurz ruhen lassen und direkt servieren.',
    ],
    nutritionPerServing: {
      calories: '420 kcal',
      protein: '18 g',
      fat: '14 g',
      carbs: '48 g',
    },
    tags: {
      course: ['Hauptgericht'],
      cuisine: ['International'],
      occasion: ['Alltag'],
      mainIngredient: pantryHighlights.map((item) => item.name),
      prepMethod: ['Pfanne'],
      diet: [],
    },
    expertTips: [
      {
        title: 'Offline-Hinweis',
        content: 'Dieses Rezept basiert auf lokalen Regeln und ist als stabiler Fallback gedacht.',
      },
    ],
  };
};

const buildLocalShoppingList = (
  prompt: string,
  pantryItems: PantryItem[],
  currentListItems: ShoppingListItem[],
): Omit<ShoppingListItem, 'id' | 'isChecked'>[] => {
  const normalizedPrompt = normalizeToken(prompt);
  const pantryNames = new Set(pantryItems.map((item) => normalizeToken(item.name)));
  const currentNames = new Set(currentListItems.map((item) => normalizeToken(item.name)));
  const keywordMatches = Object.entries(shoppingIntentCatalog)
    .filter(([keyword]) => normalizedPrompt.includes(keyword))
    .flatMap(([, items]) => items);

  const explicitKeywords = getPromptKeywords(prompt);
  const candidates = [...keywordMatches, ...explicitKeywords];
  const uniqueItems = Array.from(new Set(candidates))
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .slice(0, 10);

  const fallbackItems = uniqueItems.length > 0 ? uniqueItems : ['Brot', 'Milch', 'Tomaten'];

  return fallbackItems
    .filter((name) => {
      const normalizedName = normalizeToken(name);
      return !pantryNames.has(normalizedName) && !currentNames.has(normalizedName);
    })
    .map((name) => ({
      name,
      quantity: 1,
      unit: 'Stk',
      recipeId: undefined,
      category: getCategoryForItem(name),
      sortOrder: 0,
    }));
};

export const generateRecipeIdeas = async (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences'],
): Promise<RecipeIdea[]> => {
  try {
    return await generateRecipeIdeasWithGemini(prompt, pantryItems, aiPreferences);
  } catch (error) {
    if (!shouldUseOfflineFallback(error)) {
      throw error;
    }

    return buildLocalRecipeIdeas(prompt, pantryItems, aiPreferences);
  }
};

export const generateRecipe = async (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences'],
  chosenIdea: RecipeIdea,
): Promise<Recipe> => {
  try {
    return await generateRecipeWithGemini(prompt, pantryItems, aiPreferences, chosenIdea);
  } catch (error) {
    if (!shouldUseOfflineFallback(error)) {
      throw error;
    }

    return buildLocalRecipe(prompt, pantryItems, chosenIdea);
  }
};

export const generateShoppingList = async (
  prompt: string,
  pantryItems: PantryItem[],
  currentListItems: ShoppingListItem[],
): Promise<Omit<ShoppingListItem, 'id' | 'isChecked'>[]> => {
  try {
    return await generateShoppingListWithGemini(prompt, pantryItems, currentListItems);
  } catch (error) {
    if (!shouldUseOfflineFallback(error)) {
      throw error;
    }

    return buildLocalShoppingList(prompt, pantryItems, currentListItems);
  }
};