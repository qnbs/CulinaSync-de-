import { describe, expect, it } from 'vitest';
import {
  assertAllowedEndpoint,
  isAllowedAiModelCdnUrl,
  isAllowedCommunityShareUrl,
  isAllowedOllamaBaseUrl,
  isAllowedRecipeImportProxyUrl,
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
    expect(
      isAllowedAiModelCdnUrl(
        'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0/base/model.wasm',
      ),
    ).toBe(true);
    expect(
      isAllowedAiModelCdnUrl('https://raw.githubusercontent.com/other-org/repo/main/model.wasm'),
    ).toBe(false);
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
    assertAllowedEndpoint('http://192.168.0.10/remote.php/dav/files/user/backup', 'user_sync');
    expect(() => assertAllowedEndpoint('http://insecure.example', 'general_https')).toThrow(
      'network-endpoint-https-only',
    );
    expect(() => assertAllowedEndpoint('not-a-url', 'gemini_api')).toThrow('network-endpoint-invalid');
  });

  it('allows community share and recipe import proxy hosts only', () => {
    expect(isAllowedCommunityShareUrl('https://ipfs.infura.io:5001/api/v0/add')).toBe(true);
    expect(isAllowedCommunityShareUrl('https://evil.example/ipfs')).toBe(false);
    expect(isAllowedRecipeImportProxyUrl('https://r.jina.ai/http://example.com/recipe')).toBe(true);
    expect(isAllowedRecipeImportProxyUrl('https://evil.example/proxy')).toBe(false);
    assertAllowedEndpoint('https://ipfs.infura.io:5001/api/v0/add', 'community_share');
    assertAllowedEndpoint('https://r.jina.ai/http://chef.example/recipe', 'recipe_import_proxy');
  });
});
