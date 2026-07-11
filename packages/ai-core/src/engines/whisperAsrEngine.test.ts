import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../optionalMlImports.js', () => ({
  tryImportTransformers: vi.fn(),
  tryImportWebLlm: vi.fn(),
}));

import { tryImportTransformers } from '../optionalMlImports.js';
import {
  transcribeAudio,
  isWhisperAvailable,
  resetWhisperAsrForTests,
  WHISPER_MODEL_ID,
} from './whisperAsrEngine.js';

describe('whisperAsrEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetWhisperAsrForTests();
  });

  it('returns null when the optional transformers dependency is unavailable', async () => {
    vi.mocked(tryImportTransformers).mockResolvedValue(null);
    await expect(transcribeAudio({ audio: new Float32Array([0.1, 0.2]) })).resolves.toBeNull();
  });

  it('returns "" for empty audio without importing the model', async () => {
    await expect(transcribeAudio({ audio: new Float32Array(0) })).resolves.toBe('');
    expect(tryImportTransformers).not.toHaveBeenCalled();
  });

  it('runs the ASR pipeline and returns trimmed text', async () => {
    const asr = vi.fn().mockResolvedValue({ text: '  hallo welt  ' });
    const pipeline = vi.fn().mockResolvedValue(asr);
    vi.mocked(tryImportTransformers).mockResolvedValue({ pipeline, env: {} });

    const audio = new Float32Array([0.1, 0.2, 0.3]);
    await expect(transcribeAudio({ audio, language: 'de' })).resolves.toBe('hallo welt');
    expect(pipeline).toHaveBeenCalledWith('automatic-speech-recognition', WHISPER_MODEL_ID, expect.any(Object));
    expect(asr).toHaveBeenCalledWith(audio, expect.objectContaining({ language: 'de', task: 'transcribe' }));
  });

  it('reports availability from the transformers import', async () => {
    vi.mocked(tryImportTransformers).mockResolvedValue({ pipeline: vi.fn() });
    await expect(isWhisperAvailable()).resolves.toBe(true);

    vi.mocked(tryImportTransformers).mockResolvedValue(null);
    await expect(isWhisperAvailable()).resolves.toBe(false);
  });
});
