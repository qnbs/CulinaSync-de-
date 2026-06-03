import {
  buildLocalAiRuntimeConfig,
  getTransformersEngineStatus,
  getWebLlmEngineStatus,
  isTransformersLayerEnabled,
  isWebLlmLayerEnabled,
  resolveGenerativeModel,
  runHeuristicEngine,
  runProviderChain,
  type AiGenerativeTask,
  type LocalAiRuntimeConfig,
} from '@domain/ai-core';
import type { AppSettings, PantryItem, Recipe, RecipeIdea, ShoppingListItem, StructuredPrompt } from '../types';
import { logAppError } from './errorLoggingService';
import {
  buildLocalRecipe,
  buildLocalRecipeIdeas,
  buildLocalShoppingList,
  shouldUseOfflineFallback,
} from './aiOfflineFallback';
import { shouldAllowCloudAi, shouldPreferLocalAi, getActiveSettingsForAi } from './aiSettingsHelpers';
import { buildLocalAiRagContext, enrichPromptWithRag } from './localAiRagService';
import {
  generateRecipe as generateRecipeWithGemini,
  generateRecipeIdeas as generateRecipeIdeasWithGemini,
  generateShoppingList as generateShoppingListWithGemini,
} from './geminiService';

const toRuntimeInput = (settings: AppSettings) => ({
  enabled: settings.localAi.enabled,
  preferWebGpu: settings.localAi.preferWebGpu,
  gpuTierPreference: settings.localAi.gpuTierPreference,
  preferredGenerativeModel: settings.localAi.preferredGenerativeModel,
  enableEmbeddings: settings.localAi.enableEmbeddings,
});

// QNBS-v3: M11.1 — Local-first Routing über Provider-Kette (L1–L3 Feature-Flags, L4 Heuristik garantiert)
const runLocalGenerative = async <T>(
  task: AiGenerativeTask,
  settings: AppSettings,
  runHeuristic: () => T,
): Promise<{ data: T; layer: 'webllm' | 'transformers' | 'heuristic' }> => {
  const runtime = await buildLocalAiRuntimeConfig(toRuntimeInput(settings));
  const model = resolveGenerativeModel(settings.localAi.preferredGenerativeModel, runtime.resolvedGpuTier);
  const webLlmStatus = await getWebLlmEngineStatus(runtime, model);
  const transformersStatus = await getTransformersEngineStatus(runtime);

  return runProviderChain([
    {
      layer: 'webllm',
      enabled: isWebLlmLayerEnabled(runtime),
      run: async () => {
        if (!webLlmStatus.available) {
          return null;
        }
        return null;
      },
    },
    {
      layer: 'transformers',
      enabled: isTransformersLayerEnabled(runtime) && task === 'recipe-ideas',
      run: async () => {
        if (!transformersStatus.available) {
          return null;
        }
        return null;
      },
    },
    {
      layer: 'heuristic',
      enabled: true,
      run: async () =>
        runHeuristicEngine(task, {
          recipeIdeas: runHeuristic,
          recipe: runHeuristic,
          shoppingList: runHeuristic,
        }),
    },
  ]);
};

const withRag = async (
  prompt: StructuredPrompt,
  settings: AppSettings,
): Promise<StructuredPrompt> => {
  try {
    const rag = await buildLocalAiRagContext({ prompt, settings });
    return enrichPromptWithRag(prompt, rag);
  } catch (error) {
    logAppError(error, 'localAiRag.buildContext');
    return prompt;
  }
};

export const generateRecipeIdeas = async (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences'],
): Promise<RecipeIdea[]> => {
  const settings = getActiveSettingsForAi();
  const enrichedPrompt = await withRag(prompt, settings);
  const runLocal = () => buildLocalRecipeIdeas(enrichedPrompt, pantryItems, aiPreferences);

  if (shouldPreferLocalAi(settings) || !shouldAllowCloudAi(settings)) {
    const { data } = await runLocalGenerative('recipe-ideas', settings, runLocal);
    return data;
  }

  try {
    return await generateRecipeIdeasWithGemini(enrichedPrompt, pantryItems, aiPreferences);
  } catch (error) {
    if (!shouldUseOfflineFallback(error)) {
      throw error;
    }
    logAppError(error, 'aiProvider.cloud.recipe-ideas');
    const { data } = await runLocalGenerative('recipe-ideas', settings, runLocal);
    return data;
  }
};

export const generateRecipe = async (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences'],
  chosenIdea: RecipeIdea,
): Promise<Recipe> => {
  const settings = getActiveSettingsForAi();
  const enrichedPrompt = await withRag(prompt, settings);
  const runLocal = () => buildLocalRecipe(enrichedPrompt, pantryItems, chosenIdea);

  if (shouldPreferLocalAi(settings) || !shouldAllowCloudAi(settings)) {
    const { data } = await runLocalGenerative('recipe', settings, runLocal);
    return data;
  }

  try {
    return await generateRecipeWithGemini(enrichedPrompt, pantryItems, aiPreferences, chosenIdea);
  } catch (error) {
    if (!shouldUseOfflineFallback(error)) {
      throw error;
    }
    logAppError(error, 'aiProvider.cloud.recipe');
    const { data } = await runLocalGenerative('recipe', settings, runLocal);
    return data;
  }
};

export const generateShoppingList = async (
  prompt: string,
  pantryItems: PantryItem[],
  currentListItems: ShoppingListItem[],
): Promise<Omit<ShoppingListItem, 'id' | 'isChecked'>[]> => {
  const settings = getActiveSettingsForAi();
  const runLocal = () => buildLocalShoppingList(prompt, pantryItems, currentListItems);

  if (shouldPreferLocalAi(settings) || !shouldAllowCloudAi(settings)) {
    const { data } = await runLocalGenerative('shopping-list', settings, runLocal);
    return data;
  }

  try {
    return await generateShoppingListWithGemini(prompt, pantryItems, currentListItems);
  } catch (error) {
    if (!shouldUseOfflineFallback(error)) {
      throw error;
    }
    logAppError(error, 'aiProvider.cloud.shopping-list');
    const { data } = await runLocalGenerative('shopping-list', settings, runLocal);
    return data;
  }
};

export const buildRuntimeConfigForTests = async (
  settings: AppSettings,
): Promise<LocalAiRuntimeConfig> => buildLocalAiRuntimeConfig(toRuntimeInput(settings));
