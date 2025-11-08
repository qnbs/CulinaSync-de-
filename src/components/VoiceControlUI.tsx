import React from 'react';
import { Mic } from 'lucide-react';

interface VoiceControlUIProps {
  isListening: boolean;
  transcript: string;
}

const VoiceControlUI: React.FC<VoiceControlUIProps> = ({ isListening, transcript }) => {
  if (!isListening) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-5 right-5 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 rounded-lg shadow-xl page-fade-in">
      <div className="flex items-center gap-4">
        <Mic className="text-red-500 animate-pulse" size={24} />
        <p className="text-lg text-zinc-300 italic">{transcript || 'Höre zu...'}</p>
      </div>
    </div>
  );
};

export default VoiceControlUI;
