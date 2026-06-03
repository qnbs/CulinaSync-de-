import type { GpuTier } from './gpuTier.js';

export type GenerativeModelId =
  | 'auto'
  | 'webllm-qwen-2.5-1.5b'
  | 'webllm-phi-3.5'
  | 'webllm-llama-3.2-1b'
  | 'heuristic-only';

export type ModelRegistryEntry = {
  id: GenerativeModelId;
  labelKey: string;
  layer: 'webllm' | 'heuristic';
  approxSizeMb: number;
  minGpuTier: GpuTier;
  webLlmModelId?: string;
};

export const MODEL_REGISTRY: readonly ModelRegistryEntry[] = [
  {
    id: 'webllm-qwen-2.5-1.5b',
    labelKey: 'settings.localAi.models.qwen',
    layer: 'webllm',
    approxSizeMb: 1100,
    minGpuTier: 'balanced',
    webLlmModelId: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
  },
  {
    id: 'webllm-phi-3.5',
    labelKey: 'settings.localAi.models.phi',
    layer: 'webllm',
    approxSizeMb: 2200,
    minGpuTier: 'high',
    webLlmModelId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
  },
  {
    id: 'webllm-llama-3.2-1b',
    labelKey: 'settings.localAi.models.llama',
    layer: 'webllm',
    approxSizeMb: 900,
    minGpuTier: 'efficient',
    webLlmModelId: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
  },
  {
    id: 'heuristic-only',
    labelKey: 'settings.localAi.models.heuristic',
    layer: 'heuristic',
    approxSizeMb: 0,
    minGpuTier: 'cpu-only',
  },
] as const;

const GPU_TIER_RANK: Record<GpuTier, number> = {
  'cpu-only': 0,
  efficient: 1,
  balanced: 2,
  high: 3,
};

export const getModelEntry = (id: GenerativeModelId): ModelRegistryEntry | undefined =>
  MODEL_REGISTRY.find((entry) => entry.id === id);

export const resolveGenerativeModel = (
  preferred: GenerativeModelId,
  gpuTier: GpuTier,
): ModelRegistryEntry => {
  if (preferred === 'heuristic-only') {
    return getModelEntry('heuristic-only')!;
  }

  if (preferred !== 'auto') {
    const entry = getModelEntry(preferred);
    if (entry && GPU_TIER_RANK[gpuTier] >= GPU_TIER_RANK[entry.minGpuTier]) {
      return entry;
    }
  }

  const tierRank = GPU_TIER_RANK[gpuTier];
  const webLlmCandidates = MODEL_REGISTRY.filter(
    (entry) => entry.layer === 'webllm' && GPU_TIER_RANK[entry.minGpuTier] <= tierRank,
  );
  if (webLlmCandidates.length > 0) {
    return webLlmCandidates[webLlmCandidates.length - 1]!;
  }

  return getModelEntry('heuristic-only')!;
};
