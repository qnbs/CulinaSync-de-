import i18next from 'i18next';
import type { AppSettings, PantryItem, Recipe, RecipeIdea, ShoppingListItem, StructuredPrompt } from '../types';
import { getCategoryForItem } from './utils';
import {
  generateRecipe as generateRecipeWithGemini,
  generateRecipeIdeas as generateRecipeIdeasWithGemini,
  generateShoppingList as generateShoppingListWithGemini,
} from './geminiService';

const normalizeToken = (value: string) => value.toLowerCase().replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u').replace(/\u00df/g, 'ss');

const getRecipeTemplateLabels = (): string[] => {
  const templates = i18next.t('aiOffline.recipeTemplates', { returnObjects: true });
  return typeof templates === 'object' && templates !== null ? Object.values(templates as Record<string, string>) : [];
};

const getShoppingIntentCatalog = (): Record<string, string[]> => {
  const catalog = i18next.t('aiOffline.shoppingCatalog', { returnObjects: true });
  return typeof catalog === 'object' && catalog !== null ? (catalog as Record<string, string[]>) : {};
};

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
  const cuisine = aiPreferences.preferredCuisines[0] ?? i18next.t('aiOffline.defaultCuisine');
  const baseTopic = keywords[0] ?? pantryHighlights[0] ?? i18next.t('aiOffline.defaultPantryTopic');
  const templates = getRecipeTemplateLabels();

  return templates.slice(0, 3).map((template, index) => {
    const pantryPart = pantryHighlights[index] ?? pantryHighlights[0] ?? i18next.t('aiOffline.defaultPantryTopic');
    return {
      recipeTitle: `${baseTopic} ${template} mit ${pantryPart}`,
      shortDescription: i18next.t('aiOffline.ideaDescription', { pantry: pantryPart, cuisine }),
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
        { quantity: '250', unit: 'g', name: i18next.t('aiOffline.fallbackIngredients.pasta') },
        { quantity: '1', unit: i18next.t('pantryUnits.can'), name: i18next.t('aiOffline.fallbackIngredients.tomatoCan') },
        { quantity: '1', unit: i18next.t('pantryUnits.pieceAbbr'), name: i18next.t('aiOffline.fallbackIngredients.onion') },
      ];

  const promptFocus = prompt.includeIngredients[0] ?? i18next.t('aiOffline.pantryFallback');

  return {
    recipeTitle: `${chosenIdea.recipeTitle}${i18next.t('aiOffline.recipeSuffix')}`,
    shortDescription: i18next.t('aiOffline.recipeShortDescription', { description: chosenIdea.shortDescription }),
    prepTime: '15 Min.',
    cookTime: '25 Min.',
    totalTime: '40 Min.',
    servings: '2 Personen',
    difficulty: 'Einfach',
    ingredients: [
      {
        sectionTitle: i18next.t('aiOffline.sectionMain'),
        items: ingredientItems,
      },
      {
        sectionTitle: i18next.t('aiOffline.sectionSeasoning'),
        items: [
          { quantity: '1', unit: i18next.t('pantryUnits.pieceAbbr'), name: 'Salz' },
          { quantity: '1', unit: i18next.t('pantryUnits.pieceAbbr'), name: 'Pfeffer' },
          { quantity: '1', unit: 'EL', name: promptFocus },
        ],
      },
    ],
    instructions: [
      i18next.t('aiOffline.instructions.prep'),
      i18next.t('aiOffline.instructions.cook'),
      i18next.t('aiOffline.instructions.bind'),
      i18next.t('aiOffline.instructions.serve'),
    ],
    nutritionPerServing: {
      calories: '420 kcal',
      protein: '18 g',
      fat: '14 g',
      carbs: '48 g',
    },
    tags: {
      course: [i18next.t('aiOffline.tags.mainCourse')],
      cuisine: [i18next.t('aiOffline.tags.international')],
      occasion: [i18next.t('aiOffline.tags.everyday')],
      mainIngredient: pantryHighlights.map((item) => item.name),
      prepMethod: [i18next.t('aiOffline.tags.skillet')],
      diet: [],
    },
    expertTips: [
      {
        title: i18next.t('aiOffline.expertTipTitle'),
        content: i18next.t('aiOffline.expertTipContent'),
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
  const shoppingIntentCatalog = getShoppingIntentCatalog();
  const keywordMatches = Object.entries(shoppingIntentCatalog)
    .filter(([keyword]) => normalizedPrompt.includes(keyword))
    .flatMap(([, items]) => items);

  const explicitKeywords = getPromptKeywords(prompt);
  const candidates = [...keywordMatches, ...explicitKeywords];
  const uniqueItems = Array.from(new Set(candidates))
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .slice(0, 10);

  const defaultFallback = (shoppingIntentCatalog.breakfast ?? []).slice(0, 3);
  const fallbackItems = uniqueItems.length > 0 ? uniqueItems : defaultFallback;

  return fallbackItems
    .filter((name) => {
      const normalizedName = normalizeToken(name);
      return !pantryNames.has(normalizedName) && !currentNames.has(normalizedName);
    })
    .map((name) => ({
      name,
      quantity: 1,
      unit: i18next.t('pantryUnits.pieceAbbr'),
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
