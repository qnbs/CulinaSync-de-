import { describe, expect, it } from 'vitest';
import { layerOrderForGenerative } from './providerChain.js';

describe('layerOrderForGenerative', () => {
  it('lists generative layers without transformers (embeddings-only)', () => {
    expect(layerOrderForGenerative()).toEqual(['ollama', 'webllm', 'heuristic']);
  });
});
