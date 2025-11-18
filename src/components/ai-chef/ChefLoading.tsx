import React, { useEffect, useState } from 'react';
import { BrainCircuit, ChefHat, Search, Sparkles } from 'lucide-react';

const steps = [
    { icon: Search, text: 'Analysiere Vorratskammer...' },
    { icon: BrainCircuit, text: 'Durchsuche kulinarisches Wissen...' },
    { icon: ChefHat, text: 'Kombiniere Aromen...' },
    { icon: Sparkles, text: 'Finalisiere Konzepte...' }
];

export const ChefLoading = () => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % steps.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const StepIcon = steps[currentStep].icon;

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