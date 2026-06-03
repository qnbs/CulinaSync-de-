import { extractJsonPayload } from '../jsonExtract.js';
import { tryImportWebLlm } from '../optionalMlImports.js';

export type WebLlmChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type WebLlmCompletionOptions = {
  modelId: string;
  messages: WebLlmChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
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

const loadEngine = async (modelId: string): Promise<WebLlmEngine | null> => {
  const mod = (await tryImportWebLlm()) as WebLlmModule | null;
  if (!mod?.CreateMLCEngine) {
    return null;
  }

  if (loadedModelId !== modelId || !enginePromise) {
    enginePromise = mod.CreateMLCEngine(modelId);
    loadedModelId = modelId;
  }

  return enginePromise;
};

export const completeWebLlmChat = async (options: WebLlmCompletionOptions): Promise<string> => {
  const engine = await loadEngine(options.modelId);
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
