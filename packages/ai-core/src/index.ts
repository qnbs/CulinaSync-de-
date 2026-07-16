export { sanitizeForPrompt, neutralizePromptInjection } from './sanitizeForPrompt.js';
export {
  WorkerBus,
  type WorkerBusTelemetryHandler,
  type WorkerJobPriority,
} from './workerBus.js';
export { createLocalAiFacade, type LocalAiFacade } from './localAiFacade.js';
export { tryImportOnnx, tryImportTransformers, tryImportWebLlm } from './optionalMlImports.js';

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
export {
  transcribeAudio,
  isWhisperAvailable,
  resetWhisperAsrForTests,
  WHISPER_MODEL_ID,
  WHISPER_MODEL_BY_SIZE,
  resolveWhisperModelId,
  type WhisperModelSize,
  type TranscribeAudioInput,
  type WhisperProgress,
} from './engines/whisperAsrEngine.js';
export { extractJsonPayload } from './jsonExtract.js';
export {
  completeWebLlmChat,
  getWebLlmEngineStatus,
  isWebLlmLayerEnabled,
  preloadWebLlmModel,
  resetWebLlmEngineForTests,
  unloadWebLlmEngine,
  type WebLlmChatMessage,
  type WebLlmCompletionOptions,
  type WebLlmEngineStatus,
  type WebLlmInitProgress,
} from './engines/localAiWebLlmEngine.js';
export {
  classifyPantryImage,
  isOnnxRuntimeAvailable,
  resetOnnxVisionForTests,
  PANTRY_VISION_CANDIDATE_LABELS,
  VISION_MODEL_ID,
  type VisionClassificationHit,
} from './engines/localAiOnnxEngine.js';
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
