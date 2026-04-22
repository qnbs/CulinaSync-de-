import { useState, useRef } from 'react';
import { WhisperResult } from '../services/whisperService';
import { getAppServices } from '../services/serviceRegistry';

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
          const result: WhisperResult = await getAppServices().whisper.transcribeWithWhisper(audioBlob);
          setTranscript(result.text);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Transkription fehlgeschlagen');
        }
      };
      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Audioaufnahme nicht möglich');
    }
  };

  const stopListening = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      recorder.stop();
      // MediaStream-Tracks stoppen um Mikrofon freizugeben
      recorder.stream?.getTracks().forEach(t => t.stop());
    }
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
