// On-device speech-to-text via transformers.js Whisper, running off the main thread
// in a module worker. Audio is decoded to 16 kHz mono PCM on the main thread (a
// Worker has no AudioContext) and transferred to the worker for transcription.
// No hardcoded /public asset paths — the model is lazy-loaded (and browser-cached)
// by transformers.js; a missing model / offline host surfaces as a typed rejection
// instead of a silent 404.

export interface WhisperResult {
  text: string;
  language?: string;
}

export interface WhisperOptions {
  language?: string;
  model?: string;
  onProgress?: (progress: number) => void;
}

type WorkerResponse =
  | { id: number; type: 'result'; text: string }
  | { id: number; type: 'progress'; progress: number }
  | { id: number; type: 'error'; error: string };

let whisperWorker: Worker | null = null;
let requestId = 0;

const isWorkerEnv = (): boolean =>
  typeof Worker !== 'undefined' && !import.meta.env.VITEST;

const getWorker = (): Worker | null => {
  if (!isWorkerEnv()) {
    return null;
  }
  if (!whisperWorker) {
    whisperWorker = new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), { type: 'module' });
  }
  return whisperWorker;
};

/** Pre-create the worker so the first transcription doesn't pay the startup cost. */
export const initWhisper = async (model?: string): Promise<void> => {
  void model; // model id is chosen per-request; kept for API compatibility
  getWorker();
};

type WebkitWindow = typeof globalThis & { webkitAudioContext?: typeof AudioContext };

// Decode a recorded blob (e.g. audio/webm Opus) to mono 16 kHz PCM.
const decodeToPcm16k = async (blob: Blob): Promise<Float32Array> => {
  const arrayBuffer = await blob.arrayBuffer();
  const Ctx = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Ctx) {
    throw new Error('audio-context-unavailable');
  }
  const decodeCtx = new Ctx();
  try {
    const decoded = await decodeCtx.decodeAudioData(arrayBuffer);
    const targetRate = 16_000;
    const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * targetRate), targetRate);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    // Copy out of the rendered buffer so the backing store can be transferred.
    return rendered.getChannelData(0).slice();
  } finally {
    void decodeCtx.close();
  }
};

export const transcribeWithWhisper = async (audioBlob: Blob, opts: WhisperOptions = {}): Promise<WhisperResult> => {
  const audio = await decodeToPcm16k(audioBlob);
  const worker = getWorker();

  if (!worker) {
    // No worker environment (tests / unsupported) — transcribe inline via ai-core.
    const { transcribeAudio } = await import('@domain/ai-core');
    const text = await transcribeAudio({ audio, language: opts.language, model: opts.model }, opts.onProgress);
    if (text === null) {
      throw new Error('whisper-unavailable');
    }
    return { text, language: opts.language };
  }

  return new Promise<WhisperResult>((resolve, reject) => {
    const id = requestId++;

    const cleanup = () => {
      worker.removeEventListener('message', onMessage as EventListener);
      worker.removeEventListener('error', onError);
    };

    const onMessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.id !== id) return;
      if (event.data.type === 'progress') {
        opts.onProgress?.(event.data.progress);
        return;
      }
      cleanup();
      if (event.data.type === 'result') {
        resolve({ text: event.data.text, language: opts.language });
      } else {
        reject(new Error(event.data.error));
      }
    };

    // Handle worker load/runtime errors instead of leaving the promise hanging (the audit gap).
    const onError = (event: ErrorEvent) => {
      cleanup();
      reject(new Error(event.message || 'whisper-worker-error'));
    };

    worker.addEventListener('message', onMessage as EventListener);
    worker.addEventListener('error', onError);
    worker.postMessage({ id, audio, language: opts.language, model: opts.model }, [audio.buffer]);
  });
};

export const resetWhisperWorkerForTests = (): void => {
  whisperWorker?.terminate();
  whisperWorker = null;
  requestId = 0;
};
