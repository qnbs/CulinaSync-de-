import { afterEach, describe, expect, it, vi } from 'vitest';
import { probeOllamaHealth } from '../localAiOllamaService';

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
