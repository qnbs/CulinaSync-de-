import type { LocalAiRuntimeConfig } from '../providers/types.js';
import { isTransformersEmbeddingAvailable } from './transformersEmbeddingEngine.js';

export type TransformersEngineStatus =
  | { available: true }
  | { available: false; reason: 'disabled' | 'module-missing' };

export const getTransformersEngineStatus = async (
  config: LocalAiRuntimeConfig,
): Promise<TransformersEngineStatus> => {
  if (!config.enabled || !config.enableEmbeddings) {
    return { available: false, reason: 'disabled' };
  }

  const available = await isTransformersEmbeddingAvailable();
  if (!available) {
    return { available: false, reason: 'module-missing' };
  }

  return { available: true };
};

export const isTransformersLayerEnabled = (config: LocalAiRuntimeConfig): boolean =>
  config.enabled && config.enableEmbeddings;

export {
  embedText,
  embedTexts,
  EMBEDDING_MODEL_ID,
  isTransformersEmbeddingAvailable,
  resetTransformersEmbeddingForTests,
} from './transformersEmbeddingEngine.js';
