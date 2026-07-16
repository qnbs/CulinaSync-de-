import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDefaultSettings } from '../settingsMerge';

const preloadWebLlmModel = vi.fn();
const buildLocalAiRuntimeConfig = vi.fn();
const resolveGenerativeModel = vi.fn();

vi.mock('@domain/ai-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@domain/ai-core')>();
  return {
    ...actual,
    preloadWebLlmModel: (...args: unknown[]) => preloadWebLlmModel(...args),
    buildLocalAiRuntimeConfig: (...args: unknown[]) => buildLocalAiRuntimeConfig(...args),
    resolveGenerativeModel: (...args: unknown[]) => resolveGenerativeModel(...args),
  };
});

vi.mock('../errorLoggingService', () => ({
  logAppError: vi.fn(),
}));

describe('localAiModelDownloadService resolve/prepare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('resolvePreferredWebLlmModelId respektiert Flags', async () => {
    const { resolvePreferredWebLlmModelId } = await import('../localAiModelDownloadService');
    await expect(resolvePreferredWebLlmModelId(getDefaultSettings())).resolves.toBeNull();

    const heuristic = {
      ...getDefaultSettings(),
      localAi: {
        ...getDefaultSettings().localAi,
        enabled: true,
        enableWebLlmInference: true,
        preferredGenerativeModel: 'heuristic-only' as const,
      },
    };
    await expect(resolvePreferredWebLlmModelId(heuristic)).resolves.toBeNull();
  });

  it('prepareWebLlmModel lädt und reportet Progress', async () => {
    buildLocalAiRuntimeConfig.mockResolvedValue({ resolvedGpuTier: 'balanced' });
    resolveGenerativeModel.mockReturnValue({
      id: 'webllm-qwen-2.5-1.5b',
      webLlmModelId: 'Qwen-Test',
    });
    preloadWebLlmModel.mockImplementation(async (_id, onProgress) => {
      onProgress?.({ progress: 0.5, text: 'half' });
      return true;
    });

    const settings = {
      ...getDefaultSettings(),
      localAi: {
        ...getDefaultSettings().localAi,
        enabled: true,
        enableWebLlmInference: true,
        preferredGenerativeModel: 'webllm-qwen-2.5-1.5b' as const,
      },
    };
    const { prepareWebLlmModel } = await import('../localAiModelDownloadService');
    const reports: Array<{ progress: number }> = [];
    const modelId = await prepareWebLlmModel(settings, (p) => reports.push(p));
    expect(modelId).toBe('Qwen-Test');
    expect(reports[0]?.progress).toBe(0.5);
  });

  it('prepareWebLlmModel gibt null bei Fehler', async () => {
    buildLocalAiRuntimeConfig.mockRejectedValue(new Error('gpu'));
    const settings = {
      ...getDefaultSettings(),
      localAi: {
        ...getDefaultSettings().localAi,
        enabled: true,
        enableWebLlmInference: true,
      },
    };
    const { prepareWebLlmModel } = await import('../localAiModelDownloadService');
    await expect(prepareWebLlmModel(settings)).resolves.toBeNull();
  });
});
