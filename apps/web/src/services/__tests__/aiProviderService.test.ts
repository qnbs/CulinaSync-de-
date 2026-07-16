import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSettings, PantryItem } from '../../types';
import { getDefaultSettings } from '../settingsMerge';
import { resetGpuTierCacheForTests } from '@domain/ai-core';

const mockGenerateRecipeIdeas = vi.fn();
const mockGenerateRecipe = vi.fn();
const mockGenerateShoppingList = vi.fn();
const mockExtractPantry = vi.fn();
const mockLoadSettings = vi.fn();
const mockLocalVision = vi.fn();
const mockGetCached = vi.fn();
const mockSetCached = vi.fn();
const mockBuildCacheHash = vi.fn();
const mockOllamaIdeas = vi.fn();
const mockOllamaRecipe = vi.fn();
const mockWebLlmIdeas = vi.fn();
const mockWebLlmRecipe = vi.fn();
const mockGetWebLlmEngineStatus = vi.fn();
const mockIsWebLlmLayerEnabled = vi.fn();

vi.mock('../settingsService', () => ({
  loadSettings: () => mockLoadSettings(),
  getDefaultSettings: () => getDefaultSettings(),
}));

vi.mock('../geminiService', () => ({
  generateRecipeIdeas: (...args: unknown[]) => mockGenerateRecipeIdeas(...args),
  generateRecipe: (...args: unknown[]) => mockGenerateRecipe(...args),
  generateShoppingList: (...args: unknown[]) => mockGenerateShoppingList(...args),
  extractPantryItemsFromImage: (...args: unknown[]) => mockExtractPantry(...args),
}));

vi.mock('../localAiVisionService', () => ({
  extractPantryItemsFromImageLocal: (...args: unknown[]) => mockLocalVision(...args),
}));

vi.mock('../localAiInferenceCacheService', () => ({
  buildInferenceCacheHash: (...args: unknown[]) => mockBuildCacheHash(...args),
  getCachedInference: (...args: unknown[]) => mockGetCached(...args),
  setCachedInference: (...args: unknown[]) => mockSetCached(...args),
}));

vi.mock('../localAiOllamaService', () => ({
  generateRecipeIdeasWithOllama: (...args: unknown[]) => mockOllamaIdeas(...args),
  generateRecipeWithOllama: (...args: unknown[]) => mockOllamaRecipe(...args),
}));

vi.mock('../localAiWebLlmService', () => ({
  generateRecipeIdeasWithWebLlm: (...args: unknown[]) => mockWebLlmIdeas(...args),
  generateRecipeWithWebLlm: (...args: unknown[]) => mockWebLlmRecipe(...args),
}));

vi.mock('@domain/ai-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@domain/ai-core')>();
  return {
    ...actual,
    getWebLlmEngineStatus: (...args: unknown[]) => mockGetWebLlmEngineStatus(...args),
    isWebLlmLayerEnabled: (...args: unknown[]) => mockIsWebLlmLayerEnabled(...args),
  };
});

const pantryItems: PantryItem[] = [
  {
    id: 1,
    name: 'Tomaten',
    quantity: 4,
    unit: 'Stk',
    category: 'Gemüse',
    createdAt: 1,
    updatedAt: 1,
  },
];

const prompt = {
  craving: 'Pasta',
  includeIngredients: ['Basilikum'],
  excludeIngredients: [],
  modifiers: [],
};

