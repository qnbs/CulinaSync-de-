import { tryImportTransformers } from '../optionalMlImports.js';

export const WHISPER_MODEL_ID = 'Xenova/whisper-tiny';

export type WhisperModelSize = 'tiny' | 'base' | 'small';

/** Maps settings size → HuggingFace transformers model id (Xenova Whisper). */
export const WHISPER_MODEL_BY_SIZE: Record<WhisperModelSize, string> = {
  tiny: 'Xenova/whisper-tiny',
  base: 'Xenova/whisper-base',
  small: 'Xenova/whisper-small',
};

export const resolveWhisperModelId = (size?: string): string => {
  if (size === 'tiny' || size === 'base' || size === 'small') {
    return WHISPER_MODEL_BY_SIZE[size];
  }
  return WHISPER_MODEL_ID;
};

type AsrOptions = {
  language?: string;
  task?: 'transcribe' | 'translate';
  chunk_length_s?: number;
  stride_length_s?: number;
};

type AsrOutput = { text?: string };

type AutomaticSpeechRecognitionPipeline = (
  audio: Float32Array,
  options?: AsrOptions,
) => Promise<AsrOutput>;

type ProgressEvent = { progress?: number };

type TransformersModule = {
  pipeline: (
    task: string,
    model?: string,
    options?: { progress_callback?: (event: ProgressEvent) => void },
  ) => Promise<AutomaticSpeechRecognitionPipeline>;
  env?: {
    allowLocalModels?: boolean;
    useBrowserCache?: boolean;
  };
};

export type WhisperProgress = (ratio: number) => void;

export type TranscribeAudioInput = {
  /** Mono PCM samples at 16 kHz — Whisper's expected input. */
  audio: Float32Array;
  language?: string;
  model?: string;
};

let pipelinePromise: Promise<AutomaticSpeechRecognitionPipeline> | null = null;
let pipelineModel: string | null = null;

export const resetWhisperAsrForTests = (): void => {
  pipelinePromise = null;
  pipelineModel = null;
};

const getAsrPipeline = async (
  model: string,
  onProgress?: WhisperProgress,
): Promise<AutomaticSpeechRecognitionPipeline | null> => {
  const mod = (await tryImportTransformers()) as TransformersModule | null;
  if (!mod?.pipeline) {
    return null;
  }
  if (mod.env) {
    mod.env.allowLocalModels = true;
    mod.env.useBrowserCache = true;
  }
  if (!pipelinePromise || pipelineModel !== model) {
    pipelineModel = model;
    pipelinePromise = mod.pipeline('automatic-speech-recognition', model, {
      progress_callback: (event) => {
        if (onProgress && typeof event.progress === 'number') {
          onProgress(Math.max(0, Math.min(1, event.progress / 100)));
        }
      },
    });
  }
  return pipelinePromise;
};

/**
 * Transcribe mono 16 kHz PCM audio on-device via transformers.js Whisper.
 * Returns null when the optional transformers dependency is unavailable, so the
 * caller can degrade gracefully instead of hitting a hard failure.
 */
export const transcribeAudio = async (
  input: TranscribeAudioInput,
  onProgress?: WhisperProgress,
): Promise<string | null> => {
  if (!input.audio || input.audio.length === 0) {
    return '';
  }
  const asr = await getAsrPipeline(input.model ?? WHISPER_MODEL_ID, onProgress);
  if (!asr) {
    return null;
  }
  const output = await asr(input.audio, {
    language: input.language,
    task: 'transcribe',
    chunk_length_s: 30,
    stride_length_s: 5,
  });
  return typeof output.text === 'string' ? output.text.trim() : '';
};

export const isWhisperAvailable = async (): Promise<boolean> => {
  const mod = await tryImportTransformers();
  return Boolean(mod);
};
