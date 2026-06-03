import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadEncryptedBlob, uploadEncryptedBlob } from '../syncTransport';

describe('syncTransport', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uploadEncryptedBlob sendet PUT mit Bearer', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const payload = new Uint8Array([1, 2, 3]);
    await uploadEncryptedBlob('https://example.com/backup', payload, {
      type: 'bearer',
      token: 'token-1',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/backup',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ Authorization: 'Bearer token-1' }),
      }),
    );
  });

  it('downloadEncryptedBlob wirft bei HTTP-Fehler', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(downloadEncryptedBlob('https://example.com/x')).rejects.toThrow(/download-failed/);
  });

  it('downloadEncryptedBlob liefert ArrayBuffer als Uint8Array', async () => {
    const bytes = new Uint8Array([9, 8, 7]);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => bytes.buffer,
      }),
    );
    await expect(downloadEncryptedBlob('https://example.com/x')).resolves.toEqual(bytes);
  });
});
