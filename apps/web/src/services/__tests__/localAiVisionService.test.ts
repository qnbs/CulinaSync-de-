import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from 'i18next';
import {
  extractPantryItemsFromImageLocal,
  formatVisionHitsAsPantryText,
  resetVisionWorkerForTests,
  stripImageExif,
} from '../localAiVisionService';

const classifyPantryImage = vi.fn();

vi.mock('@domain/ai-core', () => ({
  classifyPantryImage: (...args: unknown[]) => classifyPantryImage(...args),
}));

vi.mock('../aiSettingsHelpers', () => ({
  getActiveSettingsForAi: () => ({
    localAi: {
      enabled: true,
      enableVision: true,
      stripExifOnVision: true,
    },
  }),
}));

describe('localAiVisionService', () => {
  beforeEach(() => {
    resetVisionWorkerForTests();
    vi.clearAllMocks();
    classifyPantryImage.mockResolvedValue([{ label: 'tomato', score: 0.9 }]);
  });

  it('formatiert Labels mit i18n', () => {
    void i18n.changeLanguage('de');
    const text = formatVisionHitsAsPantryText([
      { label: 'tomato', score: 0.9 },
      { label: 'milk', score: 0.8 },
    ]);
    expect(text).toContain('Tomate');
    expect(text).toContain('Milch');
  });

  it('fällt auf Roh-Label zurück wenn Key fehlt', () => {
    const text = formatVisionHitsAsPantryText([{ label: 'dragonfruit', score: 0.5 }]);
    expect(text).toBe('dragonfruit');
  });

  it('extractPantryItemsFromImageLocal klassifiziert mit EXIF-Strip', async () => {
    const createImageBitmap = vi.fn().mockResolvedValue({
      width: 10,
      height: 10,
      close: vi.fn(),
    });
    vi.stubGlobal('createImageBitmap', createImageBitmap);
    vi.stubGlobal('OffscreenCanvas', class {
      width = 0;
      height = 0;
      constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
      }
      getContext() {
        return { drawImage: vi.fn() };
      }
      convertToBlob() {
        return Promise.resolve(new Blob(['x'], { type: 'image/jpeg' }));
      }
    });

    const file = new File(['img'], 'pantry.jpg', { type: 'image/jpeg' });
    const text = await extractPantryItemsFromImageLocal(file);
    expect(text).toContain('Tomate');
    expect(classifyPantryImage).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('extractPantryItemsFromImageLocal gibt null bei leerem Ergebnis', async () => {
    classifyPantryImage.mockResolvedValueOnce([]);
    const file = new File(['img'], 'pantry.jpg', { type: 'image/jpeg' });
    const text = await extractPantryItemsFromImageLocal(file);
    expect(text).toBeNull();
  });

  it('stripImageExif gibt Original zurueck ohne createImageBitmap', async () => {
    vi.stubGlobal('createImageBitmap', undefined);
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    const blob = await stripImageExif(file);
    expect(blob).toBe(file);
    vi.unstubAllGlobals();
  });
});
