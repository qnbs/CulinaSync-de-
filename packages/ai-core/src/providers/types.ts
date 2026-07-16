import type { GenerativeModelId } from '../config/modelRegistry.js';
import type { GpuTier, GpuTierPreference } from '../config/gpuTier.js';

export type LocalAiLayerId = 'ollama' | 'webllm' | 'transformers' | 'heuristic';

export type AiGenerativeTask = 'recipe-ideas' | 'recipe' | 'shopping-list';

export type LocalAiRuntimeConfig = {
  enabled: boolean;
  preferWebGpu: boolean;
  enableWebLlmInference: boolean;
  gpuTierPreference: GpuTierPreference;
  preferredGenerativeModel: GenerativeModelId;
  enableEmbeddings: boolean;
  resolvedGpuTier: GpuTier;
  resolvedModelId: GenerativeModelId;
};

export type ProviderAttempt<T> = {
  layer: LocalAiLayerId;
  enabled: boolean;
  run: () => Promise<T | null>;
};

export type ProviderChainResult<T> = {
  data: T;
  layer: LocalAiLayerId;
};

export class ProviderChainExhaustedError extends Error {
  public constructor(message = 'All local AI layers failed') {
    super(message);
    this.name = 'ProviderChainExhaustedError';
  }
}
