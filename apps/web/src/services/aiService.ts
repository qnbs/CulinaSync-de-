import type { AppSettings, PantryItem, Recipe, RecipeIdea, ShoppingListItem, StructuredPrompt } from '../types';
import { shouldAllowCloudAi, shouldPreferLocalAi, getActiveSettingsForAi } from './aiSettingsHelpers';
import {
  buildLocalRecipe,
  buildLocalRecipeIdeas,
  buildLocalShoppingList,
  shouldUseOfflineFallback,
} from './aiOfflineFallback';
import {
  generateRecipe as generateRecipeWithGemini,
  generateRecipeIdeas as generateRecipeIdeasWithGemini,
  generateShoppingList as generateShoppingListWithGemini,
} from './geminiService';

// QNBS-v3: Local-first routing respects persisted settings (localAi + aiPreferences.routingMode)
const resolveAiSettings = (): AppSettings => getActiveSettingsForAi();

export const generateRecipeIdeas = async (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences'],
): Promise<RecipeIdea[]> => {
  const settings = resolveAiSettings();

  if (shouldPreferLocalAi(settings)) {
    return buildLocalRecipeIdeas(prompt, pantryItems, aiPreferences);
  }

  if (!shouldAllowCloudAi(settings)) {
    return buildLocalRecipeIdeas(prompt, pantryItems, aiPreferences);
  }

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
  const settings = resolveAiSettings();

  if (shouldPreferLocalAi(settings)) {
    return buildLocalRecipe(prompt, pantryItems, chosenIdea);
  }

  if (!shouldAllowCloudAi(settings)) {
    return buildLocalRecipe(prompt, pantryItems, chosenIdea);
  }

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
  const settings = resolveAiSettings();

  if (shouldPreferLocalAi(settings)) {
    return buildLocalShoppingList(prompt, pantryItems, currentListItems);
  }

  if (!shouldAllowCloudAi(settings)) {
    return buildLocalShoppingList(prompt, pantryItems, currentListItems);
  }

  try {
    return await generateShoppingListWithGemini(prompt, pantryItems, currentListItems);
  } catch (error) {
    if (!shouldUseOfflineFallback(error)) {
      throw error;
    }

    return buildLocalShoppingList(prompt, pantryItems, currentListItems);
  }
};
