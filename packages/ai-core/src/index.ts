export { sanitizeForPrompt } from './sanitizeForPrompt.js';
export {
  WorkerBus,
  type WorkerBusTelemetryHandler,
  type WorkerJobPriority,
} from './workerBus.js';
export { createLocalAiFacade, type LocalAiFacade } from './localAiFacade.js';
export { tryImportTransformers, tryImportWebLlm } from './optionalMlImports.js';

export {
  detectGpuTier,
  resolveGpuTier,
  shouldSkipWebGpuLayer,
  type GpuTier,
  type GpuTierDetection,
  type GpuTierPreference,
} from './config/gpuTier.js';

export {
  MODEL_REGISTRY,
  getModelEntry,
  resolveGenerativeModel,
  type GenerativeModelId,
  type ModelRegistryEntry,
} from './config/modelRegistry.js';

export {
  runProviderChain,
  layerOrderForGenerative,
} from './providers/providerChain.js';

export {
  ProviderChainExhaustedError,
  type AiGenerativeTask,
  type LocalAiLayerId,
  type LocalAiRuntimeConfig,
  type ProviderAttempt,
  type ProviderChainResult,
} from './providers/types.js';

export { runHeuristicEngine, type HeuristicEngineHandlers } from './engines/localAiHeuristicEngine.js';
export { extractJsonPayload } from './jsonExtract.js';
export {
  completeWebLlmChat,
  getWebLlmEngineStatus,
  isWebLlmLayerEnabled,
  resetWebLlmEngineForTests,
  unloadWebLlmEngine,
  type WebLlmChatMessage,
  type WebLlmCompletionOptions,
  type WebLlmEngineStatus,
} from './engines/localAiWebLlmEngine.js';
export {
  embedText,
  embedTexts,
  EMBEDDING_MODEL_ID,
  getTransformersEngineStatus,
  isTransformersEmbeddingAvailable,
  isTransformersLayerEnabled,
  resetTransformersEmbeddingForTests,
  type TransformersEngineStatus,
} from './engines/localAiTransformersEngine.js';

export {
  cosineSimilarity,
  rankByCosineSimilarity,
  type ScoredVector,
} from './rag/cosineSearch.js';

export {
  buildLocalAiRuntimeConfig,
  resetGpuTierCacheForTests,
  type LocalAiRuntimeInput,
} from './localAiRuntime.js';