describe('aiProviderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetGpuTierCacheForTests();
    mockLoadSettings.mockReturnValue(getDefaultSettings());
    // Default: WebLLM aus — bestehende Heuristik-/Ollama-Tests bleiben unberührt
    mockGetWebLlmEngineStatus.mockResolvedValue({ available: false, reason: 'disabled' });
    mockIsWebLlmLayerEnabled.mockReturnValue(false);
  });

  it('nutzt lokalen Stack bei local-first ohne Gemini', async () => {
    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'local-first' },
    };
    mockLoadSettings.mockReturnValue(settings);

    const { generateRecipeIdeas } = await import('../aiProviderService');
    const ideas = await generateRecipeIdeas(prompt, pantryItems, settings.aiPreferences);

    expect(ideas).toHaveLength(3);
    expect(mockGenerateRecipeIdeas).not.toHaveBeenCalled();
  });

  it('nutzt lokalen Pfad bei localOnlyMode', async () => {
    const settings: AppSettings = {
      ...getDefaultSettings(),
      localAi: { ...getDefaultSettings().localAi, localOnlyMode: true },
    };
    mockLoadSettings.mockReturnValue(settings);

    const { generateShoppingList } = await import('../aiProviderService');
    const list = await generateShoppingList('grill', pantryItems, []);
    expect(list.length).toBeGreaterThan(0);
    expect(mockGenerateRecipeIdeas).not.toHaveBeenCalled();
  });

  it('delegiert an Gemini bei cloud-first und Erfolg', async () => {
    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'cloud-first' },
    };
    mockLoadSettings.mockReturnValue(settings);
    mockGenerateRecipeIdeas.mockResolvedValueOnce([{ recipeTitle: 'Cloud', shortDescription: 'x' }]);

    const { generateRecipeIdeas } = await import('../aiProviderService');
    const ideas = await generateRecipeIdeas(prompt, pantryItems, settings.aiPreferences);
    expect(ideas[0]?.recipeTitle).toBe('Cloud');
  });

  it('faellt bei Cloud-Fehler auf Heuristik zurueck', async () => {
    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'cloud-first' },
    };
    mockLoadSettings.mockReturnValue(settings);
    mockGenerateRecipeIdeas.mockRejectedValueOnce(new Error('Kein API-Schluessel konfiguriert'));

    const { generateRecipeIdeas } = await import('../aiProviderService');
    const ideas = await generateRecipeIdeas(prompt, pantryItems, settings.aiPreferences);

    expect(ideas.length).toBeGreaterThan(0);
  });

  it('generateRecipe nutzt Cloud bei cloud-first', async () => {
    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'cloud-first' },
    };
    mockLoadSettings.mockReturnValue(settings);
    mockGenerateRecipe.mockResolvedValueOnce({ recipeTitle: 'Cloud-Rezept' });

    const { generateRecipe } = await import('../aiProviderService');
    const recipe = await generateRecipe(prompt, pantryItems, settings.aiPreferences, {
      recipeTitle: 'Idee',
      shortDescription: 'x',
    });
    expect(recipe.recipeTitle).toBe('Cloud-Rezept');
  });

  it('generateShoppingList wirft bei nicht-offline Cloud-Fehler', async () => {
    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'cloud-first' },
    };
    mockLoadSettings.mockReturnValue(settings);
    mockGenerateShoppingList.mockRejectedValueOnce(new Error('validation failed'));

    const { generateShoppingList } = await import('../aiProviderService');
    await expect(generateShoppingList('x', pantryItems, [])).rejects.toThrow('validation');
  });

  it('extractPantryItemsFromImage bevorzugt lokalen Vision-Pfad', async () => {
    mockLocalVision.mockResolvedValueOnce('Tomate, Milch');
    const { extractPantryItemsFromImage } = await import('../aiProviderService');
    await expect(
      extractPantryItemsFromImage(new File(['x'], 'a.jpg', { type: 'image/jpeg' })),
    ).resolves.toBe('Tomate, Milch');
    expect(mockExtractPantry).not.toHaveBeenCalled();
  });

  it('extractPantryItemsFromImage fällt auf Gemini zurück', async () => {
    mockLocalVision.mockResolvedValueOnce(null);
    mockExtractPantry.mockResolvedValueOnce('Karotte');
    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'cloud-first' },
    };
    mockLoadSettings.mockReturnValue(settings);
    const { extractPantryItemsFromImage } = await import('../aiProviderService');
    await expect(
      extractPantryItemsFromImage(new File(['x'], 'a.jpg', { type: 'image/jpeg' })),
    ).resolves.toBe('Karotte');
  });

  it('extractPantryItemsFromImage wirft bei local-only ohne lokalen Hit', async () => {
    mockLocalVision.mockResolvedValueOnce(null);
    const settings: AppSettings = {
      ...getDefaultSettings(),
      localAi: { ...getDefaultSettings().localAi, localOnlyMode: true },
    };
    mockLoadSettings.mockReturnValue(settings);
    const { extractPantryItemsFromImage } = await import('../aiProviderService');
    await expect(
      extractPantryItemsFromImage(new File(['x'], 'a.jpg', { type: 'image/jpeg' })),
    ).rejects.toThrow('local-vision-unavailable');
  });

  it('nutzt Inference-Cache Hit und Ollama bei local-first', async () => {
    mockBuildCacheHash.mockResolvedValue('hash-1');
    mockGetCached.mockResolvedValueOnce([{ recipeTitle: 'Cached', shortDescription: 'c' }]);
    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'local-first' },
      localAi: {
        ...getDefaultSettings().localAi,
        enabled: true,
        enableInferenceCache: true,
        ollamaEnabled: true,
      },
    };
    mockLoadSettings.mockReturnValue(settings);
    const { generateRecipeIdeas } = await import('../aiProviderService');
    const cached = await generateRecipeIdeas(prompt, pantryItems, settings.aiPreferences);
    expect(cached[0]?.recipeTitle).toBe('Cached');
    expect(mockOllamaIdeas).not.toHaveBeenCalled();

    mockGetCached.mockResolvedValueOnce(null);
    mockOllamaIdeas.mockResolvedValueOnce([{ recipeTitle: 'Ollama', shortDescription: 'o' }]);
    const ideas = await generateRecipeIdeas(prompt, pantryItems, settings.aiPreferences);
    expect(ideas[0]?.recipeTitle).toBe('Ollama');
    expect(mockSetCached).toHaveBeenCalled();
  });

  it('generateRecipe via Ollama bei local-first', async () => {
    mockBuildCacheHash.mockResolvedValue('hash-2');
    mockGetCached.mockResolvedValue(null);
    mockOllamaRecipe.mockResolvedValueOnce({
      recipeTitle: 'Ollama-Rezept',
      shortDescription: 'x',
      prepTime: '',
      cookTime: '',
      totalTime: '',
      servings: '2',
      difficulty: 'Einfach',
      ingredients: [],
      instructions: ['A'],
      nutritionPerServing: { calories: '', protein: '', fat: '', carbs: '' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      expertTips: [],
    });
    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'local-first' },
      localAi: {
        ...getDefaultSettings().localAi,
        enabled: true,
        enableInferenceCache: true,
        ollamaEnabled: true,
      },
    };
    mockLoadSettings.mockReturnValue(settings);
    const { generateRecipe } = await import('../aiProviderService');
    const recipe = await generateRecipe(
      prompt,
      pantryItems,
      settings.aiPreferences,
      { recipeTitle: 'Idee', shortDescription: 'd' },
    );
    expect(recipe.recipeTitle).toBe('Ollama-Rezept');
    expect(mockOllamaRecipe).toHaveBeenCalled();
  });

  it('nutzt WebLLM-Pfad wenn Layer verfuegbar (ohne Ollama)', async () => {
    mockGetWebLlmEngineStatus.mockResolvedValue({
      available: true,
      modelId: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    });
    mockIsWebLlmLayerEnabled.mockReturnValue(true);
    mockWebLlmIdeas.mockResolvedValueOnce([{ recipeTitle: 'WebLLM-Idee', shortDescription: 'lokal' }]);

    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'local-first' },
      localAi: {
        ...getDefaultSettings().localAi,
        enabled: true,
        enableWebLlmInference: true,
        ollamaEnabled: false,
        enableInferenceCache: false,
      },
    };
    mockLoadSettings.mockReturnValue(settings);

    const { generateRecipeIdeas } = await import('../aiProviderService');
    const ideas = await generateRecipeIdeas(prompt, pantryItems, settings.aiPreferences);

    expect(ideas[0]?.recipeTitle).toBe('WebLLM-Idee');
    expect(mockWebLlmIdeas).toHaveBeenCalled();
    expect(mockOllamaIdeas).not.toHaveBeenCalled();
  });

  it('generateRecipe nutzt WebLLM wenn verfuegbar', async () => {
    mockGetWebLlmEngineStatus.mockResolvedValue({
      available: true,
      modelId: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    });
    mockIsWebLlmLayerEnabled.mockReturnValue(true);
    mockWebLlmRecipe.mockResolvedValueOnce({
      recipeTitle: 'WebLLM-Rezept',
      shortDescription: 'x',
      prepTime: '',
      cookTime: '',
      totalTime: '',
      servings: '2',
      difficulty: 'Einfach',
      ingredients: [],
      instructions: ['A'],
      nutritionPerServing: { calories: '', protein: '', fat: '', carbs: '' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      expertTips: [],
    });

    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'local-first' },
      localAi: {
        ...getDefaultSettings().localAi,
        enabled: true,
        enableWebLlmInference: true,
        ollamaEnabled: false,
        enableInferenceCache: false,
      },
    };
    mockLoadSettings.mockReturnValue(settings);

    const { generateRecipe } = await import('../aiProviderService');
    const recipe = await generateRecipe(prompt, pantryItems, settings.aiPreferences, {
      recipeTitle: 'Idee',
      shortDescription: 'd',
    });

    expect(recipe.recipeTitle).toBe('WebLLM-Rezept');
    expect(mockWebLlmRecipe).toHaveBeenCalled();
  });

  it('generateRecipe faellt bei Cloud-Offline-Fehler auf lokal zurueck', async () => {
    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'cloud-first' },
    };
    mockLoadSettings.mockReturnValue(settings);
    mockGenerateRecipe.mockRejectedValueOnce(new Error('Kein API-Schluessel konfiguriert'));

    const { generateRecipe } = await import('../aiProviderService');
    const recipe = await generateRecipe(prompt, pantryItems, settings.aiPreferences, {
      recipeTitle: 'Idee',
      shortDescription: 'd',
    });
    expect(recipe.recipeTitle.length).toBeGreaterThan(0);
  });

  it('generateShoppingList faellt bei Offline-Cloud-Fehler lokal zurueck', async () => {
    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'cloud-first' },
    };
    mockLoadSettings.mockReturnValue(settings);
    // shouldUseOfflineFallback matched auf „network“ / Offline-Hinweise
    mockGenerateShoppingList.mockRejectedValueOnce(new Error('network unreachable'));

    const { generateShoppingList } = await import('../aiProviderService');
    const list = await generateShoppingList('salat', pantryItems, []);
    expect(list.length).toBeGreaterThan(0);
  });

  it('generateRecipeIdeas wirft nicht-offline Cloud-Fehler weiter', async () => {
    const settings: AppSettings = {
      ...getDefaultSettings(),
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'cloud-first' },
    };
    mockLoadSettings.mockReturnValue(settings);
    mockGenerateRecipeIdeas.mockRejectedValueOnce(new Error('schema validation failed'));

    const { generateRecipeIdeas } = await import('../aiProviderService');
    await expect(generateRecipeIdeas(prompt, pantryItems, settings.aiPreferences)).rejects.toThrow(
      'validation',
    );
  });
});
