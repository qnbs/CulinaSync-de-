import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from '../useSpeechRecognition';

describe('useSpeechRecognition', () => {
  it('startListening setzt listening wenn API vorhanden (jsdom-shim)', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.hasRecognitionSupport).toBe(true);

    act(() => {
      result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);
  });
});
