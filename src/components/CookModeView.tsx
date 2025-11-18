import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { X as XIcon, RefreshCw, Volume2, VolumeX, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
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

    const progressPercentage = ((currentStep + 1) / recipe.instructions.length) * 100;

    return (
        <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col text-zinc-100 font-sans overflow-hidden">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                {recipe.imageUrl ? (
                    <>
                        <img src={recipe.imageUrl} alt="" className="w-full h-full object-cover blur-2xl scale-110 opacity-40" />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"></div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="relative z-20 h-1.5 bg-white/10 w-full">
                <div 
                    className="h-full bg-[var(--color-accent-500)] transition-all duration-500 ease-out shadow-[0_0_15px_var(--color-accent-glow)]" 
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Header */}
            <header className="relative z-20 flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--color-accent-400)] uppercase tracking-widest mb-1 shadow-black drop-shadow-md">Kochmodus</span>
                    <h3 className="text-xl font-bold text-white truncate max-w-[60vw] drop-shadow-lg">{recipe.recipeTitle}</h3>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRepeat} 
                        title="Schritt wiederholen" 
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all disabled:opacity-30 border border-white/5" 
                        disabled={!isSpeechEnabled || isSpeaking}
                    >
                        <RefreshCw size={20} className={isSpeaking ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={() => setIsSpeechEnabled(p => !p)} 
                        title={isSpeechEnabled ? "Sprachausgabe deaktivieren" : "Sprachausgabe aktivieren"} 
                        className={`p-3 rounded-full backdrop-blur-md transition-all border border-white/5 ${isSpeechEnabled ? 'bg-[var(--color-accent-500)] text-zinc-900 shadow-[0_0_20px_var(--color-accent-glow)]' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        {isSpeechEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <button 
                        onClick={onExit} 
                        className="p-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 backdrop-blur-md transition-colors"
                        title="Beenden"
                    >
                        <XIcon size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex-grow flex flex-col justify-center items-center px-6 md:px-12">
                 {/* Big Background Step Number */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25rem] font-bold text-white/[0.03] select-none pointer-events-none">
                    {currentStep + 1}
                 </div>

                 <div className="max-w-4xl w-full space-y-10 text-center relative">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-zinc-300 text-sm font-medium backdrop-blur-md">
                        <span>Schritt {currentStep + 1} / {recipe.instructions.length}</span>
                    </div>
                    
                    <p 
                        key={currentStep} 
                        className="text-3xl md:text-5xl font-medium leading-tight text-white drop-shadow-xl modal-fade-in"
                    >
                        {recipe.instructions[currentStep]}
                    </p>
                 </div>
            </div>

            {/* Footer Controls */}
            <footer className="relative z-20 p-8 pb-12 flex justify-center items-center gap-8 md:gap-16 bg-gradient-to-t from-black/90 to-transparent">
                <button 
                    onClick={handlePrev} 
                    disabled={currentStep === 0} 
                    className="group flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/20 hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 backdrop-blur-md"
                    aria-label="Vorheriger Schritt"
                >
                    <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform"/>
                </button>
                
                {currentStep < recipe.instructions.length - 1 ? (
                    <button 
                        onClick={handleNext} 
                        className="group flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-[var(--color-accent-500)] text-zinc-900 hover:bg-[var(--color-accent-400)] hover:scale-105 transition-all active:scale-95 shadow-[0_0_40px_var(--color-accent-glow)] border-4 border-transparent hover:border-[var(--color-accent-300)]"
                        aria-label="Nächster Schritt"
                    >
                        <ChevronRight size={48} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                ) : (
                    <button 
                        onClick={onExit} 
                        className="group flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-emerald-500 text-zinc-900 hover:bg-emerald-400 hover:scale-105 transition-all active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.4)] border-4 border-transparent hover:border-emerald-300"
                        aria-label="Fertigstellen"
                    >
                        <CheckCircle2 size={48} className="group-hover:scale-110 transition-transform"/>
                    </button>
                )}

                <button 
                    onClick={handleNext} 
                    disabled={currentStep >= recipe.instructions.length - 1} 
                    className={`flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/20 disabled:opacity-0 disabled:cursor-not-allowed transition-all active:scale-95 backdrop-blur-md ${currentStep >= recipe.instructions.length - 1 ? 'invisible' : ''}`}
                    aria-label="Nächster Schritt Placeholder"
                >
                     <ChevronRight size={32} />
                </button>
            </footer>
        </div>
    );
};

export default CookModeView;