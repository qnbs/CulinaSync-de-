import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import {
  buildInferenceCacheHash,
  clearInferenceCache,
  enforceInferenceCacheQuota,
  estimateInferenceCacheBytes,
  getCachedInference,
  purgeExpiredInferenceCache,
  setCachedInference,
  setCachedInferenceWithQuota,
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

  it('enforces quota by evicting oldest entries', async () => {
    await db.aiInferenceCache.add({
      hash: 'a',
      task: 't',
      modelId: 'm',
      responseJson: 'x'.repeat(2000),
      createdAt: 1,
      expiresAt: Date.now() + 60_000,
    });
    await db.aiInferenceCache.add({
      hash: 'b',
      task: 't',
      modelId: 'm',
      responseJson: 'y'.repeat(2000),
      createdAt: 2,
      expiresAt: Date.now() + 60_000,
    });
    expect(await estimateInferenceCacheBytes()).toBeGreaterThanOrEqual(4000);
    const removed = await enforceInferenceCacheQuota(0.001); // ~1 KB
    expect(removed).toBeGreaterThan(0);
    expect(await db.aiInferenceCache.count()).toBeLessThan(2);
  });

  it('setCachedInferenceWithQuota trims after insert', async () => {
    const hash = await buildInferenceCacheHash('recipe', 'quota', 'm');
    await setCachedInferenceWithQuota(hash, 'recipe', 'm', { big: 'z'.repeat(5000) }, 24, 0.001);
    expect(await db.aiInferenceCache.count()).toBeLessThanOrEqual(1);
  });
});
