// QNBS-v3: Dexie/MealPlanner-Tests brauchen IndexedDB in jsdom — auto-Polyfill vor allen anderen Imports
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';

// Optional Web Speech API (jsdom): verhindert undefined beim ersten Import von useSpeechRecognition
const g = globalThis as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
if (g.SpeechRecognition === undefined) {
  class SpeechRecognitionShim {
    lang = '';
    interimResults = false;
    continuous = false;
    onresult: ((ev: Event) => void) | null = null;
    onend: (() => void) | null = null;
    onerror: ((ev: Event) => void) | null = null;
    start() {}
    stop() {}
  }
  g.SpeechRecognition = SpeechRecognitionShim;
  g.webkitSpeechRecognition = SpeechRecognitionShim;
}

if ((globalThis as unknown as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance === undefined) {
  (globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = class SpeechSynthesisUtteranceShim {
    text = '';
    lang = '';
    rate = 1;
    pitch = 1;
    voice: SpeechSynthesisVoice | null = null;
    onstart: ((ev: Event) => void) | null = null;
    onend: ((ev: Event) => void) | null = null;
    onerror: ((ev: Event) => void) | null = null;
    constructor(text?: string) {
      if (text !== undefined) this.text = text;
    }
  };
}
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
