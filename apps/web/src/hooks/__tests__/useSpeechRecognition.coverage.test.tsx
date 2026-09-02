import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

describe('useSpeechRecognition (coverage)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const loadHook = async () => {
    const instances: Array<{
      onresult: ((ev: Event) => void) | null;
      onerror: ((ev: Event) => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
    }> = [];

    class MockRecognition {
      lang = '';
      interimResults = false;
      continuous = false;
      onresult: ((ev: Event) => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((ev: Event) => void) | null = null;
      constructor() {
        instances.push(this);
      }
      start() {}
      stop() {
        this.onend?.();
      }
    }

    vi.stubGlobal('SpeechRecognition', MockRecognition);
    vi.stubGlobal('webkitSpeechRecognition', MockRecognition);

    const { useSpeechRecognition } = await import('../useSpeechRecognition');
    const hook = renderHook(() => useSpeechRecognition());
    return { hook, getActive: () => instances[instances.length - 1] ?? null };
  };

  it('verarbeitet finale und interim Transkripte', async () => {
    const { hook, getActive } = await loadHook();

    act(() => {
      hook.result.current.startListening();
    });

    act(() => {
      getActive()?.onresult?.({
        resultIndex: 0,
        results: [
          { isFinal: false, 0: { transcript: 'hallo ' } },
          { isFinal: true, 0: { transcript: 'welt' } },
        ],
      } as never);
    });

    expect(hook.result.current.interimTranscript).toContain('hallo');
    expect(hook.result.current.finalTranscript).toBe('welt');
  });

  it('setzt Fehler bei not-allowed', async () => {
    const instances: Array<{ onerror: ((ev: Event) => void) | null; start: () => void; stop: () => void }> = [];
    class MockRecognition {
      onresult = null;
      onend = null;
      onerror: ((ev: Event) => void) | null = null;
      lang = '';
      interimResults = false;
      continuous = false;
      constructor() {
        instances.push(this);
      }
      start() {
        instances[instances.length - 1]?.onerror?.({ error: 'not-allowed' } as never);
      }
      stop() {}
    }
    vi.stubGlobal('SpeechRecognition', MockRecognition);

    const { useSpeechRecognition } = await import('../useSpeechRecognition');
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    expect(result.current.error).toMatch(/Mikrofon|microphone/i);
    expect(instances.length).toBeGreaterThan(0);
  });

  it('setzt Fehler bei audio-capture und generic', async () => {
    const errors = ['audio-capture', 'network'] as const;
    for (const code of errors) {
      vi.resetModules();
      class MockRecognition {
        onresult = null;
        onend = null;
        onerror: ((ev: Event) => void) | null = null;
        lang = '';
        interimResults = false;
        continuous = false;
        start() {
          this.onerror?.({ error: code } as never);
        }
        stop() {}
      }
      vi.stubGlobal('SpeechRecognition', MockRecognition);
      const { useSpeechRecognition } = await import('../useSpeechRecognition');
      const { result } = renderHook(() => useSpeechRecognition());
      act(() => {
        result.current.startListening();
      });
      expect(result.current.error).toBeTruthy();
    }
  });

  it('setzt Fehler bei start()-Exception', async () => {
    class MockRecognition {
      onresult = null;
      onend = null;
      onerror = null;
      lang = '';
      interimResults = false;
      continuous = false;
      start() {
        throw new Error('busy');
      }
      stop() {}
    }
    vi.stubGlobal('SpeechRecognition', MockRecognition);

    const { useSpeechRecognition } = await import('../useSpeechRecognition');
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isListening).toBe(false);
  });
});
