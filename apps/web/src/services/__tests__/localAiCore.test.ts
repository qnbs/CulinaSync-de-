import { describe, expect, it, beforeEach } from 'vitest';
import {
  cosineSimilarity,
  extractJsonPayload,
  ProviderChainExhaustedError,
  rankByCosineSimilarity,
  resetGpuTierCacheForTests,
  resolveGenerativeModel,
  resolveGpuTier,
  runProviderChain,
  shouldSkipWebGpuLayer,
} from '@domain/ai-core';

describe('@domain/ai-core cosineSearch', () => {
  it('cosineSimilarity liefert 0 fuer leere Vektoren', () => {
    expect(cosineSimilarity([], [])).toBe(0);
  });

  it('cosineSimilarity erkennt identische Vektoren', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
  });

  it('rankByCosineSimilarity sortiert absteigend', () => {
    const ranked = rankByCosineSimilarity(
      [1, 0],
      [
        { vector: [0, 1], meta: 'b' },
        { vector: [1, 0], meta: 'a' },
      ],
      2,
    );
    expect(ranked[0]?.meta).toBe('a');
  });
});

describe('@domain/ai-core jsonExtract', () => {
  it('extractJsonPayload entfernt Markdown-Fences', () => {
    const json = extractJsonPayload('```json\n{"ideas":[]}\n```');
    expect(JSON.parse(json)).toEqual({ ideas: [] });
  });

  it('extractJsonPayload ohne json-Sprach-Tag', () => {
    const json = extractJsonPayload('```\n{"ok":true}\n```');
    expect(JSON.parse(json)).toEqual({ ok: true });
  });

  it('extractJsonPayload schneidet Rohtext zwischen geschweiften Klammern', () => {
    const json = extractJsonPayload('Hier ist JSON: {"a":1} Ende.');
    expect(JSON.parse(json)).toEqual({ a: 1 });
  });

  it('extractJsonPayload bleibt bei sehr langem LLM-Text performant', () => {
    const padding = 'x'.repeat(50_000);
    const json = extractJsonPayload(`${padding}\n\`\`\`json\n{"n":1}\n\`\`\``);
    expect(JSON.parse(json)).toEqual({ n: 1 });
  });
});

describe('@domain/ai-core provider chain', () => {
  it('runProviderChain nutzt ersten erfolgreichen Layer', async () => {
    const result = await runProviderChain([
      { layer: 'webllm', enabled: true, run: async () => null },
      { layer: 'heuristic', enabled: true, run: async () => 'ok' },
    ]);
    expect(result.layer).toBe('heuristic');
    expect(result.data).toBe('ok');
  });

  it('ueberspringt deaktivierte Layer', async () => {
    const result = await runProviderChain([
      { layer: 'webllm', enabled: false, run: async () => 'skip' },
      { layer: 'heuristic', enabled: true, run: async () => 'ok' },
    ]);
    expect(result.data).toBe('ok');
  });

  it('runProviderChain faellt auf naechsten Layer bei Fehler', async () => {
    const result = await runProviderChain([
      { layer: 'webllm', enabled: true, run: async () => { throw new Error('boom'); } },
      { layer: 'heuristic', enabled: true, run: async () => 'ok' },
    ]);
    expect(result.data).toBe('ok');
  });

  it('resolveGenerativeModel respektiert explizites Modell bei passendem Tier', () => {
    const entry = resolveGenerativeModel('webllm-llama-3.2-1b', 'high');
    expect(entry.id).toBe('webllm-llama-3.2-1b');
  });

  it('runProviderChain wirft wenn alle Layer fehlschlagen', async () => {
    await expect(
      runProviderChain([{ layer: 'webllm', enabled: true, run: async () => null }]),
    ).rejects.toBeInstanceOf(ProviderChainExhaustedError);
  });
});

describe('@domain/ai-core gpu tier', () => {
  beforeEach(() => {
    resetGpuTierCacheForTests();
  });

  it('resolveGpuTier respektiert manuelle Praeferenz', () => {
    expect(resolveGpuTier('efficient', 'high')).toBe('efficient');
  });

  it('shouldSkipWebGpuLayer fuer low tiers', () => {
    expect(shouldSkipWebGpuLayer('efficient')).toBe(true);
    expect(shouldSkipWebGpuLayer('high')).toBe(false);
  });
});

describe('@domain/ai-core model registry', () => {
  it('resolveGenerativeModel faellt auf heuristic-only zurueck', () => {
    const entry = resolveGenerativeModel('auto', 'cpu-only');
    expect(entry.id).toBe('heuristic-only');
  });

  it('resolveGenerativeModel waehlt WebLLM bei high tier', () => {
    const entry = resolveGenerativeModel('auto', 'high');
    expect(entry.layer).toBe('webllm');
  });
});
