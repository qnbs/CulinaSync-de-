import { describe, expect, it } from 'vitest';
import {
  assertAllowedEndpoint,
  isAllowedAiModelCdnUrl,
  isAllowedOllamaBaseUrl,
  parseHttpUrl,
} from '../networkEndpointPolicy';

describe('networkEndpointPolicy', () => {
  it('accepts loopback Ollama URLs only', () => {
    expect(isAllowedOllamaBaseUrl('http://127.0.0.1:11434')).toBe(true);
    expect(isAllowedOllamaBaseUrl('http://localhost:11434')).toBe(true);
    expect(isAllowedOllamaBaseUrl('https://evil.example/ollama')).toBe(false);
    expect(parseHttpUrl('ftp://127.0.0.1')).toBeNull();
  });

  it('allows known AI model CDN hosts', () => {
    expect(isAllowedAiModelCdnUrl('https://huggingface.co/api/models')).toBe(true);
    expect(isAllowedAiModelCdnUrl('https://cdn.jsdelivr.net/npm/@xenova/')).toBe(true);
    expect(isAllowedAiModelCdnUrl('http://huggingface.co/model')).toBe(false);
    expect(isAllowedAiModelCdnUrl('https://evil.example/model')).toBe(false);
  });

  it('assertAllowedEndpoint enforces purpose-specific rules', () => {
    assertAllowedEndpoint('https://generativelanguage.googleapis.com/v1beta/models', 'gemini_api');
    expect(() => assertAllowedEndpoint('https://evil.example', 'gemini_api')).toThrow(
      'network-endpoint-gemini-host',
    );
    expect(() => assertAllowedEndpoint('http://192.168.1.5:11434', 'ollama_loopback')).toThrow(
      'network-endpoint-ollama-loopback-only',
    );
    assertAllowedEndpoint('https://user-sync.example/ipfs', 'user_sync');
  });
});
