import type { ModelRegistryEntry } from '../config/modelRegistry.js';
import type { LocalAiRuntimeConfig } from '../providers/types.js';
import { tryImportWebLlm } from '../optionalMlImports.js';
import { shouldSkipWebGpuLayer } from '../config/gpuTier.js';

export type WebLlmEngineStatus =
  | { available: true; modelId: string }
  | { available: false; reason: 'disabled' | 'no-webgpu' | 'module-missing' | 'inference-off' };

export const getWebLlmEngineStatus = async (
  config: LocalAiRuntimeConfig,
  model: ModelRegistryEntry,
): Promise<WebLlmEngineStatus> => {
  if (!config.enabled || !config.enableWebLlmInference || model.layer !== 'webllm') {
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

  return { available: true, modelId: model.webLlmModelId };
};

export const isWebLlmLayerEnabled = (config: LocalAiRuntimeConfig): boolean =>
  config.enabled &&
  config.enableWebLlmInference &&
  config.preferredGenerativeModel !== 'heuristic-only' &&
  config.preferWebGpu &&
  !shouldSkipWebGpuLayer(config.resolvedGpuTier);

export {
  completeWebLlmChat,
  preloadWebLlmModel,
  resetWebLlmEngineForTests,
  unloadWebLlmEngine,
} from './webLlmEngineManager.js';
export type {
  WebLlmChatMessage,
  WebLlmCompletionOptions,
  WebLlmInitProgress,
} from './webLlmEngineManager.js';
