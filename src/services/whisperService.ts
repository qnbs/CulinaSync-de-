// Whisper.cpp Integration (lokal, WebAssembly, privacy-first)
// Diese Datei kapselt die Whisper.cpp-Initialisierung und Transkriptions-API für Voice 2.0
// Hinweis: whisper.cpp muss als WASM-Bundle im public/-Ordner liegen (z.B. whisper.worker.js, model.bin)

export interface WhisperResult {
  text: string;
  segments?: { text: string; start: number; end: number }[];
}

export interface WhisperOptions {
  modelPath?: string; // z.B. '/whisper-tiny.bin'
  language?: string; // 'de', 'en', ...
  onProgress?: (progress: number) => void;
}

let whisperWorker: Worker | null = null;

export const initWhisper = async (modelPath = '/whisper-tiny.bin'): Promise<void> => {
  void modelPath;
  if (whisperWorker) return;
  whisperWorker = new Worker('/whisper.worker.js');
  // Worker-Init ggf. hier
};

export const transcribeWithWhisper = async (audioBlob: Blob, opts: WhisperOptions = {}): Promise<WhisperResult> => {
  await initWhisper(opts.modelPath);
  return new Promise((resolve, reject) => {
    if (!whisperWorker) return reject('Whisper-Worker nicht initialisiert');
    whisperWorker.onmessage = (e) => {
      if (e.data.type === 'result') resolve(e.data.result);
      if (e.data.type === 'error') reject(e.data.error);
      if (e.data.type === 'progress' && opts.onProgress) opts.onProgress(e.data.progress);
    };
    whisperWorker.postMessage({
      type: 'transcribe',
      audio: audioBlob,
      language: opts.language || 'de',
      modelPath: opts.modelPath || '/whisper-tiny.bin',
    });
  });
};
