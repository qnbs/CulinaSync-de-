import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDefaultSettings } from '../settingsMerge';

const classifyPantryImage = vi.fn();
const loadSettings = vi.fn();

vi.mock('@domain/ai-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@domain/ai-core')>();
  return {
    ...actual,
    classifyPantryImage: (...args: unknown[]) => classifyPantryImage(...args),
  };
});

vi.mock('../settingsService', () => ({
  loadSettings: () => loadSettings(),
  getDefaultSettings: () => getDefaultSettings(),
}));

vi.mock('../errorLoggingService', () => ({
  logAppError: vi.fn(),
}));

describe('extractPantryItemsFromImageLocal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    loadSettings.mockReturnValue({
      ...getDefaultSettings(),
      localAi: {
        ...getDefaultSettings().localAi,
        enabled: true,
        enableVision: true,
        stripExifOnVision: false,
      },
    });
  });

  it('gibt null wenn Vision deaktiviert', async () => {
    loadSettings.mockReturnValue(getDefaultSettings());
    const { extractPantryItemsFromImageLocal } = await import('../localAiVisionService');
    await expect(
      extractPantryItemsFromImageLocal(new File(['x'], 'a.jpg', { type: 'image/jpeg' })),
    ).resolves.toBeNull();
  });

  it('gibt lokalisierte Labels bei Hits zurück', async () => {
    classifyPantryImage.mockResolvedValue([
      { label: 'tomato', score: 0.9 },
      { label: 'milk', score: 0.8 },
    ]);
    const { extractPantryItemsFromImageLocal, resetVisionWorkerForTests } = await import(
      '../localAiVisionService'
    );
    resetVisionWorkerForTests();
    const text = await extractPantryItemsFromImageLocal(
      new File(['x'], 'a.jpg', { type: 'image/jpeg' }),
    );
    expect(text).toMatch(/Tomate|tomato/i);
    expect(classifyPantryImage).toHaveBeenCalled();
  });

  it('gibt null bei leeren Hits und bei Fehlern', async () => {
    classifyPantryImage.mockResolvedValueOnce([]);
    const mod = await import('../localAiVisionService');
    mod.resetVisionWorkerForTests();
    await expect(
      mod.extractPantryItemsFromImageLocal(new File(['x'], 'a.jpg', { type: 'image/jpeg' })),
    ).resolves.toBeNull();

    classifyPantryImage.mockRejectedValueOnce(new Error('boom'));
    await expect(
      mod.extractPantryItemsFromImageLocal(new File(['x'], 'a.jpg', { type: 'image/jpeg' })),
    ).resolves.toBeNull();
  });
});
