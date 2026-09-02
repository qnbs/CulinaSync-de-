import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchModelArtifact, verifyModelDownloadResponse } from '../localAiModelIntegrity';

describe('localAiModelIntegrity', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('verifyModelDownloadResponse rejects non-ok responses', () => {
    expect(verifyModelDownloadResponse(new Response(null, { status: 404 }))).toBe(false);
  });

  it('verifyModelDownloadResponse enforces minBytes when content-length is present', () => {
    const ok = new Response(null, { status: 200, headers: { 'content-length': '5000' } });
    const short = new Response(null, { status: 200, headers: { 'content-length': '10' } });
    const missing = new Response(null, { status: 200 });
    expect(verifyModelDownloadResponse(ok, { minBytes: 1000 })).toBe(true);
    expect(verifyModelDownloadResponse(short, { minBytes: 1000 })).toBe(false);
    expect(verifyModelDownloadResponse(missing, { minBytes: 1000 })).toBe(false);
  });

  it('verifyModelDownloadResponse rejects etag mismatch when etag header is present', () => {
    const response = new Response(null, {
      status: 200,
      headers: { etag: '"stale"' },
    });
    expect(verifyModelDownloadResponse(response, { etag: '"expected"' })).toBe(false);
    expect(verifyModelDownloadResponse(response, { etag: '"stale"' })).toBe(true);
  });

  it('verifyModelDownloadResponse rejects missing etag when expectation requires one', () => {
    const response = new Response(null, { status: 200 });
    expect(verifyModelDownloadResponse(response, { etag: '"expected"' })).toBe(false);
  });

  it('fetchModelArtifact blocks disallowed hosts', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await fetchModelArtifact('https://evil.example/model.bin');
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetchModelArtifact returns response for allowlisted CDN when integrity passes', async () => {
    const response = new Response('weights', {
      status: 200,
      headers: { 'content-length': '7' },
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);

    const result = await fetchModelArtifact('https://huggingface.co/org/model/resolve/main/weights.bin', {
      minBytes: 1,
    });
    expect(result).toBe(response);
  });

  it('verifyModelDownloadResponse rejects malformed content-length', () => {
    const response = new Response(null, { status: 200, headers: { 'content-length': 'abc' } });
    expect(verifyModelDownloadResponse(response, { minBytes: 100 })).toBe(false);
  });

  it('fetchModelArtifact uses redirect error mode', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('ok', { status: 200, headers: { 'content-length': '2' } }),
    );

    await fetchModelArtifact('https://cdn.jsdelivr.net/pkg/model.bin', { minBytes: 1 });
    expect(fetchSpy).toHaveBeenCalledWith('https://cdn.jsdelivr.net/pkg/model.bin', { redirect: 'error' });
  });

  it('fetchModelArtifact returns null when integrity check fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('x', { status: 200, headers: { 'content-length': '1' } }),
    );

    const result = await fetchModelArtifact('https://cdn.jsdelivr.net/pkg/model.bin', {
      minBytes: 10_000,
    });
    expect(result).toBeNull();
  });
});
