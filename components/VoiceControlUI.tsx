import React from 'react';
import { Mic } from 'lucide-react';

interface VoiceControlUIProps {
  isListening: boolean;
  transcript: string;
}

const VoiceControlUI: React.FC<VoiceControlUIProps> = ({ isListening, transcript }) => {
  if (!isListening) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-50 p-4 page-fade-in">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center items-center mb-2">
          <Mic className="text-amber-400 animate-pulse" size={24} />
          <p className="text-xl font-bold text-zinc-100 ml-3">Höre zu...</p>
        </div>
        <p className="text-lg text-zinc-300 min-h-[28px]">{transcript || '...'}</p>
      </div>
    </div>
  );
};

export default VoiceControlUI;
