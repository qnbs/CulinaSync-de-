import { afterEach, describe, expect, it, vi } from 'vitest';
import { stripImageExif } from '../localAiVisionService';

describe('stripImageExif', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('re-encodiert über OffscreenCanvas wenn verfügbar', async () => {
    const close = vi.fn();
    const drawImage = vi.fn();
    const convertToBlob = vi.fn(async () => new Blob(['jpeg'], { type: 'image/jpeg' }));
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => ({ width: 10, height: 10, close })),
    );
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        width: number;
        height: number;
        constructor(w: number, h: number) {
          this.width = w;
          this.height = h;
        }
        getContext() {
          return { drawImage };
        }
        convertToBlob = convertToBlob;
      },
    );

    const file = new File(['raw'], 'x.jpg', { type: 'image/jpeg' });
    const out = await stripImageExif(file);
    expect(out).toBeInstanceOf(Blob);
    expect(convertToBlob).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });

  it('gibt Original zurück wenn createImageBitmap fehlt', async () => {
    vi.stubGlobal('createImageBitmap', undefined);
    const file = new File(['raw'], 'x.jpg', { type: 'image/jpeg' });
    await expect(stripImageExif(file)).resolves.toBe(file);
  });
});
