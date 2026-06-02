import type { AppSettings, PantryItem, Recipe, RecipeIdea, ShoppingListItem, StructuredPrompt } from '../types';
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
