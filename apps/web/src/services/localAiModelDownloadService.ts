import {
  buildLocalAiRuntimeConfig,
  preloadWebLlmModel,
  resolveGenerativeModel,
  type WebLlmInitProgress,
} from '@domain/ai-core';
import type { AppSettings } from '../types';
import { logAppError } from './errorLoggingService';

export type ModelDownloadProgress = WebLlmInitProgress & {
  modelId: string;
};

export const resolvePreferredWebLlmModelId = async (
  settings: AppSettings,
): Promise<string | null> => {
  if (!settings.localAi.enabled || !settings.localAi.enableWebLlmInference) {
    return null;
  }
  if (settings.localAi.preferredGenerativeModel === 'heuristic-only') {
    return null;
  }

  const runtime = await buildLocalAiRuntimeConfig({
    enabled: settings.localAi.enabled,
    preferWebGpu: settings.localAi.preferWebGpu,
    enableWebLlmInference: settings.localAi.enableWebLlmInference,
    gpuTierPreference: settings.localAi.gpuTierPreference,
    preferredGenerativeModel: settings.localAi.preferredGenerativeModel,
    enableEmbeddings: settings.localAi.enableEmbeddings,
  });
  const entry = resolveGenerativeModel(
    settings.localAi.preferredGenerativeModel,
    runtime.resolvedGpuTier,
  );
  return entry.webLlmModelId ?? null;
};

// QNBS-v3: Prepare-Model UX — WebLLM-Download mit Progress, markiert downloadedModels
export const prepareWebLlmModel = async (
  settings: AppSettings,
  onProgress?: (progress: ModelDownloadProgress) => void,
): Promise<string | null> => {
  try {
    const modelId = await resolvePreferredWebLlmModelId(settings);
    if (!modelId) {
      return null;
    }
    const ok = await preloadWebLlmModel(modelId, (report) => {
      onProgress?.({ ...report, modelId });
    });
    return ok ? modelId : null;
  } catch (error) {
    void logAppError(error, 'localAiModelDownload.prepare');
    return null;
  }
};

export const markModelDownloaded = (
  downloadedModels: string[],
  modelId: string,
): string[] => (downloadedModels.includes(modelId) ? downloadedModels : [...downloadedModels, modelId]);
