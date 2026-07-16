import { beforeEach, describe, expect, it, vi } from 'vitest';

const transcribeAudio = vi.fn();

vi.mock('@domain/ai-core', () => ({
  transcribeAudio: (...args: unknown[]) => transcribeAudio(...args),
}));

describe('whisperService coverage (Vitest inline path)', () => {
  beforeEach(() => {
    vi.resetModules();
    transcribeAudio.mockReset();
  });

  it('initWhisper ist no-op ohne Worker', async () => {
    const { initWhisper } = await import('../whisperService');
    await expect(initWhisper('tiny')).resolves.toBeUndefined();
  });

  it('transkribiert inline und wirft bei null', async () => {
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
        return {
          buffer: null as unknown,
          connect: vi.fn(),
          start: vi.fn(),
        };
      }
      destination = {};
      startRendering = vi.fn(async () => ({
        getChannelData: () => new Float32Array(1600),
      }));
      constructor(_channels: number, _length: number, _rate: number) {}
    }
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);

    transcribeAudio.mockResolvedValueOnce('hallo');
    const { transcribeWithWhisper } = await import('../whisperService');
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/webm' });
    await expect(transcribeWithWhisper(blob, { language: 'de' })).resolves.toEqual({
      text: 'hallo',
      language: 'de',
    });

    transcribeAudio.mockResolvedValueOnce(null);
    await expect(transcribeWithWhisper(blob)).rejects.toThrow('whisper-unavailable');

    vi.unstubAllGlobals();
  });

  it('wirft ohne AudioContext', async () => {
    const prev = window.AudioContext;
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: undefined });
    Object.defineProperty(window, 'webkitAudioContext', { configurable: true, value: undefined });

    const { transcribeWithWhisper } = await import('../whisperService');
    const blob = new Blob([new Uint8Array([1])], { type: 'audio/webm' });
    await expect(transcribeWithWhisper(blob)).rejects.toThrow('audio-context-unavailable');

    Object.defineProperty(window, 'AudioContext', { configurable: true, value: prev });
  });
});
