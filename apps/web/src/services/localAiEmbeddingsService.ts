import {
  buildLocalAiRuntimeConfig,
  EMBEDDING_MODEL_ID,
  getTransformersEngineStatus,
  rankByCosineSimilarity,
} from '@domain/ai-core';
import type {
  AppSettings,
  AiEmbeddingRecord,
  AiEmbeddingSourceType,
  MealPlanItem,
  PantryItem,
  Recipe,
} from '../types';
import { db } from './dbInstance';
import { embedTextInWorker } from './embeddingWorkerService';
import { logAppError } from './errorLoggingService';
import type { LocalAiRagChunk } from './localAiRagTypes';
import { getLocalAiWorkerBus } from './localAiWorkerBus';

const hashContent = (text: string): string => {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33) ^ text.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
};

const recipeToEmbeddingText = (recipe: Recipe): string => {
  const ingredientNames = (recipe.ingredients ?? []).flatMap((group) =>
    group.items.map((item) => item.name),
  );
  return [recipe.recipeTitle, ...ingredientNames].join(' ').trim();
};

const pantryToEmbeddingText = (item: PantryItem): string =>
  `${item.name} ${item.quantity} ${item.unit}`.trim();

export const mealPlanToEmbeddingText = (item: MealPlanItem, recipeTitle?: string): string => {
  const parts = [item.date, item.mealType];
  if (recipeTitle) {
    parts.push(recipeTitle);
  }
  if (item.note) {
    parts.push(item.note);
  }
  return parts.join(' ').trim();
};

let debouncedReindexTimeout: number | undefined;

const getAllowedSourceTypes = (settings: AppSettings): AiEmbeddingSourceType[] => {
  const types: AiEmbeddingSourceType[] = [];
  if (settings.aiPreferences.useRecipeHistoryContext) {
    types.push('recipe');
  }
  if (settings.aiPreferences.usePantryContext) {
    types.push('pantry');
  }
  if (settings.aiPreferences.useMealPlanContext) {
    types.push('mealPlan');
  }
  return types;
};

const loadEmbeddingsForSourceTypes = async (
  sourceTypes: AiEmbeddingSourceType[],
): Promise<AiEmbeddingRecord[]> => {
  const records: AiEmbeddingRecord[] = [];
  for (const sourceType of sourceTypes) {
    const batch = await db.aiEmbeddings
      .where('sourceType')
      .equals(sourceType)
      .filter((record) => record.modelId === EMBEDDING_MODEL_ID && record.vector.length > 0)
      .toArray();
    records.push(...batch);
  }
  return records;
};

export const isSemanticRagAvailable = async (settings: AppSettings): Promise<boolean> => {
  if (!settings.localAi.enabled || !settings.localAi.enableEmbeddings) {
    return false;
  }

  const runtime = await buildLocalAiRuntimeConfig({
    enabled: settings.localAi.enabled,
    preferWebGpu: settings.localAi.preferWebGpu,
    enableWebLlmInference: settings.localAi.enableWebLlmInference,
    gpuTierPreference: settings.localAi.gpuTierPreference,
    preferredGenerativeModel: settings.localAi.preferredGenerativeModel,
    enableEmbeddings: settings.localAi.enableEmbeddings,
  });

  const status = await getTransformersEngineStatus(runtime);
  return status.available;
};

const upsertEmbedding = async (record: Omit<AiEmbeddingRecord, 'id' | 'updatedAt'>): Promise<void> => {
  const existing = await db.aiEmbeddings
    .where('[sourceType+sourceId]')
    .equals([record.sourceType, record.sourceId])
    .first();

  const now = Date.now();
  if (existing?.id !== undefined) {
    await db.aiEmbeddings.update(existing.id, {
      contentHash: record.contentHash,
      modelId: record.modelId,
      vector: record.vector,
      updatedAt: now,
    });
    return;
  }

  await db.aiEmbeddings.add({ ...record, updatedAt: now });
};

export const indexRecipeEmbedding = async (recipe: Recipe): Promise<void> => {
  if (recipe.id === undefined) {
    return;
  }

  const text = recipeToEmbeddingText(recipe);
  if (!text) {
    return;
  }

  const contentHash = hashContent(text);
  const existing = await db.aiEmbeddings
    .where('[sourceType+sourceId]')
    .equals(['recipe', recipe.id])
    .first();

  if (existing?.contentHash === contentHash && existing.modelId === EMBEDDING_MODEL_ID) {
    return;
  }

  const vector = await embedTextInWorker(text);
  if (!vector) {
    return;
  }

  await upsertEmbedding({
    sourceType: 'recipe',
    sourceId: recipe.id,
    contentHash,
    modelId: EMBEDDING_MODEL_ID,
    vector,
  });
};

export const indexPantryEmbedding = async (item: PantryItem): Promise<void> => {
  if (item.id === undefined) {
    return;
  }

  const text = pantryToEmbeddingText(item);
  const contentHash = hashContent(text);
  const existing = await db.aiEmbeddings
    .where('[sourceType+sourceId]')
    .equals(['pantry', item.id])
    .first();

  if (existing?.contentHash === contentHash && existing.modelId === EMBEDDING_MODEL_ID) {
    return;
  }

  const vector = await embedTextInWorker(text);
  if (!vector) {
    return;
  }

  await upsertEmbedding({
    sourceType: 'pantry',
    sourceId: item.id,
    contentHash,
    modelId: EMBEDDING_MODEL_ID,
    vector,
  });
};

