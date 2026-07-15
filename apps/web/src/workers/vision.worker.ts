import { classifyPantryImage } from '@domain/ai-core';

type VisionWorkerRequest = {
  id: number;
  image: Blob;
  minScore?: number;
};

const workerScope = self as typeof globalThis;

workerScope.addEventListener('message', async (event: MessageEvent<VisionWorkerRequest>) => {
  try {
    const hits = await classifyPantryImage(event.data.image, {
      minScore: event.data.minScore,
    });
    workerScope.postMessage({ id: event.data.id, hits });
  } catch (error) {
    workerScope.postMessage({
      id: event.data.id,
      error: error instanceof Error ? error.message : 'Vision-Klassifikation fehlgeschlagen.',
    });
  }
});

export {};
