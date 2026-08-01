import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Recipe } from '../../types';

type WorkerGlobal = typeof globalThis & { __ENABLE_WORKER_TESTS__?: boolean };

class MockWorker extends EventTarget {
  public readonly terminate = vi.fn();
  public readonly postMessage = vi.fn();

  constructor(
    _url: URL | string,
    _options?: { type?: string },
  ) {
    super();
  }

  public emitMessage(data: unknown): void {
    this.dispatchEvent(new MessageEvent('message', { data }));
  }

  public emitError(message = 'mock-worker-crash'): void {
    this.dispatchEvent(new ErrorEvent('error', { message }));
  }
}

const minimalRecipe: Recipe = {
  id: 1,
  recipeTitle: 'Test',
  shortDescription: '',
  prepTime: '10',
  cookTime: '20',
  totalTime: '30',
  servings: '1',
  difficulty: 'leicht',
  ingredients: [{ sectionTitle: 'Main', items: [{ name: 'Tomato', quantity: '100', unit: 'g' }] }],
  instructions: [],
  nutritionPerServing: { calories: '0', protein: '0', carbs: '0', fat: '0' },
  tags: {
    course: [],
    cuisine: [],
    occasion: [],
    mainIngredient: [],
    prepMethod: [],
    diet: [],
  },
  expertTips: [],
};

describe('worker verification matrix', () => {
  let mockWorker: MockWorker;

  beforeEach(() => {
    vi.resetModules();
    (globalThis as WorkerGlobal).__ENABLE_WORKER_TESTS__ = true;
    mockWorker = new MockWorker('mock-url');
    vi.stubGlobal(
      'Worker',
      class extends MockWorker {
        constructor(url: URL | string, options?: { type?: string }) {
          super(url, options);
          return mockWorker;
        }
      },
    );
  });

  afterEach(() => {
    (globalThis as WorkerGlobal).__ENABLE_WORKER_TESTS__ = false;
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('embeddingWorkerService', () => {
    it('resolves vectors from worker messages', async () => {
      mockWorker.postMessage.mockImplementation((data: { id: number; text: string }) => {
        mockWorker.emitMessage({ id: data.id, vector: [0.5, 0.6] });
      });

      const { embedTextInWorker } = await import('../embeddingWorkerService');
      await expect(embedTextInWorker('Tomato')).resolves.toEqual([0.5, 0.6]);
    });

    it('rejects on worker error payload', async () => {
      mockWorker.postMessage.mockImplementation((data: { id: number }) => {
        mockWorker.emitMessage({ id: data.id, error: 'embedding-failed' });
      });

      const { embedTextInWorker } = await import('../embeddingWorkerService');
      await expect(embedTextInWorker('bad')).rejects.toThrow('embedding-failed');
    });

    it('ignores messages for unknown request ids', async () => {
      mockWorker.postMessage.mockImplementation((data: { id: number }) => {
        mockWorker.emitMessage({ id: data.id + 99, vector: [1] });
      });

      const { embedTextInWorker } = await import('../embeddingWorkerService');
      await expect(
        Promise.race([
          embedTextInWorker('orphan'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 200)),
        ]),
      ).rejects.toThrow('timeout');
    });

    it('rejects pending requests on worker crash and cleans up', async () => {
      mockWorker.postMessage.mockImplementation(() => {
        mockWorker.emitError('embedding-worker-crash');
      });

      const { embedTextInWorker, resetEmbeddingWorkerForTests } = await import('../embeddingWorkerService');
      await expect(embedTextInWorker('crash')).rejects.toThrow('embedding-worker-crash');

      resetEmbeddingWorkerForTests();
      expect(mockWorker.terminate).toHaveBeenCalled();
    });
  });

  describe('nutritionWorkerService', () => {
    it('resolves nutrition reports from worker messages', async () => {
      mockWorker.postMessage.mockImplementation((data: { id: number }) => {
        mockWorker.emitMessage({
          id: data.id,
          result: { matchedIngredients: 2, calories: 120, protein: 5, carbs: 10, fat: 3, allergens: [] },
        });
      });

      const { analyzeRecipeNutritionInWorker } = await import('../nutritionWorkerService');
      const report = await analyzeRecipeNutritionInWorker(minimalRecipe);
      expect(report.matchedIngredients).toBe(2);
      expect(report.calories).toBe(120);
    });

    it('rejects on worker error payload', async () => {
      mockWorker.postMessage.mockImplementation((data: { id: number }) => {
        mockWorker.emitMessage({ id: data.id, error: 'nutrition-failed' });
      });

      const { analyzeRecipeNutritionInWorker } = await import('../nutritionWorkerService');
      await expect(analyzeRecipeNutritionInWorker(minimalRecipe)).rejects.toThrow('nutrition-failed');
    });

    it('rejects pending requests on worker crash and cleans up', async () => {
      mockWorker.postMessage.mockImplementation(() => {
        mockWorker.emitError('nutrition-worker-crash');
      });

      const { analyzeRecipeNutritionInWorker, resetNutritionWorkerForTests } = await import(
        '../nutritionWorkerService'
      );
      await expect(analyzeRecipeNutritionInWorker(minimalRecipe)).rejects.toThrow('nutrition-worker-crash');

      resetNutritionWorkerForTests();
      expect(mockWorker.terminate).toHaveBeenCalled();
    });
  });

  describe('whisperService worker path', () => {
    it('transcribes via worker messages and rejects worker errors', async () => {
      const decodeAudioData = vi.fn(async () => ({
        duration: 0.1,
        numberOfChannels: 1,
        sampleRate: 48000,
        getChannelData: () => new Float32Array(4800),
      }));
      const close = vi.fn(async () => undefined);
      class FakeAudioContext {
        decodeAudioData = decodeAudioData;
        close = close;
      }
      class FakeOfflineAudioContext {
        createBufferSource() {
          return { buffer: null as unknown, connect: vi.fn(), start: vi.fn() };
        }
        destination = {};
        startRendering = vi.fn(async () => ({
          getChannelData: () => new Float32Array(1600),
        }));
        constructor(_channels: number, _length: number, _rate: number) {}
      }
      vi.stubGlobal('AudioContext', FakeAudioContext);
      vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);

      mockWorker.postMessage.mockImplementation((data: { id: number }) => {
        mockWorker.emitMessage({ id: data.id, type: 'result', text: 'hello worker' });
      });

      const { transcribeWithWhisper } = await import('../whisperService');
      const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/webm' });
      await expect(transcribeWithWhisper(blob, { language: 'en' })).resolves.toEqual({
        text: 'hello worker',
        language: 'en',
      });

      mockWorker.postMessage.mockImplementation((data: { id: number }) => {
        mockWorker.emitMessage({ id: data.id, type: 'error', error: 'whisper-failed' });
      });
      await expect(transcribeWithWhisper(blob)).rejects.toThrow('whisper-failed');

      mockWorker.postMessage.mockImplementation(() => {
        mockWorker.emitError('whisper-worker-crash');
      });
      await expect(transcribeWithWhisper(blob)).rejects.toThrow('whisper-worker-crash');
    });
  });
});
