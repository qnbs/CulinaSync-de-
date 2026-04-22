import { useEffect, useState } from 'react';
import { BrainCircuit, ChefHat, Search, Sparkles, Stars, Trophy } from 'lucide-react';

const steps = [
    { icon: Search, text: 'Mise en Place-Scan laeuft...', points: 12 },
    { icon: BrainCircuit, text: 'Sternekoch-Modus analysiert Muster...', points: 28 },
    { icon: ChefHat, text: 'Aromabalance wird optimiert...', points: 37 },
    { icon: Sparkles, text: 'Finaler Signature-Touch...', points: 23 }
];

export const ChefLoading = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(steps[0].points);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => {
                const nextStep = (prev + 1) % steps.length;
                setScore(prevScore => prevScore + steps[nextStep].points);
                return nextStep;
            });
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const StepIcon = steps[currentStep].icon;
    const progress = Math.round(((currentStep + 1) / steps.length) * 100);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8 page-fade-in">
            <div className="relative">
                {/* Pulsing Rings */}
                <div className="absolute inset-0 bg-[var(--color-accent-500)]/20 rounded-full animate-ping blur-xl"></div>
                <div className="relative bg-zinc-900 border border-zinc-700 p-6 rounded-full shadow-2xl">
                    <StepIcon size={48} className="text-[var(--color-accent-400)] animate-pulse" />
                </div>
            </div>
            
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-zinc-100">{steps[currentStep].text}</h3>
                <p className="text-zinc-500 text-sm">Der KI-Chef denkt nach...</p>
            </div>

            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-zinc-400">
                    <span className="inline-flex items-center gap-1"><Stars size={13} /> Sternekoch-Modus</span>
                    <span>{progress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--color-accent-500)] to-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-zinc-300 inline-flex items-center gap-1"><Trophy size={14} className="text-amber-400" /> Gourmet-Punkte</span>
                    <span className="font-mono font-bold text-zinc-100">{score}</span>
                </div>
            </div>

            {/* Progress Indicators */}
            <div className="flex gap-2">
                {steps.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentStep ? 'w-8 bg-[var(--color-accent-500)]' : 'w-2 bg-zinc-800'}`}
                    />
                ))}
            </div>
        </div>
    );
};