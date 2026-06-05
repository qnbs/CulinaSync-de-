import { embedText } from '@domain/ai-core';

type PendingRequest = {
  resolve: (vector: number[] | null) => void;
  reject: (error: Error) => void;
};

let worker: Worker | null = null;
let requestId = 0;
const pendingRequests = new Map<number, PendingRequest>();

const getWorker = (): Worker | null => {
  if (typeof Worker === 'undefined' || import.meta.env.VITEST) {
    return null;
  }

  if (!worker) {
    worker = new Worker(new URL('../workers/embedding.worker.ts', import.meta.url), { type: 'module' });
    worker.addEventListener(
      'message',
      (event: MessageEvent<{ id: number; vector?: number[] | null; error?: string }>) => {
        const pending = pendingRequests.get(event.data.id);
        if (!pending) {
          return;
        }

        pendingRequests.delete(event.data.id);
        if (event.data.error) {
          pending.reject(new Error(event.data.error));
          return;
        }

        pending.resolve(event.data.vector ?? null);
      },
    );
  }

  return worker;
};

// QNBS-v3: M11.4 — Transformers-Embeddings off Main Thread; Fallback bei fehlendem Worker
export const embedTextInWorker = async (text: string): Promise<number[] | null> => {
  const activeWorker = getWorker();
  if (!activeWorker) {
    return embedText(text);
  }

  return new Promise((resolve, reject) => {
    const id = requestId++;
    pendingRequests.set(id, { resolve, reject });
    activeWorker.postMessage({ id, text });
  });
};

export const resetEmbeddingWorkerForTests = (): void => {
  worker?.terminate();
  worker = null;
  pendingRequests.clear();
  requestId = 0;
};
