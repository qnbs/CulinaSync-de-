import React, { useState } from 'react';
import { Plus, Wand2 } from 'lucide-react';
import { usePantryManagerContext } from '../../contexts/PantryManagerContext';

export const PantryQuickAdd = () => {
    const { handleQuickAdd } = usePantryManagerContext();
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        handleQuickAdd(input);
        setInput('');
    };

    return (
        // Positioned above the BottomNav on mobile (calc(4rem + env) handles the nav height + safe area)
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6 left-0 right-0 z-40 px-4 pointer-events-none transition-all duration-300">
            <div className="max-w-3xl mx-auto pointer-events-auto">
                <form 
                    onSubmit={handleSubmit} 
                    className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-2 border border-white/10 shadow-2xl focus-within:ring-2 focus-within:ring-[var(--color-accent-500)] focus-within:border-[var(--color-accent-500)] transition-all"
                >
                    <div className="p-2 text-[var(--color-accent-500)]">
                        <Wand2 size={20}/>
                    </div>
                    <input 
                        type="text" 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        placeholder="Smart Add: z.B. '500g Spaghetti'" 
                        className="flex-grow bg-transparent focus:outline-none p-1 text-zinc-100 placeholder-zinc-500 text-base"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim()}
                        className="flex-shrink-0 flex items-center justify-center bg-[var(--color-accent-500)] text-zinc-900 font-bold h-10 w-10 rounded-xl hover:bg-[var(--color-accent-400)] disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors shadow-lg active:scale-95" 
                        aria-label="Hinzufügen"
                    >
                        <Plus size={20}/>
                    </button>
                </form>
            </div>
        </div>
    );
};