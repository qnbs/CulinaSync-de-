import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../../types';
import { useSpeechSynthesis } from '../../../hooks/useSpeechSynthesis';
import { Mic2, Play, Square, Volume2 } from 'lucide-react';

interface VoicePanelProps {
    settings: AppSettings;
    onChange: (path: string, value: any) => void;
}

export const VoicePanel: React.FC<VoicePanelProps> = ({ settings, onChange }) => {
    const { voices, speak, isSpeaking, cancel } = useSpeechSynthesis();
    const [isPlayingTest, setIsPlayingTest] = useState(false);

    useEffect(() => {
        if (!isSpeaking) setIsPlayingTest(false);
    }, [isSpeaking]);

    const handleTest = () => {
        if (isSpeaking) {
            cancel();
            setIsPlayingTest(false);
        } else {
            setIsPlayingTest(true);
            speak('Hallo! Ich bin dein persönlicher Küchenassistent.');
        }
    };

    return (
        <div className="space-y-8 page-fade-in">
            <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2"><Volume2 className="text-[var(--color-accent-400)]"/> Sprachausgabe</h3>
                    <div className={`flex gap-1 items-end h-6 ${isPlayingTest ? 'opacity-100' : 'opacity-20'}`}>
                         {[...Array(5)].map((_, i) => (
                             <div key={i} className={`w-1 bg-[var(--color-accent-500)] rounded-full transition-all duration-100 ${isPlayingTest ? 'animate-pulse' : 'h-1'}`} style={{ height: isPlayingTest ? `${Math.random() * 100}%` : '20%', animationDelay: `${i * 0.1}s` }} />
                         ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">Stimme</label>
                        <div className="relative">
                             <select 
                                value={settings.speechSynthesis.voice || ''} 
                                onChange={e => onChange('speechSynthesis.voice', e.target.value || null)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 appearance-none focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none"
                                disabled={voices.length === 0}
                            >
                                <option value="">System Standard</option>
                                {voices.map(voice => (
                                    <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>
                                ))}
                            </select>
                            <Mic2 className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Geschwindigkeit</label>
                                <span className="text-xs text-zinc-500 font-mono">{settings.speechSynthesis.rate.toFixed(1)}x</span>
                            </div>
                            <input 
                                type="range" min="0.5" max="2" step="0.1" 
                                value={settings.speechSynthesis.rate} 
                                onChange={e => onChange('speechSynthesis.rate', parseFloat(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-500)]"
                            />
                        </div>
                         <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Tonhöhe</label>
                                <span className="text-xs text-zinc-500 font-mono">{settings.speechSynthesis.pitch.toFixed(1)}</span>
                            </div>
                            <input 
                                type="range" min="0" max="2" step="0.1" 
                                value={settings.speechSynthesis.pitch} 
                                onChange={e => onChange('speechSynthesis.pitch', parseFloat(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-500)]"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleTest}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isPlayingTest ? 'bg-zinc-800 text-zinc-300' : 'bg-[var(--color-accent-500)] text-zinc-900 hover:bg-[var(--color-accent-400)] shadow-lg'}`}
                    >
                        {isPlayingTest ? <><Square size={16} className="fill-current"/> Stop</> : <><Play size={16} className="fill-current"/> Testen</>}
                    </button>
                </div>
            </section>
        </div>
    );
};