import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useSpeechSynthesis } from '../useSpeechSynthesis';
import { createTestStore } from '@/test/createTestStore';

describe('useSpeechSynthesis', () => {
  const mockSpeak = vi.fn();
  const mockCancel = vi.fn();
  const mockGetVoices = vi.fn(() => [
    {
      lang: 'de-DE',
      voiceURI: 'de-DE-voice',
      default: true,
    } as SpeechSynthesisVoice,
  ]);

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: mockGetVoices,
        onvoiceschanged: null as (() => void) | null,
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={createTestStore()}>{children}</Provider>
  );

  it('spricht Text und setzt onstart/onend handler', () => {
    const { result, rerender } = renderHook(() => useSpeechSynthesis(), { wrapper });

    act(() => {
      result.current.speak('Hallo');
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
    const utterance = mockSpeak.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe('Hallo');
    act(() => {
      utterance.onstart?.({} as unknown as SpeechSynthesisEvent);
    });
    rerender();
    expect(result.current.isSpeaking).toBe(true);
    act(() => {
      utterance.onend?.({} as unknown as SpeechSynthesisEvent);
    });
    rerender();
    expect(result.current.isSpeaking).toBe(false);
  });

  it('cancel ruft speechSynthesis.cancel auf', () => {
    const { result } = renderHook(() => useSpeechSynthesis(), { wrapper });
    act(() => {
      result.current.cancel();
    });
    expect(mockCancel).toHaveBeenCalled();
  });
});
