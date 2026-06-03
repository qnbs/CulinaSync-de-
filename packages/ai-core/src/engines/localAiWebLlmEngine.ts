import type { ModelRegistryEntry } from '../config/modelRegistry.js';
import type { LocalAiRuntimeConfig } from '../providers/types.js';
import { tryImportWebLlm } from '../optionalMlImports.js';
import { shouldSkipWebGpuLayer } from '../config/gpuTier.js';

export type WebLlmEngineStatus =
  | { available: true; modelId: string }
  | { available: false; reason: 'disabled' | 'no-webgpu' | 'module-missing' | 'not-implemented' };

export const getWebLlmEngineStatus = async (
  config: LocalAiRuntimeConfig,
  model: ModelRegistryEntry,
): Promise<WebLlmEngineStatus> => {
  if (!config.enabled || model.layer !== 'webllm') {
    return { available: false, reason: 'disabled' };
  }

  if (config.preferredGenerativeModel === 'heuristic-only') {
    return { available: false, reason: 'disabled' };
  }

  if (!config.preferWebGpu || shouldSkipWebGpuLayer(config.resolvedGpuTier)) {
    return { available: false, reason: 'no-webgpu' };
  }

  const module = await tryImportWebLlm();
  if (!module) {
    return { available: false, reason: 'module-missing' };
  }

  if (!model.webLlmModelId) {
    return { available: false, reason: 'disabled' };
  }

  // Phase 1: Modul-Ladepfad verifiziert; Inferenz folgt in M11.2 (Feature-Flag bleibt aktiv).
  return { available: false, reason: 'not-implemented' };
};

export const isWebLlmLayerEnabled = (config: LocalAiRuntimeConfig): boolean =>
  config.enabled &&
  config.preferredGenerativeModel !== 'heuristic-only' &&
  config.preferWebGpu &&
  !shouldSkipWebGpuLayer(config.resolvedGpuTier);
