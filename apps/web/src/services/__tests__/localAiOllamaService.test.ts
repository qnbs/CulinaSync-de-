import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_OLLAMA_MODEL, probeOllamaHealth, resolveOllamaModel } from '../localAiOllamaService';
import { getDefaultSettings } from '../settingsMerge';

describe('resolveOllamaModel', () => {
  it('nutzt gültiges Settings-Modell', () => {
    const settings = getDefaultSettings();
    settings.localAi.ollamaModel = 'qwen2.5:7b';
    expect(resolveOllamaModel(settings)).toBe('qwen2.5:7b');
  });

  it('fällt auf Default zurück bei ungültigem Tag', () => {
    const settings = getDefaultSettings();
    settings.localAi.ollamaModel = 'bad name';
    expect(resolveOllamaModel(settings)).toBe(DEFAULT_OLLAMA_MODEL);
  });
});

describe('localAiOllamaService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('probeOllamaHealth gibt true bei ok zurück', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ models: [] }), { status: 200 })),
    );
    await expect(probeOllamaHealth('http://127.0.0.1:11434')).resolves.toBe(true);
  });

  it('probeOllamaHealth gibt false bei Netzwerkfehler zurück', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );
    await expect(probeOllamaHealth('http://127.0.0.1:11434')).resolves.toBe(false);
  });
});
