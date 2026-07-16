import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDefaultSettings } from '../settingsMerge';

vi.mock('../errorLoggingService', () => ({
  logAppError: vi.fn(),
}));

vi.mock('../aiJsonParse', () => ({
  parseAiJsonWithSchema: (json: string) => JSON.parse(json),
  recipeIdeasResponseSchema: {},
  recipeAiSchema: {},
}));

vi.mock('../aiPromptBuilder', () => ({
  constructBasePrompt: () => 'prompt',
  geminiSystem: () => 'system',
}));

describe('localAiOllamaService generate*', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('generateRecipeIdeasWithOllama bei healthy server', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).endsWith('/api/tags')) {
          return new Response('{}', { status: 200 });
        }
        return new Response(
          JSON.stringify({
            message: {
              content: JSON.stringify({
                ideas: [{ recipeTitle: 'Pasta', shortDescription: 'Lecker' }],
              }),
            },
          }),
          { status: 200 },
        );
      }),
    );

    const settings = {
      ...getDefaultSettings(),
      localAi: {
        ...getDefaultSettings().localAi,
        ollamaEnabled: true,
        ollamaBaseUrl: 'http://127.0.0.1:11434',
      },
    };
    const { generateRecipeIdeasWithOllama } = await import('../localAiOllamaService');
    const ideas = await generateRecipeIdeasWithOllama(
      { craving: 'pasta', includeIngredients: [], excludeIngredients: [], modifiers: [] },
      [],
      settings.aiPreferences,
      settings,
    );
    expect(ideas?.[0]?.recipeTitle).toBe('Pasta');
  });

  it('generateRecipeWithOllama bei healthy server', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).endsWith('/api/tags')) {
          return new Response('{}', { status: 200 });
        }
        return new Response(
          JSON.stringify({
            message: {
              content: JSON.stringify({
                recipeTitle: 'Suppe',
                ingredients: [{ name: 'Wasser', quantity: 1, unit: 'L' }],
                instructions: ['Kochen'],
              }),
            },
          }),
          { status: 200 },
        );
      }),
    );

    const settings = {
      ...getDefaultSettings(),
      localAi: {
        ...getDefaultSettings().localAi,
        ollamaEnabled: true,
        ollamaBaseUrl: 'http://127.0.0.1:11434/',
      },
    };
    const { generateRecipeWithOllama } = await import('../localAiOllamaService');
    const recipe = await generateRecipeWithOllama(
      { craving: 'suppe', includeIngredients: [], excludeIngredients: [], modifiers: [] },
      [],
      settings.aiPreferences,
      { recipeTitle: 'Suppe', shortDescription: 'warm' },
      settings,
    );
    expect(recipe?.recipeTitle).toBe('Suppe');
  });

  it('gibt null wenn Ollama disabled oder unhealthy', async () => {
    const { generateRecipeIdeasWithOllama, generateRecipeWithOllama } = await import(
      '../localAiOllamaService'
    );
    const settings = getDefaultSettings();
    await expect(
      generateRecipeIdeasWithOllama(
        { craving: 'x', includeIngredients: [], excludeIngredients: [], modifiers: [] },
        [],
        settings.aiPreferences,
        settings,
      ),
    ).resolves.toBeNull();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('down');
      }),
    );
    const enabled = {
      ...settings,
      localAi: { ...settings.localAi, ollamaEnabled: true, ollamaBaseUrl: 'http://127.0.0.1:11434' },
    };
    await expect(
      generateRecipeWithOllama(
        { craving: 'x', includeIngredients: [], excludeIngredients: [], modifiers: [] },
        [],
        settings.aiPreferences,
        { recipeTitle: 'A', shortDescription: 'B' },
        enabled,
      ),
    ).resolves.toBeNull();
  });
});
