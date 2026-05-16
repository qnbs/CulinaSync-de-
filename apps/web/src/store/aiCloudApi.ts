import { createApi } from '@reduxjs/toolkit/query/react';
import { fakeBaseQuery } from '@reduxjs/toolkit/query';
import type { AppSettings, PantryItem, RecipeIdea, StructuredPrompt } from '../types';

/**
 * RTK Query-Schicht für Cloud-/BYOK-KI — Aufrufe delegieren an `geminiService`, Response bleibt typisiert.
 */
export const aiCloudApi = createApi({
  reducerPath: 'aiCloudApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (build) => ({
    generateRecipeIdeas: build.mutation<
      RecipeIdea[],
      {
        prompt: StructuredPrompt;
        pantryItems: PantryItem[];
        aiPreferences: AppSettings['aiPreferences'];
      }
    >({
      async queryFn(args) {
        const { generateRecipeIdeas } = await import('../services/geminiService');
        const data = await generateRecipeIdeas(args.prompt, args.pantryItems, args.aiPreferences);
        return { data };
      },
    }),
  }),
});

export const { useGenerateRecipeIdeasMutation } = aiCloudApi;
