import { tryImportTransformers } from '../optionalMlImports.js';

export const EMBEDDING_MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

type FeatureExtractionPipeline = (
  text: string,
  options?: { pooling?: string; normalize?: boolean },
) => Promise<{ data: Float32Array | number[] }>;

type TransformersModule = {
  pipeline: (
    task: string,
    model?: string,
  ) => Promise<FeatureExtractionPipeline>;
  env?: {
    allowLocalModels?: boolean;
    useBrowserCache?: boolean;
  };
};

let pipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

export const resetTransformersEmbeddingForTests = (): void => {
  pipelinePromise = null;
};

const getEmbeddingPipeline = async (): Promise<FeatureExtractionPipeline | null> => {
  const mod = (await tryImportTransformers()) as TransformersModule | null;
  if (!mod?.pipeline) {
    return null;
  }

  if (mod.env) {
    mod.env.allowLocalModels = true;
    mod.env.useBrowserCache = true;
  }

  if (!pipelinePromise) {
    pipelinePromise = mod.pipeline('feature-extraction', EMBEDDING_MODEL_ID);
  }

  return pipelinePromise;
};

export const embedText = async (text: string): Promise<number[] | null> => {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const extractor = await getEmbeddingPipeline();
  if (!extractor) {
    return null;
  }

  const output = await extractor(trimmed, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

export const embedTexts = async (texts: string[]): Promise<number[][] | null> => {
  const vectors: number[][] = [];
  for (const text of texts) {
    const vector = await embedText(text);
    if (!vector) {
      return null;
    }
    vectors.push(vector);
  }
  return vectors;
};

export const isTransformersEmbeddingAvailable = async (): Promise<boolean> => {
  const mod = await tryImportTransformers();
  return Boolean(mod);
};
