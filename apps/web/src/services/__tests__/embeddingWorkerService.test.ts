import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEmbedText = vi.fn();

vi.mock('@domain/ai-core', () => ({
  embedText: (...args: unknown[]) => mockEmbedText(...args),
}));

describe('embeddingWorkerService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockEmbedText.mockResolvedValue([0.1, 0.2]);
  });

  it('nutzt Main-Thread-Fallback unter Vitest', async () => {
    const { embedTextInWorker } = await import('../embeddingWorkerService');
    const vector = await embedTextInWorker('Tomaten');
    expect(vector).toEqual([0.1, 0.2]);
    expect(mockEmbedText).toHaveBeenCalledWith('Tomaten');
  });

  it('resetEmbeddingWorkerForTests raeumt Worker auf', async () => {
    const { resetEmbeddingWorkerForTests, embedTextInWorker } = await import('../embeddingWorkerService');
    await embedTextInWorker('test');
    resetEmbeddingWorkerForTests();
    await embedTextInWorker('test2');
    expect(mockEmbedText).toHaveBeenCalledTimes(2);
  });
});
