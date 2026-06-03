import { buildLocalAiRuntimeConfig, completeWebLlmChat, resolveGenerativeModel } from '@domain/ai-core';
import i18next from 'i18next';
import type { AppSettings, PantryItem, Recipe, RecipeIdea, StructuredPrompt } from '../types';
import { parseAiJsonWithSchema, recipeAiSchema, recipeIdeasResponseSchema } from './aiJsonParse';
import { constructBasePrompt, geminiSystem } from './aiPromptBuilder';
import { logAppError } from './errorLoggingService';

const resolveWebLlmModelId = async (settings: AppSettings): Promise<string | null> => {
  if (!settings.localAi.enabled || !settings.localAi.enableWebLlmInference) {
    return null;
  }

  const runtime = await buildLocalAiRuntimeConfig({
    enabled: settings.localAi.enabled,
    preferWebGpu: settings.localAi.preferWebGpu,
    enableWebLlmInference: settings.localAi.enableWebLlmInference,
    gpuTierPreference: settings.localAi.gpuTierPreference,
    preferredGenerativeModel: settings.localAi.preferredGenerativeModel,
    enableEmbeddings: settings.localAi.enableEmbeddings,
  });
  const entry = resolveGenerativeModel(settings.localAi.preferredGenerativeModel, runtime.resolvedGpuTier);
  return entry.webLlmModelId ?? null;
};

// QNBS-v3: M11.2 — WebLLM L1 für strukturierte Rezept-JSON-Ausgaben (Zod wie Gemini)
export const generateRecipeIdeasWithWebLlm = async (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences'],
  settings: AppSettings,
): Promise<RecipeIdea[] | null> => {
  const modelId = await resolveWebLlmModelId(settings);
  if (!modelId) {
    return null;
  }

  try {
    const userContent = constructBasePrompt(prompt, pantryItems, aiPreferences);
    const jsonText = await completeWebLlmChat({
      modelId,
      temperature: aiPreferences.creativityLevel ?? 0.7,
      maxTokens: 2048,
      jsonMode: true,
      messages: [
        { role: 'system', content: geminiSystem('ideas') },
        { role: 'user', content: userContent },
      ],
    });
    const parsed = parseAiJsonWithSchema(jsonText, recipeIdeasResponseSchema);
    return parsed.ideas;
  } catch (error) {
    logAppError(error, 'localAiWebLlm.recipe-ideas');
    return null;
  }
};

export const generateRecipeWithWebLlm = async (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences'],
  chosenIdea: RecipeIdea,
  settings: AppSettings,
): Promise<Recipe | null> => {
  const modelId = await resolveWebLlmModelId(settings);
  if (!modelId) {
    return null;
  }

  try {
    let userContent = constructBasePrompt(prompt, pantryItems, aiPreferences);
    userContent += `\n\n**${i18next.t('gemini.prompt.specificRequirement')}:**\n${i18next.t('gemini.prompt.fullRecipe')}`;
    userContent += `\n- ${i18next.t('gemini.prompt.titleLabel')}: "${chosenIdea.recipeTitle}"`;
    userContent += `\n- ${i18next.t('gemini.prompt.descriptionLabel')}: "${chosenIdea.shortDescription}"`;

    const jsonText = await completeWebLlmChat({
      modelId,
      temperature: aiPreferences.creativityLevel ?? 0.7,
      maxTokens: 4096,
      jsonMode: true,
      messages: [
        { role: 'system', content: geminiSystem('recipe') },
        { role: 'user', content: userContent },
      ],
    });
    const recipe = parseAiJsonWithSchema(jsonText, recipeAiSchema);
    if (recipe.ingredients.length > 0 && recipe.instructions.length > 0) {
      return recipe;
    }
    return null;
  } catch (error) {
    logAppError(error, 'localAiWebLlm.recipe');
    return null;
  }
};
