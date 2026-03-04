import React, { useState, useEffect, useRef } from 'react';
import { Recipe } from '../types';
import { X as XIcon, RefreshCw, Volume2, VolumeX, ChevronLeft, ChevronRight, CheckCircle2, TimerReset, Play, Pause, CircleCheck } from 'lucide-react';
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
    const [isUiVisible, setIsUiVisible] = useState(true);
    const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
    const [timerSeconds, setTimerSeconds] = useState(180);
    const [timerRunning, setTimerRunning] = useState(false);
    
    const inactivityTimerRef = useRef<number | null>(null);

    const dispatch = useAppDispatch();
    const { voiceAction } = useAppSelector(state => state.ui);

    // Hooks for wake lock and speech
    const [, requestWakeLock, releaseWakeLock] = useWakeLock();
    const { speak, cancel, isSpeaking } = useSpeechSynthesis();

    const ingredientList = React.useMemo(() => {
        const flattened = recipe.ingredients.flatMap(group => group.items.map(item => item.name.trim()));
        return Array.from(new Set(flattened.filter(Boolean)));
    }, [recipe.ingredients]);

    // Auto-Hide UI Logic
    const resetInactivityTimer = () => {
        setIsUiVisible(true);
        if (inactivityTimerRef.current) {
            window.clearTimeout(inactivityTimerRef.current);
        }
        inactivityTimerRef.current = window.setTimeout(() => {
            setIsUiVisible(false);
        }, 3500); // Hide after 3.5 seconds
    };

    useEffect(() => {
        requestWakeLock();
        
        // Setup user activity listeners
        const handleActivity = () => resetInactivityTimer();
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('touchstart', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('keydown', handleActivity);

        resetInactivityTimer();

        return () => {
            releaseWakeLock();
            if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('keydown', handleActivity);
        };
    }, [requestWakeLock, releaseWakeLock]);
    
    // Handle speech synthesis when step or toggle changes
    useEffect(() => {
        if (isSpeechEnabled) {
            speak(recipe.instructions[currentStep]);
        } else {
            cancel();
        }
    }, [currentStep, isSpeechEnabled, recipe.instructions]);

    useEffect(() => {
        if (!timerRunning) {
            return;
        }
        const id = window.setInterval(() => {
            setTimerSeconds(prev => {
                if (prev <= 1) {
                    window.clearInterval(id);
                    setTimerRunning(false);
                    if (isSpeechEnabled) {
                        speak('Timer abgelaufen.');
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(id);
    }, [timerRunning, isSpeechEnabled, speak]);

    // Handle voice commands from global state
    useEffect(() => {
        if (voiceAction) {
            const { type, payload } = voiceAction;
            resetInactivityTimer(); // Show UI on voice command
            if (type === 'NEXT_STEP' && currentStep < recipe.instructions.length - 1) {
                setCurrentStep(s => s + 1);
            } else if (type === 'PREVIOUS_STEP' && currentStep > 0) {
                setCurrentStep(s => s - 1);
            } else if (type === 'EXIT_COOK_MODE') {
                onExit();
            } else if (type === 'START_COOK_TIMER') {
                const payloadSeconds = Number(String(payload).split('#')[0] || '0');
                if (payloadSeconds > 0) {
                    setTimerSeconds(payloadSeconds);
                }
                setTimerRunning(true);
            } else if (type === 'PAUSE_COOK_TIMER') {
                setTimerRunning(false);
            } else if (type === 'CHECK_COOK_INGREDIENT') {
                const raw = String(payload).split('#')[0].trim().toLowerCase();
                const match = ingredientList.find(item => item.toLowerCase().includes(raw) || raw.includes(item.toLowerCase()));
                if (match) {
                    setCheckedIngredients(prev => prev.includes(match) ? prev : [...prev, match]);
                }
            } else if (type === 'UNCHECK_COOK_INGREDIENT') {
                const raw = String(payload).split('#')[0].trim().toLowerCase();
                const match = ingredientList.find(item => item.toLowerCase().includes(raw) || raw.includes(item.toLowerCase()));
                if (match) {
                    setCheckedIngredients(prev => prev.filter(item => item !== match));
                }
            }
            if (['NEXT_STEP', 'PREVIOUS_STEP', 'EXIT_COOK_MODE', 'START_COOK_TIMER', 'PAUSE_COOK_TIMER', 'CHECK_COOK_INGREDIENT', 'UNCHECK_COOK_INGREDIENT'].includes(type)) {
                dispatch(setVoiceAction(null));
            }
        }
    }, [voiceAction, dispatch, onExit, currentStep, recipe.instructions.length, ingredientList]);
    
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
    const ingredientProgress = ingredientList.length ? Math.round((checkedIngredients.length / ingredientList.length) * 100) : 0;

    const formatTimer = (seconds: number) => {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
        const rest = (seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${rest}`;
    };

    const toggleIngredient = (ingredient: string) => {
        setCheckedIngredients(prev => prev.includes(ingredient) ? prev.filter(item => item !== ingredient) : [...prev, ingredient]);
    };

    return (
        <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col text-zinc-100 font-sans overflow-hidden cursor-default selection:bg-[var(--color-accent-500)] selection:text-black">
            
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000">
                {recipe.imageUrl ? (
                    <>
                        <img src={recipe.imageUrl} alt="" className="w-full h-full object-cover blur-3xl scale-110 opacity-30" />
                        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/60 to-zinc-950/90"></div>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"></div>
                )}
            </div>

            {/* Progress Bar (Top Safe Area) */}
            <div className={`relative z-20 h-1.5 bg-white/5 w-full transition-opacity duration-700 mt-safe top-0 ${isUiVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div 
                    className="h-full bg-[var(--color-accent-500)] transition-all duration-500 ease-out shadow-[0_0_20px_rgba(var(--color-accent-glow),0.6)]" 
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Header */}
            <header className={`relative z-20 flex justify-between items-center p-4 md:p-6 transition-all duration-700 ${isUiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--color-accent-400)] uppercase tracking-widest mb-1 text-shadow-sm">Kochmodus</span>
                    <h3 className="text-xl md:text-2xl font-bold text-white truncate max-w-[50vw] text-shadow-lg leading-tight">{recipe.recipeTitle}</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full glass-button border border-white/10">
                        <button
                            onClick={() => setTimerRunning(prev => !prev)}
                            className="text-zinc-200"
                            title={timerRunning ? 'Timer pausieren' : 'Timer starten'}
                        >
                            {timerRunning ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        <span className="font-mono text-lg tracking-wider min-w-16 text-center">{formatTimer(timerSeconds)}</span>
                        <button
                            onClick={() => setTimerSeconds(180)}
                            className="text-zinc-400 hover:text-zinc-100"
                            title="Timer zurücksetzen"
                        >
                            <TimerReset size={18} />
                        </button>
                    </div>
                    <button 
                        onClick={handleRepeat} 
                        title="Schritt wiederholen" 
                        className="glass-button p-3 rounded-full text-zinc-300 active:text-white disabled:opacity-30 touch-manipulation" 
                        disabled={!isSpeechEnabled || isSpeaking}
                    >
                        <RefreshCw size={24} className={isSpeaking ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={() => setIsSpeechEnabled(p => !p)} 
                        title={isSpeechEnabled ? "Sprachausgabe deaktivieren" : "Sprachausgabe aktivieren"} 
                        className={`p-3 rounded-full backdrop-blur-md transition-all border border-white/10 touch-manipulation ${isSpeechEnabled ? 'bg-[var(--color-accent-500)] text-zinc-900 shadow-[0_0_20px_rgba(var(--color-accent-glow),0.4)]' : 'glass-button text-zinc-300 active:text-white'}`}
                    >
                        {isSpeechEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>
                    <button 
                        onClick={onExit} 
                        className="glass-button p-3 rounded-full text-red-400 active:bg-red-500/20 active:text-red-300 border-red-500/20 touch-manipulation"
                        title="Beenden"
                    >
                        <XIcon size={24} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex-grow flex flex-col justify-center items-center px-4 md:px-16 lg:px-24 pb-20">
                 {/* Big Background Step Number */}
                 <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[35rem] font-bold text-white/[0.03] select-none pointer-events-none transition-opacity duration-1000 ${isUiVisible ? 'opacity-100' : 'opacity-40'}`}>
                    {currentStep + 1}
                 </div>

                 <div className="max-w-5xl w-full space-y-8 text-center relative">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-white/5 text-zinc-300 text-sm font-bold tracking-wide transition-opacity duration-700 ${isUiVisible ? 'opacity-100' : 'opacity-0'}`}>
                        <span>Schritt {currentStep + 1} / {recipe.instructions.length}</span>
                    </div>
                    
                    <div className="min-h-[20vh] flex items-center justify-center overflow-y-auto max-h-[50vh]">
                        <p 
                            key={currentStep} 
                            className="text-2xl md:text-5xl lg:text-6xl font-medium leading-snug text-white drop-shadow-2xl modal-fade-in selection:bg-[var(--color-accent-500)] selection:text-black"
                        >
                            {recipe.instructions[currentStep]}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-left">
                        <div className="glass-panel rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs uppercase tracking-widest font-bold text-zinc-400">Zutaten-Check</p>
                                <p className="text-xs text-zinc-500">{checkedIngredients.length}/{ingredientList.length}</p>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${ingredientProgress}%` }} />
                            </div>
                            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                                {ingredientList.map(item => {
                                    const checked = checkedIngredients.includes(item);
                                    return (
                                        <button
                                            key={item}
                                            onClick={() => toggleIngredient(item)}
                                            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 border text-sm transition-colors ${checked ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200' : 'bg-zinc-900/60 border-white/5 text-zinc-300'}`}
                                        >
                                            <span>{item}</span>
                                            {checked && <CircleCheck size={16} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs uppercase tracking-widest font-bold text-zinc-400">Schritt-Timer</p>
                                <p className={`text-xs font-semibold ${timerRunning ? 'text-[var(--color-accent-300)]' : 'text-zinc-500'}`}>
                                    {timerRunning ? 'Laufend' : 'Pausiert'}
                                </p>
                            </div>
                            <p className="font-mono text-4xl md:text-5xl text-center tracking-widest text-zinc-100">{formatTimer(timerSeconds)}</p>
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => setTimerRunning(prev => !prev)} className="rounded-xl py-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold">
                                    {timerRunning ? 'Pause' : 'Start'}
                                </button>
                                <button onClick={() => setTimerSeconds(prev => prev + 30)} className="rounded-xl py-2 bg-zinc-800 text-zinc-200 font-bold border border-zinc-700">
                                    +30s
                                </button>
                                <button onClick={() => { setTimerSeconds(180); setTimerRunning(false); }} className="rounded-xl py-2 bg-zinc-800 text-zinc-200 font-bold border border-zinc-700">
                                    Reset
                                </button>
                            </div>
                            <p className="text-xs text-zinc-500">Voice: "Timer starten für 5 Minuten", "Tomaten abhaken"</p>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Footer Controls - Massive buttons for messy hands */}
            <footer className={`fixed bottom-0 left-0 right-0 z-30 p-6 pb-safe flex justify-between items-end gap-4 transition-all duration-700 ${isUiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
                <button 
                    onClick={handlePrev} 
                    disabled={currentStep === 0} 
                    className="flex-1 glass-button flex flex-col items-center justify-center h-24 rounded-3xl text-zinc-300 active:text-white disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 border-white/10 touch-manipulation"
                    aria-label="Vorheriger Schritt"
                >
                    <ChevronLeft size={40} />
                    <span className="text-xs uppercase font-bold tracking-widest mt-1">Zurück</span>
                </button>
                
                {currentStep < recipe.instructions.length - 1 ? (
                    <button 
                        onClick={handleNext} 
                        className="flex-[2] flex flex-col items-center justify-center h-28 rounded-3xl bg-[var(--color-accent-500)] text-zinc-900 active:bg-[var(--color-accent-400)] active:scale-95 transition-all shadow-[0_0_40px_rgba(var(--color-accent-glow),0.4)] border-4 border-white/5 hover:border-[var(--color-accent-300)] touch-manipulation"
                        aria-label="Nächster Schritt"
                    >
                        <ChevronRight size={56} />
                        <span className="text-sm uppercase font-black tracking-widest">Weiter</span>
                    </button>
                ) : (
                    <button 
                        onClick={onExit} 
                        className="flex-[2] flex flex-col items-center justify-center h-28 rounded-3xl bg-emerald-500 text-zinc-900 active:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_40px_rgba(16,185,129,0.4)] border-4 border-white/5 hover:border-emerald-300 touch-manipulation"
                        aria-label="Fertigstellen"
                    >
                        <CheckCircle2 size={56} />
                        <span className="text-sm uppercase font-black tracking-widest">Fertig</span>
                    </button>
                )}
            </footer>
        </div>
    );
};

export default CookModeView;