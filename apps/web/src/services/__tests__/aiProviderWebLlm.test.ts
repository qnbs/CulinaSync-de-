import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSettings, PantryItem } from '../../types';
import { getDefaultSettings } from '../settingsMerge';
import { resetGpuTierCacheForTests } from '@domain/ai-core';

const mockGenerateRecipeIdeasWithWebLlm = vi.fn();
const mockGetWebLlmEngineStatus = vi.fn();
const mockIsWebLlmLayerEnabled = vi.fn();

vi.mock('../localAiWebLlmService', () => ({
  generateRecipeIdeasWithWebLlm: (...args: unknown[]) => mockGenerateRecipeIdeasWithWebLlm(...args),
  generateRecipeWithWebLlm: vi.fn(),
}));

vi.mock('../settingsService', () => ({
  loadSettings: () => mockLoadSettings(),
  getDefaultSettings: () => getDefaultSettings(),
}));

vi.mock('../geminiService', () => ({
  generateRecipeIdeas: vi.fn(),
  generateRecipe: vi.fn(),
  generateShoppingList: vi.fn(),
}));

vi.mock('@domain/ai-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@domain/ai-core')>();
  return {
    ...actual,
    getWebLlmEngineStatus: (...args: unknown[]) => mockGetWebLlmEngineStatus(...args),
    isWebLlmLayerEnabled: (...args: unknown[]) => mockIsWebLlmLayerEnabled(...args),
    getTransformersEngineStatus: vi.fn().mockResolvedValue({ available: false, reason: 'disabled' }),
  };
});

const mockLoadSettings = vi.fn();

const pantryItems: PantryItem[] = [
  {
    id: 1,
    name: 'Tomaten',
    quantity: 2,
    unit: 'Stk',
    category: 'Gemüse',
    createdAt: 1,
    updatedAt: 1,
  },
];

const prompt = {
  craving: 'Pasta',
  includeIngredients: [],
  excludeIngredients: [],
  modifiers: [],
};

describe('aiProviderService WebLLM layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetGpuTierCacheForTests();
    mockGetWebLlmEngineStatus.mockResolvedValue({
      available: true,
      modelId: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    });
    mockIsWebLlmLayerEnabled.mockReturnValue(true);
    mockLoadSettings.mockReturnValue({
      ...getDefaultSettings(),
      localAi: {
        ...getDefaultSettings().localAi,
        enableWebLlmInference: true,
        preferredGenerativeModel: 'webllm-llama-3.2-1b',
      },
      aiPreferences: { ...getDefaultSettings().aiPreferences, routingMode: 'local-first' },
    } satisfies AppSettings);
  });

  it('nutzt WebLLM-Ergebnis in der Provider-Kette', async () => {
    mockGenerateRecipeIdeasWithWebLlm.mockResolvedValueOnce([
      { recipeTitle: 'WebLLM-Idee', shortDescription: 'lokal' },
    ]);

    const { generateRecipeIdeas } = await import('../aiProviderService');
    const settings = mockLoadSettings() as AppSettings;
    const ideas = await generateRecipeIdeas(prompt, pantryItems, settings.aiPreferences);

    expect(ideas[0]?.recipeTitle).toBe('WebLLM-Idee');
    expect(mockGenerateRecipeIdeasWithWebLlm).toHaveBeenCalled();
  });
});
