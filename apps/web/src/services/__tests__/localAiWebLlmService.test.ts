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
