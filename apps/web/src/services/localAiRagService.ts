import type { AppSettings, Recipe, StructuredPrompt } from '../types';
import { db } from './dbInstance';
import { mealPlanToEmbeddingText, searchSemanticRagChunks } from './localAiEmbeddingsService';
import type { LocalAiRagChunk, LocalAiRagContext } from './localAiRagTypes';

export type { LocalAiRagChunk, LocalAiRagContext } from './localAiRagTypes';

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

const scoreText = (haystack: string, keywords: string[]): number => {
  const normalized = haystack.toLowerCase();
  return keywords.reduce((sum, keyword) => (normalized.includes(keyword) ? sum + 1 : sum), 0);
};

const recipeToText = (recipe: Recipe): string => {
  const ingredientNames = (recipe.ingredients ?? []).flatMap((group) =>
    group.items.map((item) => item.name),
  );
  return [recipe.recipeTitle, ...ingredientNames].join(' ');
};

const buildKeywords = (prompt: StructuredPrompt): string[] => {
  const raw = [prompt.craving, ...prompt.includeIngredients, ...prompt.modifiers].join(' ');
  return tokenize(raw);
};

const buildQueryText = (prompt: StructuredPrompt): string =>
  [prompt.craving, ...prompt.includeIngredients, ...prompt.modifiers].join(' ').trim();

const chunkKey = (chunk: LocalAiRagChunk): string => `${chunk.sourceType}:${chunk.sourceId}`;

const mergeChunks = (primary: LocalAiRagChunk[], secondary: LocalAiRagChunk[], limit: number): LocalAiRagChunk[] => {
  const merged = new Map<string, LocalAiRagChunk>();
  for (const chunk of [...primary, ...secondary]) {
    const key = chunkKey(chunk);
    const existing = merged.get(key);
    if (!existing || chunk.score > existing.score) {
      merged.set(key, chunk);
    }
  }
  return [...merged.values()].sort((left, right) => right.score - left.score).slice(0, limit);
};

const buildMealPlanKeywordChunks = async (
  keywords: string[],
  limit: number,
): Promise<LocalAiRagChunk[]> => {
  const mealPlanItems = await db.mealPlan.toArray();
  if (mealPlanItems.length === 0) {
    return [];
  }

  const recipeIds = [
    ...new Set(mealPlanItems.map((item) => item.recipeId).filter((id): id is number => id !== undefined)),
  ];
  const recipes =
    recipeIds.length > 0 ? await db.recipes.where('id').anyOf(recipeIds).toArray() : [];
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe.recipeTitle]));

  const chunks: LocalAiRagChunk[] = [];
  for (const item of mealPlanItems) {
    const text = mealPlanToEmbeddingText(item, recipeById.get(item.recipeId ?? -1));
    const score = scoreText(text, keywords);
    if (score > 0 && item.id !== undefined) {
      chunks.push({ sourceType: 'mealPlan', sourceId: item.id, text, score });
    }
  }

  return chunks.sort((left, right) => right.score - left.score).slice(0, limit);
};

const buildKeywordChunks = async (
  prompt: StructuredPrompt,
  settings: AppSettings,
  limit: number,
): Promise<LocalAiRagChunk[]> => {
  const keywords = buildKeywords(prompt);
  const chunks: LocalAiRagChunk[] = [];

  if (settings.aiPreferences.useRecipeHistoryContext) {
    const recipes = await db.recipes.toArray();
    for (const recipe of recipes) {
      const text = recipeToText(recipe);
      const score = scoreText(text, keywords);
      if (score > 0 && recipe.id !== undefined) {
        chunks.push({ sourceType: 'recipe', sourceId: recipe.id, text, score });
      }
    }
  }

  if (settings.aiPreferences.usePantryContext) {
    const pantryItems = await db.pantry.toArray();
    for (const item of pantryItems) {
      const text = `${item.name} ${item.quantity} ${item.unit}`;
      const score = scoreText(text, keywords);
      if (score > 0 && item.id !== undefined) {
        chunks.push({ sourceType: 'pantry', sourceId: item.id, text, score });
      }
    }
  }

  if (settings.aiPreferences.useMealPlanContext) {
    const mealPlanChunks = await buildMealPlanKeywordChunks(keywords, limit);
    chunks.push(...mealPlanChunks);
  }

  return chunks.sort((left, right) => right.score - left.score).slice(0, limit);
};

// QNBS-v3: M11.3 — Hybrid-RAG: Transformers-Embeddings (Dexie) + Keyword-Fallback inkl. Meal-Plan
export const buildLocalAiRagContext = async (options: {
  prompt: StructuredPrompt;
  settings: AppSettings;
}): Promise<LocalAiRagContext> => {
  const { prompt, settings } = options;
  const limit = Math.min(settings.aiPreferences.maxRagChunks, 12);
  const queryText = buildQueryText(prompt);

  const semanticChunks =
    queryText.length > 0
      ? await searchSemanticRagChunks({ queryText, settings, limit })
      : [];

  const keywordChunks = await buildKeywordChunks(prompt, settings, limit);

  let chunks: LocalAiRagChunk[];
  let retrievalMode: LocalAiRagContext['retrievalMode'];

  if (semanticChunks.length > 0) {
    chunks = mergeChunks(semanticChunks, keywordChunks, limit);
    retrievalMode = keywordChunks.length > 0 ? 'hybrid' : 'semantic';
  } else {
    chunks = keywordChunks;
    retrievalMode = 'keyword';
  }

  const promptBlock =
    chunks.length === 0 ? '' : chunks.map((chunk) => `- ${chunk.text}`).join('\n');

  return { chunks, promptBlock, retrievalMode };
};

export const enrichPromptWithRag = (
  prompt: StructuredPrompt,
  rag: LocalAiRagContext,
): StructuredPrompt => {
  if (!rag.promptBlock) {
    return prompt;
  }

  // QNBS-v3: promptBlock als ragContext injizieren | früher wurden Chunk-Tokens fälschlich zu includeIngredients
  return {
    ...prompt,
    ragContext: rag.promptBlock.slice(0, 2000),
  };
};
