import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { X as XIcon, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { useWakeLock } from '../hooks/useWakeLock';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setVoiceAction } from '../store/slices/uiSlice';

interface CookModeViewProps {
    recipe: Recipe;
    onExit: () => void;
}

const CookModeView: React.FC<CookModeViewProps> = ({ recipe, onExit }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
    const dispatch = useAppDispatch();
    const { voiceAction } = useAppSelector(state => state.ui);

    // Hooks for wake lock and speech
    const [, requestWakeLock, releaseWakeLock] = useWakeLock();
    const { speak, cancel, isSpeaking } = useSpeechSynthesis();

    // Activate wake lock on mount, release on unmount
    useEffect(() => {
        requestWakeLock();
        return () => {
            releaseWakeLock();
        };
    }, [requestWakeLock, releaseWakeLock]);
    
    // Handle speech synthesis when step or toggle changes
    useEffect(() => {
        if (isSpeechEnabled) {
            speak(recipe.instructions[currentStep]);
        } else {
            cancel();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, isSpeechEnabled, recipe.instructions]);

    // Handle voice commands from global state
    useEffect(() => {
        if (voiceAction) {
            const { type } = voiceAction;
            if (type === 'NEXT_STEP' && currentStep < recipe.instructions.length - 1) {
                setCurrentStep(s => s + 1);
            } else if (type === 'PREVIOUS_STEP' && currentStep > 0) {
                setCurrentStep(s => s - 1);
            } else if (type === 'EXIT_COOK_MODE') {
                onExit();
            }
            // Consume the action if it was handled here
            if (['NEXT_STEP', 'PREVIOUS_STEP', 'EXIT_COOK_MODE'].includes(type)) {
                dispatch(setVoiceAction(null));
            }
        }
    }, [voiceAction, dispatch, onExit, currentStep, recipe.instructions.length]);
    
    // Cleanup speech on unmount
    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    const handleNext = () => {
        if (currentStep < recipe.instructions.length - 1) {
            setCurrentStep(s => s + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(s => s - 1);
        }
    };
    
    const handleRepeat = () => {
        if (isSpeechEnabled) {
            speak(recipe.instructions[currentStep]);
        }
    };

    return (
        <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col p-4 sm:p-8 text-zinc-100 font-sans">
            <header className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-xl font-bold text-[var(--color-accent-400)] truncate pr-4">{recipe.recipeTitle}</h3>
                <div className="flex items-center gap-2">
                    <button onClick={handleRepeat} title="Schritt wiederholen" className="p-2 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50" disabled={!isSpeechEnabled || isSpeaking}>
                        <RefreshCw size={18} className={isSpeaking ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setIsSpeechEnabled(p => !p)} title={isSpeechEnabled ? "Sprachausgabe deaktivieren" : "Sprachausgabe aktivieren"} className={`p-2 rounded-md transition-colors ${isSpeechEnabled ? 'bg-[var(--color-accent-500)] text-zinc-900' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                        {isSpeechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                    <button onClick={onExit} className="flex items-center gap-2 py-2 px-4 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors">
                        <XIcon size={18} /> <span className="hidden sm:inline">Beenden</span>
                    </button>
                </div>
            </header>
            <div className="flex-grow flex flex-col justify-center items-center text-center overflow-y-auto">
                <p className="text-zinc-400 mb-4 font-semibold">Schritt {currentStep + 1} von {recipe.instructions.length}</p>
                <p className="text-2xl md:text-4xl leading-relaxed max-w-4xl page-fade-in">{recipe.instructions[currentStep]}</p>
            </div>
            <footer className="flex justify-center items-center gap-4 pt-4 flex-shrink-0">
                <button onClick={handlePrev} disabled={currentStep === 0} className="py-3 px-6 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 transition-colors">Zurück</button>
                <span className="font-bold text-lg tabular-nums">{currentStep + 1} / {recipe.instructions.length}</span>
                <button onClick={handleNext} disabled={currentStep >= recipe.instructions.length - 1} className="py-3 px-6 rounded-md bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] disabled:opacity-50 transition-colors">Weiter</button>
            </footer>
        </div>
    );
};

export default CookModeView;