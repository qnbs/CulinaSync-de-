import React from 'react';
import { Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VoiceControlUIProps {
  isListening: boolean;
  transcript: string;
}

const VoiceControlUI: React.FC<VoiceControlUIProps> = ({ isListening, transcript }) => {
  const { t } = useTranslation();

  if (!isListening) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-5 right-5 z-50 flex items-center justify-center p-4 rounded-lg glass-hud page-fade-in gpu">
      <div className="flex items-center gap-4">
        <Mic className="text-red-500 animate-pulse" size={24} />
        <p className="text-lg text-zinc-300 italic">{transcript || t('voiceControl.listening')}</p>
      </div>
    </div>
  );
};

export default VoiceControlUI;
