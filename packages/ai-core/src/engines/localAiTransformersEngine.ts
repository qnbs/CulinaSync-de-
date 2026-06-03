import type { LocalAiRuntimeConfig } from '../providers/types.js';
import { tryImportTransformers } from '../optionalMlImports.js';

export type TransformersEngineStatus =
  | { available: true }
  | { available: false; reason: 'disabled' | 'module-missing' | 'not-implemented' };

export const getTransformersEngineStatus = async (
  config: LocalAiRuntimeConfig,
): Promise<TransformersEngineStatus> => {
  if (!config.enabled || !config.enableEmbeddings) {
    return { available: false, reason: 'disabled' };
  }

  const module = await tryImportTransformers();
  if (!module) {
    return { available: false, reason: 'module-missing' };
  }

  // Phase 1: Embeddings/RAG-Vektoren in M11.3; Flag bleibt für Settings-UI.
  return { available: false, reason: 'not-implemented' };
};

export const isTransformersLayerEnabled = (config: LocalAiRuntimeConfig): boolean =>
  config.enabled && config.enableEmbeddings;
