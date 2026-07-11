import { transcribeAudio } from '@domain/ai-core';

type WhisperWorkerRequest = {
  id: number;
  audio: Float32Array;
  language?: string;
  model?: string;
};

const workerScope = self as typeof globalThis;

workerScope.addEventListener('message', async (event: MessageEvent<WhisperWorkerRequest>) => {
  const { id, audio, language, model } = event.data;
  try {
    const text = await transcribeAudio(
      { audio, language, model },
      (progress) => workerScope.postMessage({ id, type: 'progress', progress }),
    );
    if (text === null) {
      // Optional transformers dependency unavailable — let the caller degrade.
      workerScope.postMessage({ id, type: 'error', error: 'whisper-unavailable' });
      return;
    }
    workerScope.postMessage({ id, type: 'result', text });
  } catch (error) {
    workerScope.postMessage({
      id,
      type: 'error',
      error: error instanceof Error ? error.message : 'whisper-failed',
    });
  }
});

export {};