export const indexMealPlanEmbedding = async (item: MealPlanItem): Promise<void> => {
  if (item.id === undefined) {
    return;
  }

  let recipeTitle: string | undefined;
  if (item.recipeId !== undefined) {
    const recipe = await db.recipes.get(item.recipeId);
    recipeTitle = recipe?.recipeTitle;
  }

  const text = mealPlanToEmbeddingText(item, recipeTitle);
  if (!text) {
    return;
  }

  const contentHash = hashContent(text);
  const existing = await db.aiEmbeddings
    .where('[sourceType+sourceId]')
    .equals(['mealPlan', item.id])
    .first();

  if (existing?.contentHash === contentHash && existing.modelId === EMBEDDING_MODEL_ID) {
    return;
  }

  const vector = await embedTextInWorker(text);
  if (!vector) {
    return;
  }

  await upsertEmbedding({
    sourceType: 'mealPlan',
    sourceId: item.id,
    contentHash,
    modelId: EMBEDDING_MODEL_ID,
    vector,
  });
};

export const removeEmbeddingForSource = async (
  sourceType: AiEmbeddingSourceType,
  sourceId: number,
): Promise<void> => {
  await db.aiEmbeddings.where('[sourceType+sourceId]').equals([sourceType, sourceId]).delete();
};

export const reindexAllEmbeddings = async (settings: AppSettings): Promise<void> => {
  if (!(await isSemanticRagAvailable(settings))) {
    return;
  }

  try {
    const recipes = await db.recipes.toArray();
    for (const recipe of recipes) {
      await indexRecipeEmbedding(recipe);
    }

    const pantryItems = await db.pantry.toArray();
    for (const item of pantryItems) {
      await indexPantryEmbedding(item);
    }

    const mealPlanItems = await db.mealPlan.toArray();
    for (const item of mealPlanItems) {
      await indexMealPlanEmbedding(item);
    }
  } catch (error) {
    void logAppError(error, 'localAiEmbeddings.reindexAll');
  }
};

export const debouncedReindexAllEmbeddings = (settings: AppSettings): void => {
  clearTimeout(debouncedReindexTimeout);
  debouncedReindexTimeout = window.setTimeout(() => {
    getLocalAiWorkerBus().enqueue(() => reindexAllEmbeddings(settings), 0);
  }, 2000);
};

export const searchSemanticRagChunks = async (options: {
  queryText: string;
  settings: AppSettings;
  limit: number;
}): Promise<LocalAiRagChunk[]> => {
  const { queryText, settings, limit } = options;
  if (!(await isSemanticRagAvailable(settings))) {
    return [];
  }

  const queryVector = await embedTextInWorker(queryText);
  if (!queryVector) {
    return [];
  }

  const allowedSourceTypes = getAllowedSourceTypes(settings);
  if (allowedSourceTypes.length === 0) {
    return [];
  }

  const filtered = await loadEmbeddingsForSourceTypes(allowedSourceTypes);

  const ranked = rankByCosineSimilarity(
    queryVector,
    filtered.map((record) => ({
      vector: record.vector,
      meta: record,
    })),
    limit,
  );

  const textBySource = new Map<string, string>();
  if (settings.aiPreferences.useRecipeHistoryContext) {
    const recipes = await db.recipes.toArray();
    for (const recipe of recipes) {
      if (recipe.id !== undefined) {
        textBySource.set(`recipe:${recipe.id}`, recipeToEmbeddingText(recipe));
      }
    }
  }
  if (settings.aiPreferences.usePantryContext) {
    const pantryItems = await db.pantry.toArray();
    for (const item of pantryItems) {
      if (item.id !== undefined) {
        textBySource.set(`pantry:${item.id}`, pantryToEmbeddingText(item));
      }
    }
  }
  if (settings.aiPreferences.useMealPlanContext) {
    const mealPlanItems = await db.mealPlan.toArray();
    const recipeIds = [
      ...new Set(mealPlanItems.map((item) => item.recipeId).filter((id): id is number => id !== undefined)),
    ];
    const recipes =
      recipeIds.length > 0 ? await db.recipes.where('id').anyOf(recipeIds).toArray() : [];
    const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe.recipeTitle]));

    for (const item of mealPlanItems) {
      if (item.id !== undefined) {
        textBySource.set(
          `mealPlan:${item.id}`,
          mealPlanToEmbeddingText(item, recipeById.get(item.recipeId ?? -1)),
        );
      }
    }
  }

  return ranked
    .filter((entry) => entry.score > 0.2)
    .map((entry) => {
      const record = entry.meta;
      const text = textBySource.get(`${record.sourceType}:${record.sourceId}`) ?? '';
      return {
        sourceType: record.sourceType,
        sourceId: record.sourceId,
        text,
        score: entry.score,
      };
    })
    .filter((chunk) => chunk.text.length > 0);
};
