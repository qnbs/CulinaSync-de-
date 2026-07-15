import { tryImportOnnx, tryImportTransformers } from '../optionalMlImports.js';

export const VISION_MODEL_ID = 'Xenova/clip-vit-base-patch32';

/** Kandidaten-Labels für Zero-Shot-Vorrats-/Lebensmittel-Erkennung (EN → Mapping in der App). */
export const PANTRY_VISION_CANDIDATE_LABELS = [
  'tomato',
  'onion',
  'garlic',
  'potato',
  'carrot',
  'cucumber',
  'lettuce',
  'pepper',
  'broccoli',
  'apple',
  'banana',
  'orange',
  'lemon',
  'milk',
  'cheese',
  'butter',
  'yogurt',
  'egg',
  'bread',
  'rice',
  'pasta',
  'flour',
  'sugar',
  'salt',
  'oil',
  'chicken',
  'beef',
  'fish',
  'shrimp',
  'tofu',
  'beans',
  'mushroom',
  'herb',
  'wine',
  'beer',
  'juice',
  'coffee',
  'tea',
  'chocolate',
  'nuts',
] as const;

export type VisionClassificationHit = {
  label: string;
  score: number;
};

type ZeroShotPipeline = (
  image: Blob | ImageBitmap | string,
  labels: readonly string[],
  options?: { hypothesis_template?: string },
) => Promise<Array<{ label: string; score: number }>>;

type TransformersModule = {
  pipeline: (
    task: 'zero-shot-image-classification',
    model: string,
    options?: { progress_callback?: (progress: { progress?: number; status?: string }) => void },
  ) => Promise<ZeroShotPipeline>;
};

let pipelinePromise: Promise<ZeroShotPipeline> | null = null;

export const resetOnnxVisionForTests = (): void => {
  pipelinePromise = null;
};

export const isOnnxRuntimeAvailable = async (): Promise<boolean> => {
  const ort = await tryImportOnnx();
  return ort != null;
};

const getVisionPipeline = async (
  onProgress?: (progress: { progress?: number; status?: string }) => void,
): Promise<ZeroShotPipeline | null> => {
  const mod = (await tryImportTransformers()) as TransformersModule | null;
  if (!mod?.pipeline) {
    return null;
  }

  if (!pipelinePromise) {
    pipelinePromise = mod.pipeline('zero-shot-image-classification', VISION_MODEL_ID, {
      progress_callback: onProgress,
    });
  }

  return pipelinePromise;
};

/**
 * Klassifiziert ein Vorratsfoto lokal (CLIP/ONNX via transformers.js).
 * onnxruntime-web wird als optionale Runtime erkannt; die Pipeline läuft über Transformers.
 */
export const classifyPantryImage = async (
  image: Blob | ImageBitmap,
  options?: {
    labels?: readonly string[];
    minScore?: number;
    onProgress?: (progress: { progress?: number; status?: string }) => void;
  },
): Promise<VisionClassificationHit[]> => {
  const pipe = await getVisionPipeline(options?.onProgress);
  if (!pipe) {
    throw new Error('vision-pipeline-unavailable');
  }

  // Warm optional ORT so bundlers keep the vendor-onnx path reachable.
  void isOnnxRuntimeAvailable();

  const labels = options?.labels ?? PANTRY_VISION_CANDIDATE_LABELS;
  const minScore = options?.minScore ?? 0.12;
  const raw = await pipe(image, labels, {
    hypothesis_template: 'a photo of {}',
  });

  return raw
    .filter((hit) => typeof hit.score === 'number' && hit.score >= minScore)
    .sort((left, right) => right.score - left.score)
    .slice(0, 12)
    .map((hit) => ({ label: hit.label, score: hit.score }));
};
