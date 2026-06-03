import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDefaultSettings } from '../settingsMerge';

const mockCompleteWebLlmChat = vi.fn();

vi.mock('@domain/ai-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@domain/ai-core')>();
  return {
    ...actual,
    completeWebLlmChat: (...args: unknown[]) => mockCompleteWebLlmChat(...args),
  };
});

describe('localAiWebLlmService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generateRecipeIdeasWithWebLlm parst JSON-Antwort', async () => {
    mockCompleteWebLlmChat.mockResolvedValueOnce(
      JSON.stringify({
        ideas: [{ recipeTitle: 'WebLLM Pasta', shortDescription: 'Lokal generiert' }],
      }),
    );

    const settings = {
      ...getDefaultSettings(),
      localAi: {
        ...getDefaultSettings().localAi,
        enableWebLlmInference: true,
        preferredGenerativeModel: 'webllm-llama-3.2-1b' as const,
      },
    };

    const { generateRecipeIdeasWithWebLlm } = await import('../localAiWebLlmService');
    const ideas = await generateRecipeIdeasWithWebLlm(
      { craving: 'Pasta', includeIngredients: [], excludeIngredients: [], modifiers: [] },
      [],
      settings.aiPreferences,
      settings,
    );

    expect(ideas).toHaveLength(1);
    expect(ideas?.[0]?.recipeTitle).toBe('WebLLM Pasta');
  });

  it('generateRecipeWithWebLlm parst gueltiges Rezept', async () => {
    mockCompleteWebLlmChat.mockResolvedValueOnce(
      JSON.stringify({
        recipeTitle: 'T',
        shortDescription: 'S',
        prepTime: '5',
        cookTime: '10',
        totalTime: '15',
        servings: '2',
        difficulty: 'leicht',
        ingredients: [{ sectionTitle: 'H', items: [{ quantity: '1', unit: 'Stk', name: 'X' }] }],
        instructions: ['Schritt'],
        nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
        tags: {
          course: [],
          cuisine: [],
          occasion: [],
          mainIngredient: [],
          prepMethod: [],
          diet: [],
        },
        expertTips: [],
      }),
    );

    const settings = {
      ...getDefaultSettings(),
      localAi: {
        ...getDefaultSettings().localAi,
        enableWebLlmInference: true,
        preferredGenerativeModel: 'webllm-llama-3.2-1b' as const,
      },
    };

    const { generateRecipeWithWebLlm } = await import('../localAiWebLlmService');
    const recipe = await generateRecipeWithWebLlm(
      { craving: 'Pasta', includeIngredients: [], excludeIngredients: [], modifiers: [] },
      [],
      settings.aiPreferences,
      { recipeTitle: 'Idee', shortDescription: 'kurz' },
      settings,
    );

    expect(recipe?.recipeTitle).toBe('T');
  });

  it('generateRecipeWithWebLlm gibt null bei leerem Rezept zurueck', async () => {
    mockCompleteWebLlmChat.mockResolvedValueOnce(
      JSON.stringify({
        recipeTitle: 'T',
        shortDescription: 'S',
        prepTime: '5',
        cookTime: '10',
        totalTime: '15',
        servings: '2',
        difficulty: 'leicht',
        ingredients: [],
        instructions: [],
        nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
        tags: {
          course: [],
          cuisine: [],
          occasion: [],
          mainIngredient: [],
          prepMethod: [],
          diet: [],
        },
        expertTips: [],
      }),
    );

    const settings = {
      ...getDefaultSettings(),
      localAi: {
        ...getDefaultSettings().localAi,
        enableWebLlmInference: true,
        preferredGenerativeModel: 'webllm-llama-3.2-1b' as const,
      },
    };

    const { generateRecipeWithWebLlm } = await import('../localAiWebLlmService');
    const recipe = await generateRecipeWithWebLlm(
      { craving: 'Pasta', includeIngredients: [], excludeIngredients: [], modifiers: [] },
      [],
      settings.aiPreferences,
      { recipeTitle: 'Idee', shortDescription: 'kurz' },
      settings,
    );

    expect(recipe).toBeNull();
  });

  it('gibt null zurueck wenn Inferenz deaktiviert', async () => {
    const settings = getDefaultSettings();
    const { generateRecipeIdeasWithWebLlm } = await import('../localAiWebLlmService');
    const ideas = await generateRecipeIdeasWithWebLlm(
      { craving: 'Pasta', includeIngredients: [], excludeIngredients: [], modifiers: [] },
      [],
      settings.aiPreferences,
      settings,
    );
    expect(ideas).toBeNull();
    expect(mockCompleteWebLlmChat).not.toHaveBeenCalled();
  });
});
