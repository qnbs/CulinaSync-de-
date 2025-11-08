import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';

interface SpeechSynthesisHook {
  isSpeaking: boolean;
  speak: (text: string) => void;
  cancel: () => void;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
}

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const settings = useAppSelector(state => state.settings);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      const handleVoicesChanged = () => {
        setVoices(window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('de')));
      };
      // Voices may load asynchronously
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      handleVoicesChanged(); 
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!supported || !text) return;

    // Cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const { voice: voiceURI, rate, pitch } = settings.speechSynthesis;

    utterance.lang = 'de-DE';
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (voiceURI) {
        const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    } else {
        // Fallback to default German voice if available
        const defaultVoice = voices.find(v => v.lang === 'de-DE' && v.default);
        if (defaultVoice) utterance.voice = defaultVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis Error", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [supported, voices, settings.speechSynthesis]);

  const cancel = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [supported]);

  return { isSpeaking, speak, cancel, supported, voices };
};
