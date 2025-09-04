import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechSynthesisHook {
  isSpeaking: boolean;
  speak: (text: string, voiceURI?: string | null, rate?: number, pitch?: number) => void;
  cancel: () => void;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
}

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      const handleVoicesChanged = () => {
        setVoices(window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('de')));
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      handleVoicesChanged(); // Initial load
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback((text: string, voiceURI?: string | null, rate = 1, pitch = 1) => {
    if (!supported) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (voiceURI) {
        const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    } else {
        const defaultVoice = voices.find(v => v.default);
        if (defaultVoice) utterance.voice = defaultVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis Error", e);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [supported, voices]);

  const cancel = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [supported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (supported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);

  return { isSpeaking, speak, cancel, supported, voices };
};