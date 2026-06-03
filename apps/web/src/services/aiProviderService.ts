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
import { generateRecipeIdeasWithWebLlm, generateRecipeWithWebLlm } from './localAiWebLlmService';
import {
  generateRecipe as generateRecipeWithGemini,
  generateRecipeIdeas as generateRecipeIdeasWithGemini,
  generateShoppingList as generateShoppingListWithGemini,
} from './geminiService';

const toRuntimeInput = (settings: AppSettings) => ({
  enabled: settings.localAi.enabled,
  preferWebGpu: settings.localAi.preferWebGpu,
  enableWebLlmInference: settings.localAi.enableWebLlmInference,
  gpuTierPreference: settings.localAi.gpuTierPreference,
  preferredGenerativeModel: settings.localAi.preferredGenerativeModel,
  enableEmbeddings: settings.localAi.enableEmbeddings,
});

type LocalGenerativeContext = {
  task: AiGenerativeTask;
  settings: AppSettings;
  prompt: StructuredPrompt;
  pantryItems: PantryItem[];
  aiPreferences: AppSettings['aiPreferences'];
  chosenIdea?: RecipeIdea;
};

// QNBS-v3: M11.1/11.2 — Provider-Kette L1 WebLLM → L3 Transformers → L4 Heuristik
const runLocalGenerative = async <T>(
  ctx: LocalGenerativeContext,
  runHeuristic: () => T,
): Promise<{ data: T; layer: 'webllm' | 'transformers' | 'heuristic' }> => {
  const { task, settings } = ctx;
  const runtime = await buildLocalAiRuntimeConfig(toRuntimeInput(settings));
  const model = resolveGenerativeModel(settings.localAi.preferredGenerativeModel, runtime.resolvedGpuTier);
  const webLlmStatus = await getWebLlmEngineStatus(runtime, model);
  const transformersStatus = await getTransformersEngineStatus(runtime);

  const runWebLlm = async (): Promise<T | null> => {
    if (!webLlmStatus.available) {
      return null;
    }
    if (task === 'recipe-ideas') {
      return (await generateRecipeIdeasWithWebLlm(
        ctx.prompt,
        ctx.pantryItems,
        ctx.aiPreferences,
        settings,
      )) as T | null;
    }
    if (task === 'recipe' && ctx.chosenIdea) {
      return (await generateRecipeWithWebLlm(
        ctx.prompt,
        ctx.pantryItems,
        ctx.aiPreferences,
        ctx.chosenIdea,
        settings,
      )) as T | null;
    }
    return null;
  };

  return runProviderChain([
    {
      layer: 'webllm',
      enabled: isWebLlmLayerEnabled(runtime),
      run: runWebLlm,
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
  const ctx: LocalGenerativeContext = {
    task: 'recipe-ideas',
    settings,
    prompt: enrichedPrompt,
    pantryItems,
    aiPreferences,
  };

  if (shouldPreferLocalAi(settings) || !shouldAllowCloudAi(settings)) {
    const { data } = await runLocalGenerative(ctx, runLocal);
    return data;
  }

  try {
    return await generateRecipeIdeasWithGemini(enrichedPrompt, pantryItems, aiPreferences);
  } catch (error) {
    if (!shouldUseOfflineFallback(error)) {
      throw error;
    }
    logAppError(error, 'aiProvider.cloud.recipe-ideas');
    const { data } = await runLocalGenerative(ctx, runLocal);
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
  const ctx: LocalGenerativeContext = {
    task: 'recipe',
    settings,
    prompt: enrichedPrompt,
    pantryItems,
    aiPreferences,
    chosenIdea,
  };

  if (shouldPreferLocalAi(settings) || !shouldAllowCloudAi(settings)) {
    const { data } = await runLocalGenerative(ctx, runLocal);
    return data;
  }

  try {
    return await generateRecipeWithGemini(enrichedPrompt, pantryItems, aiPreferences, chosenIdea);
  } catch (error) {
    if (!shouldUseOfflineFallback(error)) {
      throw error;
    }
    logAppError(error, 'aiProvider.cloud.recipe');
    const { data } = await runLocalGenerative(ctx, runLocal);
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
  const ctx: LocalGenerativeContext = {
    task: 'shopping-list',
    settings,
    prompt: { craving: prompt, includeIngredients: [], excludeIngredients: [], modifiers: [] },
    pantryItems,
    aiPreferences: settings.aiPreferences,
  };

  if (shouldPreferLocalAi(settings) || !shouldAllowCloudAi(settings)) {
    const { data } = await runLocalGenerative(ctx, runLocal);
    return data;
  }

  try {
    return await generateShoppingListWithGemini(prompt, pantryItems, currentListItems);
  } catch (error) {
    if (!shouldUseOfflineFallback(error)) {
      throw error;
    }
    logAppError(error, 'aiProvider.cloud.shopping-list');
    const { data } = await runLocalGenerative(ctx, runLocal);
    return data;
  }
};

export const buildRuntimeConfigForTests = async (
  settings: AppSettings,
): Promise<LocalAiRuntimeConfig> => buildLocalAiRuntimeConfig(toRuntimeInput(settings));
