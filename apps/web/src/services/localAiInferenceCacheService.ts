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
