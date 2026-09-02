import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createGuardedMlFetch,
  installMlCdnFetchGuard,
  isMlCdnFetchGuardInstalled,
  restoreMlCdnFetchGuardForTests,
} from './mlCdnFetchGuard.js';
import { isAllowedMlCdnUrl } from './mlCdnHosts.js';

describe('mlCdnHosts', () => {
  it('allows Hugging Face and jsDelivr model artifacts', () => {
    expect(
      isAllowedMlCdnUrl('https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC/resolve/main/mlc-chat-config.json'),
    ).toBe(true);
    expect(isAllowedMlCdnUrl('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/')).toBe(true);
  });

  it('allows MLC wasm only under /mlc-ai/ on raw.githubusercontent.com', () => {
    expect(
      isAllowedMlCdnUrl(
        'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/Llama.wasm',
      ),
    ).toBe(true);
    expect(
      isAllowedMlCdnUrl('https://raw.githubusercontent.com/evil-org/binary-mlc-llm-libs/main/web-llm-models/evil.wasm'),
    ).toBe(false);
  });

  it('rejects non-HTTPS and unknown hosts', () => {
    expect(isAllowedMlCdnUrl('http://huggingface.co/model')).toBe(false);
    expect(isAllowedMlCdnUrl('https://evil.example/weights.bin')).toBe(false);
  });
});

describe('mlCdnFetchGuard', () => {
  afterEach(() => {
    restoreMlCdnFetchGuardForTests();
    vi.restoreAllMocks();
  });

  it('blocks disallowed paths on ML CDN hosts', async () => {
    const baseFetch = vi.fn();
    const guarded = createGuardedMlFetch(baseFetch as typeof fetch);
    await expect(
      guarded('https://raw.githubusercontent.com/evil-org/binary-mlc-llm-libs/main/model.wasm'),
    ).rejects.toThrow('ml-cdn-fetch-blocked');
    expect(baseFetch).not.toHaveBeenCalled();
  });

  it('uses redirect error for allowlisted ML CDN URLs', async () => {
    const baseFetch = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
    const guarded = createGuardedMlFetch(baseFetch as typeof fetch);
    await guarded('https://huggingface.co/mlc-ai/model/resolve/main/weights.bin');
    expect(baseFetch).toHaveBeenCalledWith(
      'https://huggingface.co/mlc-ai/model/resolve/main/weights.bin',
      { redirect: 'error' },
    );
  });

  it('passes through non-ML URLs unchanged', async () => {
    const baseFetch = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
    const guarded = createGuardedMlFetch(baseFetch as typeof fetch);
    await guarded('https://generativelanguage.googleapis.com/v1beta/models', { method: 'POST' });
    expect(baseFetch).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models',
      { method: 'POST' },
    );
  });

  it('installs a singleton global guard', () => {
    restoreMlCdnFetchGuardForTests();
    installMlCdnFetchGuard();
    expect(isMlCdnFetchGuardInstalled()).toBe(true);
    restoreMlCdnFetchGuardForTests();
    expect(isMlCdnFetchGuardInstalled()).toBe(false);
  });
});
