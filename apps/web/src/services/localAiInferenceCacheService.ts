import { db } from './db';
import { logAppError } from './errorLoggingService';
import type { AiGenerativeTask } from '@domain/ai-core';

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

export const buildInferenceCacheHash = async (
  task: AiGenerativeTask | string,
  promptKey: string,
  modelId: string,
): Promise<string> => {
  const payload = `${task}\0${promptKey}\0${modelId}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return toHex(digest);
};

// QNBS-v3: TTL-Inference-Cache in Dexie | spart WebLLM-Wiederholungen, Privacy-Wipe via clear
export const getCachedInference = async <T>(hash: string): Promise<T | null> => {
  try {
    const row = await db.aiInferenceCache.where('hash').equals(hash).first();
    if (!row) {
      return null;
    }
    if (row.expiresAt <= Date.now()) {
      await db.aiInferenceCache.delete(row.id!);
      return null;
    }
    return JSON.parse(row.responseJson) as T;
  } catch (error) {
    void logAppError(error, 'localAiInferenceCache.get');
    return null;
  }
};

export const setCachedInference = async (
  hash: string,
  task: string,
  modelId: string,
  response: unknown,
  ttlHours: number,
): Promise<void> => {
  try {
    const now = Date.now();
    const expiresAt = now + Math.max(1, ttlHours) * 60 * 60 * 1000;
    const responseJson = JSON.stringify(response);
    const existing = await db.aiInferenceCache.where('hash').equals(hash).first();
    if (existing?.id != null) {
      await db.aiInferenceCache.update(existing.id, {
        task,
        modelId,
        responseJson,
        createdAt: now,
        expiresAt,
      });
      return;
    }
    await db.aiInferenceCache.add({
      hash,
      task,
      modelId,
      responseJson,
      createdAt: now,
      expiresAt,
    });
  } catch (error) {
    void logAppError(error, 'localAiInferenceCache.set');
  }
};

export const setCachedInferenceWithQuota = async (
  hash: string,
  task: string,
  modelId: string,
  response: unknown,
  ttlHours: number,
  maxStorageMb: number,
): Promise<void> => {
  await setCachedInference(hash, task, modelId, response, ttlHours);
  await enforceInferenceCacheQuota(maxStorageMb);
};

export const clearInferenceCache = async (): Promise<void> => {
  try {
    await db.aiInferenceCache.clear();
  } catch (error) {
    void logAppError(error, 'localAiInferenceCache.clear');
  }
};

export const purgeExpiredInferenceCache = async (): Promise<number> => {
  try {
    return await db.aiInferenceCache.where('expiresAt').belowOrEqual(Date.now()).delete();
  } catch (error) {
    void logAppError(error, 'localAiInferenceCache.purge');
    return 0;
  }
};

/** Sum stored JSON payload bytes (UTF-8 estimate) for quota enforcement. */
export const estimateInferenceCacheBytes = async (): Promise<number> => {
  try {
    const rows = await db.aiInferenceCache.toArray();
    return rows.reduce((sum, row) => sum + row.responseJson.length, 0);
  } catch (error) {
    void logAppError(error, 'localAiInferenceCache.estimateBytes');
    return 0;
  }
};

// QNBS-v3: Enforce local AI inference cache quota from settings maxModelStorageMb
export const enforceInferenceCacheQuota = async (maxStorageMb: number): Promise<number> => {
  const maxBytes = Math.max(1, Math.floor(maxStorageMb * 1024 * 1024));
  try {
    const rows = await db.aiInferenceCache.toArray();
    rows.sort((a, b) => a.createdAt - b.createdAt);
    let total = rows.reduce((sum, row) => sum + row.responseJson.length, 0);
    let removed = 0;
    while (total > maxBytes && rows.length > 0) {
      const oldest = rows.shift();
      if (!oldest?.id) break;
      await db.aiInferenceCache.delete(oldest.id);
      total -= oldest.responseJson.length;
      removed += 1;
    }
    return removed;
  } catch (error) {
    void logAppError(error, 'localAiInferenceCache.enforceQuota');
    return 0;
  }
};
