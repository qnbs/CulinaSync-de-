import { useState, useRef } from 'react';
import { transcribeWithWhisper, WhisperResult } from '../services/whisperService';

export interface WhisperRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  hasWhisperSupport: boolean;
}

export const useWhisperRecognition = (): WhisperRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const hasWhisperSupport = typeof Worker !== 'undefined';

  const startListening = async () => {
    setError(null);
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        try {
          const result: WhisperResult = await transcribeWithWhisper(audioBlob);
          setTranscript(result.text);
        } catch (err: any) {
          setError(err.message || 'Transkription fehlgeschlagen');
        }
      };
      mediaRecorder.start();
      setIsListening(true);
    } catch (err: any) {
      setError(err.message || 'Audioaufnahme nicht möglich');
    }
  };

  const stopListening = () => {
    mediaRecorderRef.current?.stop();
    setIsListening(false);
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    hasWhisperSupport,
  };
};
