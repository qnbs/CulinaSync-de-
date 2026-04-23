import React from 'react';
import { Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VoiceControlWhisperUIProps {
  isListening: boolean;
  transcript: string;
  error?: string | null;
}

const VoiceControlWhisperUI: React.FC<VoiceControlWhisperUIProps> = ({ isListening, transcript, error }) => {
  const { t } = useTranslation();
  if (!isListening && !transcript && !error) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-5 right-5 z-50 flex items-center justify-center p-4 rounded-lg glass-hud page-fade-in gpu">
      <div className="flex items-center gap-4">
        <Mic className={isListening ? 'text-red-500 animate-pulse' : 'text-zinc-400'} size={24} />
        <p className="text-lg text-zinc-300 italic">
          {error ? <span className="text-red-400">{error}</span> : transcript || (isListening ? t('voiceControl.whisper.listening') : t('voiceControl.whisper.waitingForSpeech'))}
        </p>
      </div>
    </div>
  );
};

export default VoiceControlWhisperUI;
