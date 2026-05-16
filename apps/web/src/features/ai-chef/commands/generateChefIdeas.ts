import type { AppSettings, RecipeIdea, StructuredPrompt } from '../../../types';
import { loadAiChefContext } from '../queries/loadAiChefContext';
import { getAppServices } from '../../../services/serviceRegistry';

export const generateChefIdeas = async (
  prompt: StructuredPrompt,
  aiPreferences: AppSettings['aiPreferences'],
): Promise<RecipeIdea[]> => {
  const context = await loadAiChefContext(aiPreferences);
  return getAppServices().ai.generateRecipeIdeas(prompt, context.pantryItems, context.aiPreferences);
};