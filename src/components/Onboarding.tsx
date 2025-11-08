import React, { useState } from 'react';
import { ChefHat, Milk, Wand2, CalendarDays, ShoppingCart, ArrowRight, Check } from 'lucide-react';

const steps = [
    {
        icon: Milk,
        title: "Schritt 1: Fülle deine Vorratskammer",
        description: "Alles beginnt hier. Trage ein, was du bereits zu Hause hast. Je genauer deine Vorratskammer ist, desto bessere Vorschläge macht dir der KI-Chef.",
        cta: "Weiter"
    },
    {
        icon: Wand2,
        title: "Schritt 2: Lass dich inspirieren",
        description: "Keine Ideen? Kein Problem! Sag dem KI-Chef, worauf du Lust hast, und er schlägt dir passende Rezepte vor, die deinen Vorrat berücksichtigen.",
        cta: "Weiter"
    },
    {
        icon: CalendarDays,
        title: "Schritt 3: Plane deine Woche",
        description: "Gespeicherte Rezepte kannst du ganz einfach per Drag & Drop in deinen Essensplaner ziehen. So behältst du den Überblick.",
        cta: "Weiter"
    },
    {
        icon: ShoppingCart,
        title: "Schritt 4: Kaufe intelligent ein",
        description: "Nie wieder etwas vergessen. Die App erstellt automatisch eine Einkaufsliste aus deinem Essensplan und gleicht sie mit deinem Vorrat ab.",
        cta: "Los geht's!"
    }
];

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const { icon: Icon, title, description, cta } = steps[currentStep];

    return (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 page-fade-in">
            <div className="w-full max-w-md text-center bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6 modal-fade-in">
                <div className="flex justify-center items-center gap-4 text-[var(--color-accent-400)]">
                   <ChefHat size={32} />
                   <h2 className="text-2xl font-bold text-zinc-100">Willkommen bei CulinaSync!</h2>
                </div>
                
                <p className="text-zinc-400">Dein intelligenter Assistent für eine perfekt organisierte Küche.</p>
                
                <div className="bg-zinc-800/50 p-6 rounded-lg text-left space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-[var(--color-accent-500)]/10 p-3 rounded-full">
                           <Icon className="h-6 w-6 text-[var(--color-accent-400)]" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
                    </div>
                    <p className="text-zinc-400 text-sm">{description}</p>
                </div>
                
                <div className="flex justify-center items-center gap-4">
                    {steps.map((_, index) => (
                        <div key={index} className={`h-2 rounded-full transition-all duration-300 ${index === currentStep ? 'w-8 bg-[var(--color-accent-500)]' : 'w-2 bg-zinc-600'}`}></div>
                    ))}
                </div>

                <button 
                    onClick={handleNext} 
                    className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-3 px-4 rounded-md hover:bg-[var(--color-accent-400)] transition-colors"
                >
                    {cta}
                    {currentStep < steps.length - 1 ? <ArrowRight size={20} /> : <Check size={20} />}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;