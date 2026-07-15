import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import {
  buildInferenceCacheHash,
  clearInferenceCache,
  getCachedInference,
  purgeExpiredInferenceCache,
  setCachedInference,
} from '../localAiInferenceCacheService';

describe('localAiInferenceCacheService', () => {
  beforeEach(async () => {
    await db.aiInferenceCache.clear();
  });

  it('hashes deterministisch und speichert/liest Antworten', async () => {
    const hash = await buildInferenceCacheHash('recipe-ideas', 'pasta|basil', 'model-a');
    const again = await buildInferenceCacheHash('recipe-ideas', 'pasta|basil', 'model-a');
    expect(hash).toBe(again);

    await setCachedInference(hash, 'recipe-ideas', 'model-a', [{ recipeTitle: 'A' }], 24);
    await expect(getCachedInference<{ recipeTitle: string }[]>(hash)).resolves.toEqual([
      { recipeTitle: 'A' },
    ]);
  });

  it('löscht abgelaufene Einträge beim Lesen und per purge', async () => {
    const hash = await buildInferenceCacheHash('recipe', 'x', 'm');
    await db.aiInferenceCache.add({
      hash,
      task: 'recipe',
      modelId: 'm',
      responseJson: JSON.stringify({ ok: true }),
      createdAt: Date.now() - 10_000,
      expiresAt: Date.now() - 1_000,
    });

    await expect(getCachedInference(hash)).resolves.toBeNull();
    expect(await db.aiInferenceCache.count()).toBe(0);

    await db.aiInferenceCache.add({
      hash: 'expired-2',
      task: 'recipe',
      modelId: 'm',
      responseJson: '{}',
      createdAt: 1,
      expiresAt: Date.now() - 5,
    });
    expect(await purgeExpiredInferenceCache()).toBe(1);
    await clearInferenceCache();
    expect(await db.aiInferenceCache.count()).toBe(0);
  });
});
