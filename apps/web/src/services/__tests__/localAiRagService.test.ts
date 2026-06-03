import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../dbInstance';
import { getDefaultSettings } from '../settingsMerge';
import { buildLocalAiRagContext, enrichPromptWithRag } from '../localAiRagService';

const mockSearchSemantic = vi.fn();

vi.mock('../localAiEmbeddingsService', () => ({
  searchSemanticRagChunks: (...args: unknown[]) => mockSearchSemantic(...args),
}));

describe('localAiRagService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockSearchSemantic.mockResolvedValue([]);
    await db.recipes.clear();
    await db.pantry.clear();
    await db.aiEmbeddings.clear();
  });

  it('buildLocalAiRagContext liefert passende Pantry-Chunks', async () => {
    await db.pantry.add({
      name: 'Tomaten',
      quantity: 3,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });

    const settings = getDefaultSettings();
    const context = await buildLocalAiRagContext({
      prompt: {
        craving: 'Tomaten',
        includeIngredients: [],
        excludeIngredients: [],
        modifiers: [],
      },
      settings,
    });

    expect(context.chunks.length).toBeGreaterThan(0);
    expect(context.promptBlock).toMatch(/Tomaten/i);
  });

  it('buildLocalAiRagContext indexiert Rezepte bei Keyword-Treffer', async () => {
    await db.recipes.add({
      recipeTitle: 'Tomaten-Basilikum-Pasta',
      shortDescription: 'Frisch',
      prepTime: '10',
      cookTime: '15',
      totalTime: '25',
      servings: '2',
      difficulty: 'leicht',
      ingredients: [{ sectionTitle: 'Haupt', items: [{ name: 'Tomaten', quantity: '2', unit: 'Stk' }] }],
      instructions: ['Kochen'],
      nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
      tags: { course: [], cuisine: [], occasion: [] },
      isFavorite: false,
      updatedAt: 1,
    } as never);

    const context = await buildLocalAiRagContext({
      prompt: {
        craving: 'Tomaten Pasta',
        includeIngredients: [],
        excludeIngredients: [],
        modifiers: [],
      },
      settings: getDefaultSettings(),
    });

    expect(context.chunks.some((chunk) => chunk.sourceType === 'recipe')).toBe(true);
  });

  it('nutzt semantic retrieval wenn nur Embeddings treffen', async () => {
    mockSearchSemantic.mockResolvedValueOnce([
      { sourceType: 'pantry', sourceId: 42, text: 'Basilikum frisch', score: 0.88 },
    ]);

    const context = await buildLocalAiRagContext({
      prompt: {
        craving: 'Basilikum',
        includeIngredients: [],
        excludeIngredients: [],
        modifiers: [],
      },
      settings: getDefaultSettings(),
    });

    expect(context.retrievalMode).toBe('semantic');
    expect(context.chunks[0]?.text).toMatch(/Basilikum/i);
  });

  it('nutzt hybrid retrieval wenn semantische Treffer vorliegen', async () => {
    const pantryId = await db.pantry.add({
      name: 'Tomaten',
      quantity: 2,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });

    mockSearchSemantic.mockResolvedValueOnce([
      { sourceType: 'pantry', sourceId: pantryId, text: 'Tomaten 2 Stk', score: 0.9 },
    ]);

    const context = await buildLocalAiRagContext({
      prompt: {
        craving: 'Tomaten',
        includeIngredients: [],
        excludeIngredients: [],
        modifiers: [],
      },
      settings: getDefaultSettings(),
    });

    expect(context.retrievalMode).toBe('hybrid');
    expect(context.chunks.length).toBeGreaterThan(0);
  });

  it('enrichPromptWithRag erweitert includeIngredients', () => {
    const enriched = enrichPromptWithRag(
      {
        craving: 'Pasta',
        includeIngredients: ['Basilikum'],
        excludeIngredients: [],
        modifiers: [],
      },
      {
        chunks: [],
        promptBlock: '- Tomaten 2 Stk',
        retrievalMode: 'keyword',
      },
    );

    expect(enriched.includeIngredients).toContain('tomaten');
  });
});
