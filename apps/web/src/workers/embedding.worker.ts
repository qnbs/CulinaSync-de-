import { embedText } from '@domain/ai-core';

type EmbeddingWorkerRequest = {
  id: number;
  text: string;
};

const workerScope = self as typeof globalThis;

workerScope.addEventListener('message', async (event: MessageEvent<EmbeddingWorkerRequest>) => {
  try {
    const vector = await embedText(event.data.text);
    workerScope.postMessage({ id: event.data.id, vector });
  } catch (error) {
    workerScope.postMessage({
      id: event.data.id,
      error: error instanceof Error ? error.message : 'Embedding fehlgeschlagen.',
    });
  }
});

export {};
