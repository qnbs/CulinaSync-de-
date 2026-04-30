import { useState, useEffect, useRef } from 'react';
import i18next from 'i18next';

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

// Using 'ISpeechRecognition' to avoid name collision with the constant below.
interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}


interface SpeechRecognitionHook {
  isListening: boolean;
  finalTranscript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
}

type SpeechRecognitionWindow = Window & typeof globalThis & {
  SpeechRecognition?: new () => ISpeechRecognition;
  webkitSpeechRecognition?: new () => ISpeechRecognition;
};

const speechRecognitionWindow = typeof window !== 'undefined' ? (window as SpeechRecognitionWindow) : undefined;
const SpeechRecognition = speechRecognitionWindow?.SpeechRecognition || speechRecognitionWindow?.webkitSpeechRecognition;

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(() => SpeechRecognition ? null : i18next.t('voiceControl.errors.browserNotSupported'));
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      return;
    }

    const recognition: ISpeechRecognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentFinal += transcriptPart;
        } else {
          currentInterim += transcriptPart;
        }
      }
      setInterimTranscript(currentInterim);
      if(currentFinal) {
        setFinalTranscript(currentFinal);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError(i18next.t('voiceControl.errors.microphoneBlocked'));
      } else if (event.error === 'no-speech') {
        // Common occurrence — listening state turns off automatically.
      } else if (event.error === 'audio-capture') {
        setError(i18next.t('voiceControl.errors.audioCapture'));
      } else {
        setError(i18next.t('voiceControl.errors.generic', { error: event.error }));
      }
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setFinalTranscript('');
      setInterimTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
          console.error("Error starting speech recognition:", err);
          setError(i18next.t('voiceControl.errors.startFailed'));
          setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  return {
    isListening,
    finalTranscript,
    interimTranscript,
    startListening,
    stopListening,
    hasRecognitionSupport: !!SpeechRecognition,
    error,
  };
};