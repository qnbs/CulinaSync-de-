import { extractJsonPayload } from '../jsonExtract.js';
import { tryImportWebLlm } from '../optionalMlImports.js';

export type WebLlmChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type WebLlmInitProgress = {
  progress: number;
  text: string;
};

export type WebLlmCompletionOptions = {
  modelId: string;
  messages: WebLlmChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  onProgress?: (report: WebLlmInitProgress) => void;
};

type WebLlmEngine = {
  chat: {
    completions: {
      create: (request: Record<string, unknown>) => Promise<{
        choices?: Array<{ message?: { content?: string | null } }>;
      }>;
    };
  };
  unload: () => Promise<void>;
};

type WebLlmModule = {
  CreateMLCEngine: (
    modelId: string,
    engineConfig?: {
      initProgressCallback?: (report: { progress: number; text: string }) => void;
    },
  ) => Promise<WebLlmEngine>;
};

let enginePromise: Promise<WebLlmEngine> | null = null;
let loadedModelId: string | null = null;

export const resetWebLlmEngineForTests = (): void => {
  enginePromise = null;
  loadedModelId = null;
};

const loadEngine = async (
  modelId: string,
  onProgress?: (report: WebLlmInitProgress) => void,
): Promise<WebLlmEngine | null> => {
  const mod = (await tryImportWebLlm()) as WebLlmModule | null;
  if (!mod?.CreateMLCEngine) {
    return null;
  }

  if (loadedModelId !== modelId || !enginePromise) {
    // QNBS-v3: Download-UX — initProgressCallback für Settings/Prepare-Model
    enginePromise = mod.CreateMLCEngine(modelId, {
      initProgressCallback: onProgress
        ? (report) => {
            onProgress({
              progress: typeof report.progress === 'number' ? report.progress : 0,
              text: report.text ?? '',
            });
          }
        : undefined,
    });
    loadedModelId = modelId;
  }

  return enginePromise;
};

/** Lädt ein WebLLM-Modell (Download/Cache) ohne Chat — für Prepare-Model in Settings. */
export const preloadWebLlmModel = async (
  modelId: string,
  onProgress?: (report: WebLlmInitProgress) => void,
): Promise<boolean> => {
  const engine = await loadEngine(modelId, onProgress);
  return engine != null;
};

export const completeWebLlmChat = async (options: WebLlmCompletionOptions): Promise<string> => {
  const engine = await loadEngine(options.modelId, options.onProgress);
  if (!engine) {
    throw new Error('webllm-module-unavailable');
  }

  const response = await engine.chat.completions.create({
    messages: options.messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
    ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
  });

  const raw = response.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error('webllm-empty-response');
  }

  return options.jsonMode ? extractJsonPayload(raw) : raw;
};

export const unloadWebLlmEngine = async (): Promise<void> => {
  if (!enginePromise) {
    return;
  }
  try {
    const engine = await enginePromise;
    await engine.unload();
  } finally {
    enginePromise = null;
    loadedModelId = null;
  }
};
