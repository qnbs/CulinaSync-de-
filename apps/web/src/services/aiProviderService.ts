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
  generateRecipeIdeasWithOllama,
  generateRecipeWithOllama,
} from './localAiOllamaService';
import {
  buildInferenceCacheHash,
  getCachedInference,
  setCachedInference,
} from './localAiInferenceCacheService';
import { extractPantryItemsFromImageLocal } from './localAiVisionService';
import {
  generateRecipe as generateRecipeWithGemini,
  generateRecipeIdeas as generateRecipeIdeasWithGemini,
  generateShoppingList as generateShoppingListWithGemini,
  extractPantryItemsFromImage as extractPantryItemsFromImageWithGemini,
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

const promptCacheKey = (prompt: StructuredPrompt, extra = ''): string =>
  JSON.stringify({
    craving: prompt.craving,
    include: prompt.includeIngredients,
    exclude: prompt.excludeIngredients,
    modifiers: prompt.modifiers,
    rag: prompt.ragContext ?? '',
    extra,
  });

// QNBS-v3: M11 — Provider-Kette Ollama → WebLLM → Transformers → Heuristik + Inference-Cache
const runLocalGenerative = async <T>(
  ctx: LocalGenerativeContext,
  runHeuristic: () => T,
): Promise<{ data: T; layer: 'ollama' | 'webllm' | 'transformers' | 'heuristic' | 'cache' }> => {
  const { task, settings } = ctx;
  const runtime = await buildLocalAiRuntimeConfig(toRuntimeInput(settings));
  const model = resolveGenerativeModel(settings.localAi.preferredGenerativeModel, runtime.resolvedGpuTier);
  const modelId = model.webLlmModelId ?? model.id;
  const cacheExtra = ctx.chosenIdea?.recipeTitle ?? '';
  const cacheHash = settings.localAi.enableInferenceCache
    ? await buildInferenceCacheHash(task, promptCacheKey(ctx.prompt, cacheExtra), modelId)
    : null;

  if (cacheHash) {
    const cached = await getCachedInference<T>(cacheHash);
    if (cached != null) {
      return { data: cached, layer: 'cache' };
    }
  }

  const webLlmStatus = await getWebLlmEngineStatus(runtime, model);
  const transformersStatus = await getTransformersEngineStatus(runtime);

  const runOllama = async (): Promise<T | null> => {
    if (!settings.localAi.ollamaEnabled) {
      return null;
    }
    if (task === 'recipe-ideas') {
      return (await generateRecipeIdeasWithOllama(
        ctx.prompt,
        ctx.pantryItems,
        ctx.aiPreferences,
        settings,
      )) as T | null;
    }
    if (task === 'recipe' && ctx.chosenIdea) {
      return (await generateRecipeWithOllama(
        ctx.prompt,
        ctx.pantryItems,
        ctx.aiPreferences,
        ctx.chosenIdea,
        settings,
      )) as T | null;
    }
    return null;
  };

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

  const result = await runProviderChain([
    {
      layer: 'ollama',
      enabled: settings.localAi.ollamaEnabled,
      run: runOllama,
    },
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

  if (cacheHash && result.data != null) {
    await setCachedInference(
      cacheHash,
      task,
      modelId,
      result.data,
      settings.localAi.cacheTtlHours,
    );
  }

  return result;
};

const withRag = async (
  prompt: StructuredPrompt,
  settings: AppSettings,
): Promise<StructuredPrompt> => {
  try {
    const rag = await buildLocalAiRagContext({ prompt, settings });
    return enrichPromptWithRag(prompt, rag);
  } catch (error) {
    void logAppError(error, 'localAiRag.buildContext');
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
    void logAppError(error, 'aiProvider.cloud.recipe-ideas');
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
    void logAppError(error, 'aiProvider.cloud.recipe');
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
    void logAppError(error, 'aiProvider.cloud.shopping-list');
    const { data } = await runLocalGenerative(ctx, runLocal);
    return data;
  }
};

/** Vision: lokal (ONNX/CLIP) wenn aktiv, sonst Gemini. */
export const extractPantryItemsFromImage = async (imageFile: File): Promise<string> => {
  const settings = getActiveSettingsForAi();
  const local = await extractPantryItemsFromImageLocal(imageFile);
  if (local) {
    return local;
  }

  if (!shouldAllowCloudAi(settings)) {
    throw new Error('local-vision-unavailable');
  }

  return extractPantryItemsFromImageWithGemini(imageFile);
};

export const buildRuntimeConfigForTests = async (
  settings: AppSettings,
): Promise<LocalAiRuntimeConfig> => buildLocalAiRuntimeConfig(toRuntimeInput(settings));
