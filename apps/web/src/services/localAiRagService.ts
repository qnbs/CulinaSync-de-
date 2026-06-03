import type { AppSettings, Recipe, StructuredPrompt } from '../types';
import { db } from './dbInstance';

export type LocalAiRagChunk = {
  sourceType: 'recipe' | 'pantry';
  sourceId: number;
  text: string;
  score: number;
};

export type LocalAiRagContext = {
  chunks: LocalAiRagChunk[];
  promptBlock: string;
};

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

export const buildLocalAiRagContext = async (options: {
  prompt: StructuredPrompt;
  settings: AppSettings;
}): Promise<LocalAiRagContext> => {
  const { prompt, settings } = options;
  const keywords = buildKeywords(prompt);
  const limit = Math.min(settings.aiPreferences.maxRagChunks, 12);
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

  chunks.sort((left, right) => right.score - left.score);
  const top = chunks.slice(0, limit);

  const promptBlock =
    top.length === 0
      ? ''
      : top.map((chunk) => `- ${chunk.text}`).join('\n');

  return { chunks: top, promptBlock };
};

export const enrichPromptWithRag = (
  prompt: StructuredPrompt,
  rag: LocalAiRagContext,
): StructuredPrompt => {
  if (!rag.promptBlock) {
    return prompt;
  }

  const ragTokens = tokenize(rag.promptBlock).slice(0, 8);
  const mergedIncludes = [...new Set([...prompt.includeIngredients, ...ragTokens])];

  return {
    ...prompt,
    includeIngredients: mergedIncludes,
  };
};
