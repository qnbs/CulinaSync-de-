import { beforeEach, describe, expect, it, vi } from 'vitest';

const decodeSingle = vi.fn();
const recognize = vi.fn();

vi.mock('@ericblade/quagga2', () => ({
  default: { decodeSingle: (...args: unknown[]) => decodeSingle(...args) },
}));

vi.mock('tesseract.js', () => ({
  recognize: (...args: unknown[]) => recognize(...args),
}));

describe('scannerService coverage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    decodeSingle.mockReset();
    recognize.mockReset();
    // @ts-expect-error test override
    delete window.BarcodeDetector;
  });

  it('BarcodeDetector-Pfad liefert Code', async () => {
    const close = vi.fn();
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => ({ close })),
    );
    // @ts-expect-error test double
    window.BarcodeDetector = class {
      detect = vi.fn(async () => [{ rawValue: ' 4006381333931 ' }]);
    };

    const { scanBarcodeFromImage } = await import('../scannerService');
    const code = await scanBarcodeFromImage(new File(['x'], 'a.png', { type: 'image/png' }));
    expect(code).toBe('4006381333931');
    expect(close).toHaveBeenCalled();
  });

  it('fällt auf Quagga zurück und gibt null ohne Code', async () => {
    decodeSingle.mockResolvedValueOnce({});
    const { scanBarcodeFromImage } = await import('../scannerService');
    await expect(
      scanBarcodeFromImage(new File(['x'], 'a.png', { type: 'image/png' })),
    ).resolves.toBeNull();

    decodeSingle.mockResolvedValueOnce({ codeResult: { code: '123' } });
    await expect(
      scanBarcodeFromImage(new File(['x'], 'b.png', { type: 'image/png' })),
    ).resolves.toBe('123');
  });

  it('recognizeTextFromImage trimmt und leert', async () => {
    recognize.mockResolvedValueOnce({ data: { text: '  Hello  ' } });
    const { recognizeTextFromImage } = await import('../scannerService');
    await expect(
      recognizeTextFromImage(new File(['x'], 'c.png', { type: 'image/png' })),
    ).resolves.toBe('Hello');

    recognize.mockResolvedValueOnce({ data: { text: undefined } });
    await expect(
      recognizeTextFromImage(new File(['x'], 'd.png', { type: 'image/png' })),
    ).resolves.toBe('');
  });
});
