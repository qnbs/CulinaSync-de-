import { detectGpuTier, resolveGpuTier, type GpuTier, type GpuTierPreference } from './config/gpuTier.js';
import {
  resolveGenerativeModel,
  type GenerativeModelId,
} from './config/modelRegistry.js';
import type { LocalAiRuntimeConfig } from './providers/types.js';

export type LocalAiRuntimeInput = {
  enabled: boolean;
  preferWebGpu: boolean;
  enableWebLlmInference: boolean;
  gpuTierPreference: GpuTierPreference;
  preferredGenerativeModel: GenerativeModelId;
  enableEmbeddings: boolean;
};

let cachedGpuTier: GpuTier | null = null;

export const resetGpuTierCacheForTests = (): void => {
  cachedGpuTier = null;
};

export const buildLocalAiRuntimeConfig = async (
  input: LocalAiRuntimeInput,
): Promise<LocalAiRuntimeConfig> => {
  if (cachedGpuTier === null) {
    const detection = await detectGpuTier();
    cachedGpuTier = detection.tier;
  }

  const resolvedGpuTier = resolveGpuTier(input.gpuTierPreference, cachedGpuTier);
  const model = resolveGenerativeModel(input.preferredGenerativeModel, resolvedGpuTier);

  return {
    enabled: input.enabled,
    preferWebGpu: input.preferWebGpu,
    enableWebLlmInference: input.enableWebLlmInference,
    gpuTierPreference: input.gpuTierPreference,
    preferredGenerativeModel: input.preferredGenerativeModel,
    enableEmbeddings: input.enableEmbeddings,
    resolvedGpuTier,
    resolvedModelId: model.id,
  };
};
