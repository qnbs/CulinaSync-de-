import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../dbInstance';
import { getDefaultSettings } from '../settingsMerge';

const mockEmbedText = vi.fn();
const mockGetTransformersEngineStatus = vi.fn();

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
});
