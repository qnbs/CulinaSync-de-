import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../dbInstance';
import { getDefaultSettings } from '../settingsMerge';

const mockEmbedText = vi.fn();
const mockGetTransformersEngineStatus = vi.fn();
const mockEnqueue = vi.fn((fn: () => Promise<void>) => {
  void fn();
  return Promise.resolve();
});

vi.mock('../embeddingWorkerService', () => ({
  embedTextInWorker: (text: string) => mockEmbedText(text),
}));

vi.mock('../localAiWorkerBus', () => ({
  getLocalAiWorkerBus: () => ({ enqueue: mockEnqueue }),
}));

vi.mock('@domain/ai-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@domain/ai-core')>();
  return {
    ...actual,
    embedText: (...args: unknown[]) => mockEmbedText(...args),
    getTransformersEngineStatus: (...args: unknown[]) => mockGetTransformersEngineStatus(...args),
  };
});

describe('localAiEmbeddingsService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await db.aiEmbeddings.clear();
    await db.mealPlan.clear();
    await db.recipes.clear();
    await db.pantry.clear();
    mockGetTransformersEngineStatus.mockResolvedValue({ available: true });
    mockEmbedText.mockImplementation(async (text: string) => {
      if (text.includes('Tomaten')) {
        return [1, 0, 0];
      }
      if (text.includes('Pasta')) {
        return [0.9, 0.1, 0];
      }
      return [0, 1, 0];
    });
  });

  it('indexPantryEmbedding speichert Vektor in Dexie', async () => {
    const id = await db.pantry.add({
      name: 'Tomaten',
      quantity: 2,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });

    const { indexPantryEmbedding } = await import('../localAiEmbeddingsService');
    await indexPantryEmbedding({
      id,
      name: 'Tomaten',
      quantity: 2,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });

    const stored = await db.aiEmbeddings.where('[sourceType+sourceId]').equals(['pantry', id]).first();
    expect(stored?.vector).toEqual([1, 0, 0]);
  });

  it('searchSemanticRagChunks liefert aehnliche Eintraege', async () => {
    const pantryId = await db.pantry.add({
      name: 'Tomaten',
      quantity: 2,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });

    const { indexPantryEmbedding, searchSemanticRagChunks } = await import('../localAiEmbeddingsService');
    await indexPantryEmbedding({
      id: pantryId,
      name: 'Tomaten',
      quantity: 2,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });

    const settings = {
      ...getDefaultSettings(),
      localAi: { ...getDefaultSettings().localAi, enableEmbeddings: true },
    };

    const chunks = await searchSemanticRagChunks({
      queryText: 'Tomaten Sauce',
      settings,
      limit: 4,
    });

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]?.sourceType).toBe('pantry');
  });

  it('isSemanticRagAvailable ist false ohne Embeddings-Flag', async () => {
    const { isSemanticRagAvailable } = await import('../localAiEmbeddingsService');
    const available = await isSemanticRagAvailable({
      ...getDefaultSettings(),
      localAi: { ...getDefaultSettings().localAi, enableEmbeddings: false },
    });
    expect(available).toBe(false);
  });

  it('isSemanticRagAvailable ist false wenn localAi deaktiviert', async () => {
    const { isSemanticRagAvailable } = await import('../localAiEmbeddingsService');
    const available = await isSemanticRagAvailable({
      ...getDefaultSettings(),
      localAi: { ...getDefaultSettings().localAi, enabled: false },
    });
    expect(available).toBe(false);
  });

  it('isSemanticRagAvailable ist false wenn Transformers fehlt', async () => {
    mockGetTransformersEngineStatus.mockResolvedValueOnce({ available: false, reason: 'module-missing' });
    const { isSemanticRagAvailable } = await import('../localAiEmbeddingsService');
    const available = await isSemanticRagAvailable(getDefaultSettings());
    expect(available).toBe(false);
  });

  it('indexPantryEmbedding ueberspringt bei gleichem contentHash', async () => {
    const id = await db.pantry.add({
      name: 'Tomaten',
      quantity: 1,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });
    const item = {
      id,
      name: 'Tomaten',
      quantity: 1,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    };

    const { indexPantryEmbedding } = await import('../localAiEmbeddingsService');
    await indexPantryEmbedding(item);
    await indexPantryEmbedding(item);

    expect(mockEmbedText).toHaveBeenCalledTimes(1);
  });

  it('indexPantryEmbedding bricht ab wenn embedText null liefert', async () => {
    mockEmbedText.mockResolvedValueOnce(null);
    const { indexPantryEmbedding } = await import('../localAiEmbeddingsService');
    await indexPantryEmbedding({
      id: 99,
      name: 'X',
      quantity: 1,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });
    const count = await db.aiEmbeddings.count();
    expect(count).toBe(0);
  });

  it('removeEmbeddingForSource entfernt Dexie-Eintrag', async () => {
    const id = await db.pantry.add({
      name: 'Tomaten',
      quantity: 1,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });
    const { indexPantryEmbedding, removeEmbeddingForSource } = await import('../localAiEmbeddingsService');
    await indexPantryEmbedding({
      id,
      name: 'Tomaten',
      quantity: 1,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });

    await removeEmbeddingForSource('pantry', id);
    expect(await db.aiEmbeddings.count()).toBe(0);
  });

  it('searchSemanticRagChunks filtert schwache Scores', async () => {
    const id = await db.pantry.add({
      name: 'Fremd',
      quantity: 1,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });

    await db.aiEmbeddings.add({
      sourceType: 'pantry',
      sourceId: id,
      contentHash: 'abc',
      modelId: 'Xenova/all-MiniLM-L6-v2',
      vector: [0, 1, 0],
      updatedAt: Date.now(),
    });

    mockEmbedText.mockResolvedValueOnce([1, 0, 0]);

    const { searchSemanticRagChunks } = await import('../localAiEmbeddingsService');
    const chunks = await searchSemanticRagChunks({
      queryText: 'orthogonal',
      settings: getDefaultSettings(),
      limit: 5,
    });

    expect(chunks).toHaveLength(0);
  });

  it('reindexAllEmbeddings indexiert Rezepte und Vorrat', async () => {
    await db.recipes.add({
      recipeTitle: 'Pasta Tomaten',
      shortDescription: 'x',
      prepTime: '5',
      cookTime: '10',
      totalTime: '15',
      servings: '2',
      difficulty: 'leicht',
      ingredients: [{ sectionTitle: 'H', items: [{ name: 'Tomaten', quantity: '1', unit: 'Stk' }] }],
      instructions: ['kochen'],
      nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      isFavorite: false,
      updatedAt: 1,
    } as never);

    const { reindexAllEmbeddings } = await import('../localAiEmbeddingsService');
    await reindexAllEmbeddings(getDefaultSettings());

    expect(await db.aiEmbeddings.count()).toBeGreaterThan(0);
  });

  it('indexMealPlanEmbedding speichert Vektor mit Rezepttitel', async () => {
    const recipeId = await db.recipes.add({
      recipeTitle: 'Linsensuppe',
      shortDescription: 'x',
      prepTime: '5',
      cookTime: '10',
      totalTime: '15',
      servings: '2',
      difficulty: 'leicht',
      ingredients: [{ sectionTitle: 'H', items: [{ name: 'Linsen', quantity: '1', unit: 'Stk' }] }],
      instructions: ['kochen'],
      nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      isFavorite: false,
      updatedAt: 1,
    } as never);

    const mealId = await db.mealPlan.add({
      date: '2026-06-10',
      mealType: 'Abendessen',
      recipeId,
      note: 'Reste',
    });

    const { indexMealPlanEmbedding } = await import('../localAiEmbeddingsService');
    await indexMealPlanEmbedding({
      id: mealId,
      date: '2026-06-10',
      mealType: 'Abendessen',
      recipeId,
      note: 'Reste',
    });

    const stored = await db.aiEmbeddings.where('[sourceType+sourceId]').equals(['mealPlan', mealId]).first();
    expect(stored?.sourceType).toBe('mealPlan');
    expect(mockEmbedText).toHaveBeenCalledWith(expect.stringContaining('Linsensuppe'));
  });

  it('searchSemanticRagChunks filtert per sourceType-Index', async () => {
    const pantryId = await db.pantry.add({
      name: 'Tomaten',
      quantity: 1,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });

    await db.aiEmbeddings.bulkAdd([
      {
        sourceType: 'pantry',
        sourceId: pantryId,
        contentHash: 'p1',
        modelId: 'Xenova/all-MiniLM-L6-v2',
        vector: [1, 0, 0],
        updatedAt: Date.now(),
      },
      {
        sourceType: 'mealPlan',
        sourceId: 99,
        contentHash: 'm1',
        modelId: 'Xenova/all-MiniLM-L6-v2',
        vector: [0, 1, 0],
        updatedAt: Date.now(),
      },
    ]);

    mockEmbedText.mockResolvedValueOnce([1, 0, 0]);

    const { searchSemanticRagChunks } = await import('../localAiEmbeddingsService');
    const settings = {
      ...getDefaultSettings(),
      aiPreferences: {
        ...getDefaultSettings().aiPreferences,
        useMealPlanContext: false,
      },
    };

    const chunks = await searchSemanticRagChunks({
      queryText: 'Tomaten',
      settings,
      limit: 5,
    });

    expect(chunks.every((chunk) => chunk.sourceType !== 'mealPlan')).toBe(true);
  });

  it('searchSemanticRagChunks liefert leer wenn alle Kontext-Flags aus', async () => {
    mockEmbedText.mockResolvedValueOnce([1, 0, 0]);
    const { searchSemanticRagChunks } = await import('../localAiEmbeddingsService');
    const settings = {
      ...getDefaultSettings(),
      aiPreferences: {
        ...getDefaultSettings().aiPreferences,
        usePantryContext: false,
        useRecipeHistoryContext: false,
        useMealPlanContext: false,
      },
    };

    const chunks = await searchSemanticRagChunks({
      queryText: 'Tomaten',
      settings,
      limit: 5,
    });

    expect(chunks).toEqual([]);
  });

  it('reindexAllEmbeddings indexiert auch Meal-Plan-Eintraege', async () => {
    await db.mealPlan.add({
      date: '2026-06-15',
      mealType: 'Mittagessen',
      note: 'Salat',
    });

    const { reindexAllEmbeddings } = await import('../localAiEmbeddingsService');
    await reindexAllEmbeddings(getDefaultSettings());

    const mealEmbedding = await db.aiEmbeddings.where('sourceType').equals('mealPlan').first();
    expect(mealEmbedding).toBeDefined();
  });

  it('indexMealPlanEmbedding ueberspringt Eintraege ohne id', async () => {
    const { indexMealPlanEmbedding } = await import('../localAiEmbeddingsService');
    await indexMealPlanEmbedding({ date: '2026-06-01', mealType: 'Abendessen', note: 'Pizza' });
    expect(mockEmbedText).not.toHaveBeenCalled();
  });

  it('indexRecipeEmbedding ueberspringt leeren Rezepttext', async () => {
    const { indexRecipeEmbedding } = await import('../localAiEmbeddingsService');
    await indexRecipeEmbedding({
      id: 5,
      recipeTitle: '   ',
      ingredients: [],
    } as never);
    expect(mockEmbedText).not.toHaveBeenCalled();
  });

  it('searchSemanticRagChunks liefert leer bei null query vector', async () => {
    mockEmbedText.mockResolvedValueOnce(null);
    const { searchSemanticRagChunks } = await import('../localAiEmbeddingsService');
    const chunks = await searchSemanticRagChunks({
      queryText: 'Tomaten',
      settings: getDefaultSettings(),
      limit: 5,
    });
    expect(chunks).toEqual([]);
  });

  it('indexPantryEmbedding aktualisiert bestehenden Eintrag bei neuem contentHash', async () => {
    const id = await db.pantry.add({
      name: 'Tomaten',
      quantity: 1,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });

    const { indexPantryEmbedding } = await import('../localAiEmbeddingsService');
    await indexPantryEmbedding({
      id,
      name: 'Tomaten',
      quantity: 1,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });

    mockEmbedText.mockResolvedValueOnce([0.2, 0.8, 0]);
    await indexPantryEmbedding({
      id,
      name: 'Tomaten',
      quantity: 5,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 2,
    });

    const stored = await db.aiEmbeddings.where('[sourceType+sourceId]').equals(['pantry', id]).first();
    expect(stored?.vector).toEqual([0.2, 0.8, 0]);
    expect(mockEmbedText).toHaveBeenCalledTimes(2);
    expect(await db.aiEmbeddings.count()).toBe(1);
  });

  it('indexPantryEmbedding ueberspringt Eintraege ohne id', async () => {
    const { indexPantryEmbedding } = await import('../localAiEmbeddingsService');
    await indexPantryEmbedding({
      name: 'OhneId',
      quantity: 1,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });
    expect(mockEmbedText).not.toHaveBeenCalled();
  });

  it('indexRecipeEmbedding ueberspringt Rezepte ohne id', async () => {
    const { indexRecipeEmbedding } = await import('../localAiEmbeddingsService');
    await indexRecipeEmbedding({
      recipeTitle: 'Ohne Id',
      shortDescription: 'x',
      prepTime: '1',
      cookTime: '1',
      totalTime: '2',
      servings: '1',
      difficulty: 'leicht',
      ingredients: [{ sectionTitle: '', items: [{ name: 'Salz', quantity: '1', unit: 'g' }] }],
      instructions: ['rühren'],
      nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      expertTips: [],
      isFavorite: false,
      updatedAt: 1,
    });
    expect(mockEmbedText).not.toHaveBeenCalled();
  });

  it('reindexAllEmbeddings bricht ab wenn Semantic RAG nicht verfuegbar', async () => {
    // enableEmbeddings:false → Early-Return ohne Engine-Status; kein mockResolvedValueOnce (sonst Leak)
    const { reindexAllEmbeddings } = await import('../localAiEmbeddingsService');
    await reindexAllEmbeddings({
      ...getDefaultSettings(),
      localAi: { ...getDefaultSettings().localAi, enableEmbeddings: false },
    });
    expect(mockEmbedText).not.toHaveBeenCalled();
    expect(mockGetTransformersEngineStatus).not.toHaveBeenCalled();
  });

  it('indexMealPlanEmbedding bricht ab wenn embedText null liefert', async () => {
    mockEmbedText.mockResolvedValueOnce(null);
    const mealId = await db.mealPlan.add({
      date: '2026-06-20',
      mealType: 'Frühstück',
      note: 'Joghurt',
    });
    const { indexMealPlanEmbedding } = await import('../localAiEmbeddingsService');
    await indexMealPlanEmbedding({
      id: mealId,
      date: '2026-06-20',
      mealType: 'Frühstück',
      note: 'Joghurt',
    });
    expect(await db.aiEmbeddings.count()).toBe(0);
  });

  it('indexMealPlanEmbedding ueberspringt bei gleichem contentHash', async () => {
    const mealId = await db.mealPlan.add({
      date: '2026-06-21',
      mealType: 'Mittagessen',
      note: 'Bowl',
    });
    const item = {
      id: mealId,
      date: '2026-06-21',
      mealType: 'Mittagessen' as const,
      note: 'Bowl',
    };
    const { indexMealPlanEmbedding } = await import('../localAiEmbeddingsService');
    await indexMealPlanEmbedding(item);
    await indexMealPlanEmbedding(item);
    expect(mockEmbedText).toHaveBeenCalledTimes(1);
  });

  it('searchSemanticRagChunks laedt Recipe- und MealPlan-Kontexttexte', async () => {
    const recipeId = await db.recipes.add({
      recipeTitle: 'Pasta Tomaten',
      shortDescription: 'x',
      prepTime: '5',
      cookTime: '10',
      totalTime: '15',
      servings: '2',
      difficulty: 'leicht',
      ingredients: [{ sectionTitle: 'H', items: [{ name: 'Tomaten', quantity: '1', unit: 'Stk' }] }],
      instructions: ['kochen'],
      nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      expertTips: [],
      isFavorite: false,
      updatedAt: 1,
    });

    const mealId = await db.mealPlan.add({
      date: '2026-06-22',
      mealType: 'Abendessen',
      recipeId,
      note: 'Reste',
    });

    await db.aiEmbeddings.bulkAdd([
      {
        sourceType: 'recipe',
        sourceId: recipeId,
        contentHash: 'r1',
        modelId: 'Xenova/all-MiniLM-L6-v2',
        vector: [1, 0, 0],
        updatedAt: Date.now(),
      },
      {
        sourceType: 'mealPlan',
        sourceId: mealId,
        contentHash: 'm1',
        modelId: 'Xenova/all-MiniLM-L6-v2',
        vector: [0.95, 0.05, 0],
        updatedAt: Date.now(),
      },
    ]);

    // Query-Vektor explizit setzen (mockImplementation wuerde sonst erneut greifen)
    mockEmbedText.mockReset();
    mockEmbedText.mockResolvedValue([1, 0, 0]);

    const { searchSemanticRagChunks } = await import('../localAiEmbeddingsService');
    const settings = {
      ...getDefaultSettings(),
      localAi: { ...getDefaultSettings().localAi, enableEmbeddings: true },
      aiPreferences: {
        ...getDefaultSettings().aiPreferences,
        useRecipeHistoryContext: true,
        usePantryContext: false,
        useMealPlanContext: true,
      },
    };

    const chunks = await searchSemanticRagChunks({
      queryText: 'Pasta Tomaten',
      settings,
      limit: 5,
    });

    expect(chunks.map((chunk) => chunk.sourceType).sort()).toEqual(['mealPlan', 'recipe']);
    expect(chunks.every((chunk) => chunk.text.length > 0)).toBe(true);
  });

  it('searchSemanticRagChunks ignoriert Embeddings mit leerem Vektor', async () => {
    const pantryId = await db.pantry.add({
      name: 'Tomaten',
      quantity: 1,
      unit: 'Stk',
      category: 'Gemüse',
      createdAt: 1,
      updatedAt: 1,
    });

    await db.aiEmbeddings.add({
      sourceType: 'pantry',
      sourceId: pantryId,
      contentHash: 'empty-vec',
      modelId: 'Xenova/all-MiniLM-L6-v2',
      vector: [],
      updatedAt: Date.now(),
    });

    mockEmbedText.mockResolvedValueOnce([1, 0, 0]);

    const { searchSemanticRagChunks } = await import('../localAiEmbeddingsService');
    const chunks = await searchSemanticRagChunks({
      queryText: 'Tomaten',
      settings: {
        ...getDefaultSettings(),
        aiPreferences: {
          ...getDefaultSettings().aiPreferences,
          useRecipeHistoryContext: false,
          useMealPlanContext: false,
        },
      },
      limit: 5,
    });

    expect(chunks).toEqual([]);
  });

  it('debouncedReindexAllEmbeddings enqueued nach Timeout', async () => {
    vi.useFakeTimers();
    const { debouncedReindexAllEmbeddings } = await import('../localAiEmbeddingsService');
    debouncedReindexAllEmbeddings(getDefaultSettings());
    expect(mockEnqueue).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(2000);
    expect(mockEnqueue).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
