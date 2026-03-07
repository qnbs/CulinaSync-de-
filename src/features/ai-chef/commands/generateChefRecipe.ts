import type { AppSettings, Recipe, RecipeIdea, StructuredPrompt } from '../../../types';
import { loadAiChefContext } from '../queries/loadAiChefContext';
import { getAppServices } from '../../../services/serviceRegistry';

export const generateChefRecipe = async (
  prompt: StructuredPrompt,
  aiPreferences: AppSettings['aiPreferences'],
  chosenIdea: RecipeIdea,
): Promise<Recipe> => {
  const context = await loadAiChefContext(aiPreferences);
  return getAppServices().ai.generateRecipe(prompt, context.pantryItems, context.aiPreferences, chosenIdea);
};