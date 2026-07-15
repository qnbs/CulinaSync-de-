import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import { createTestStore } from '../../test/createTestStore';
import { useWhisperRecognition } from '../useWhisperRecognition';

const transcribeWithWhisper = vi.fn();

vi.mock('../../services/serviceRegistry', () => ({
  getAppServices: () => ({
    whisper: { transcribeWithWhisper },
  }),
}));

describe('useWhisperRecognition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transcribeWithWhisper.mockResolvedValue({ text: 'Milch hinzufügen' });
  });

  const wrap = (ui: ReactNode) => {
    const store = createTestStore();
    return <Provider store={store}>{ui}</Provider>;
  };

  it('mappt Mic-Denied auf lokalisierte Fehlermeldung', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError')),
      },
    });

    const { result } = renderHook(() => useWhisperRecognition(), { wrapper: ({ children }) => wrap(children) });

    await act(async () => {
      result.current.startListening();
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
    expect(result.current.error).not.toMatch(/Permission denied/i);
  });

  it('übergibt Model-ID aus Settings an Whisper', async () => {
    const stopTracks = vi.fn();
    const stream = { getTracks: () => [{ stop: stopTracks }] } as unknown as MediaStream;

    class FakeMediaRecorder {
      stream: MediaStream;
      ondataavailable: ((e: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      constructor(s: MediaStream) {
        this.stream = s;
      }
      start() {
        this.ondataavailable?.({ data: new Blob(['x'], { type: 'audio/webm' }) });
      }
      stop() {
        this.onstop?.();
      }
    }

    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });

    const { result } = renderHook(() => useWhisperRecognition(), { wrapper: ({ children }) => wrap(children) });

    await act(async () => {
      result.current.startListening();
    });
    await act(async () => {
      result.current.stopListening();
    });
    await waitFor(() => {
      expect(transcribeWithWhisper).toHaveBeenCalled();
    });
    expect(transcribeWithWhisper.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ model: 'Xenova/whisper-tiny' }),
    );
  });
});
