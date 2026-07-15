import { beforeEach, describe, expect, it, vi } from 'vitest';

const pipelineMock = vi.fn();
const tryImportTransformers = vi.fn();
const tryImportOnnx = vi.fn();

vi.mock('../../optionalMlImports.js', () => ({
  tryImportTransformers: () => tryImportTransformers(),
  tryImportOnnx: () => tryImportOnnx(),
}));

describe('localAiOnnxEngine', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    pipelineMock.mockReset();
    tryImportTransformers.mockReset();
    tryImportOnnx.mockReset();
  });

  it('klassifiziert Bild über Zero-Shot-Pipeline', async () => {
    pipelineMock.mockResolvedValue([
      { label: 'tomato', score: 0.9 },
      { label: 'milk', score: 0.05 },
    ]);
    tryImportTransformers.mockResolvedValue({
      pipeline: vi.fn(async () => pipelineMock),
    });
    tryImportOnnx.mockResolvedValue({ env: {} });

    const { classifyPantryImage, resetOnnxVisionForTests } = await import('../localAiOnnxEngine.js');
    resetOnnxVisionForTests();

    const hits = await classifyPantryImage(new Blob(['x'], { type: 'image/jpeg' }), {
      minScore: 0.1,
    });
    expect(hits).toEqual([{ label: 'tomato', score: 0.9 }]);
  });

  it('wirft wenn Transformers fehlt', async () => {
    tryImportTransformers.mockResolvedValue(null);
    const { classifyPantryImage, resetOnnxVisionForTests } = await import('../localAiOnnxEngine.js');
    resetOnnxVisionForTests();
    await expect(classifyPantryImage(new Blob(['x']))).rejects.toThrow('vision-pipeline-unavailable');
  });
});
