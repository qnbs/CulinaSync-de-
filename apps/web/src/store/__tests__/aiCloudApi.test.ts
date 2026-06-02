import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { aiCloudApi } from '../aiCloudApi';

const mockGenerateRecipeIdeas = vi.fn();

vi.mock('../../services/geminiService', () => ({
  generateRecipeIdeas: (...args: unknown[]) => mockGenerateRecipeIdeas(...args),
}));

describe('aiCloudApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generateRecipeIdeas mutation delegiert an geminiService', async () => {
    const ideas = [{ recipeTitle: 'A', shortDescription: 'B' }];
    mockGenerateRecipeIdeas.mockResolvedValueOnce(ideas);

    const store = configureStore({
      reducer: { [aiCloudApi.reducerPath]: aiCloudApi.reducer },
      middleware: (getDefault) => getDefault().concat(aiCloudApi.middleware),
    });

    const result = await store.dispatch(
      aiCloudApi.endpoints.generateRecipeIdeas.initiate({
        prompt: { craving: 'Curry', includeIngredients: [], excludeIngredients: [], modifiers: [] },
        pantryItems: [],
        aiPreferences: {
          dietaryRestrictions: [],
          preferredCuisines: [],
          customInstruction: '',
          creativityLevel: 0.5,
        },
      }),
    );

    expect(result.data).toEqual(ideas);
    expect(mockGenerateRecipeIdeas).toHaveBeenCalledTimes(1);
  });
});
