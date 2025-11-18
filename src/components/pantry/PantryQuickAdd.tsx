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
        <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
                <form 
                    onSubmit={handleSubmit} 
                    className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-1.5 border border-zinc-700/50 shadow-2xl focus-within:ring-2 focus-within:ring-[var(--color-accent-500)] focus-within:border-[var(--color-accent-500)] transition-all"
                >
                    <div className="p-2 text-[var(--color-accent-500)]">
                        <Wand2 size={20}/>
                    </div>
                    <input 
                        type="text" 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        placeholder="Smart Add: z.B. '500g Spaghetti' oder '3 Dosen Tomaten'" 
                        className="flex-grow bg-transparent focus:outline-none p-2 text-zinc-100 placeholder-zinc-500 text-sm md:text-base"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim()}
                        className="flex-shrink-0 flex items-center justify-center bg-[var(--color-accent-500)] text-zinc-900 font-bold p-2.5 rounded-xl hover:bg-[var(--color-accent-400)] disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors" 
                        aria-label="Hinzufügen"
                    >
                        <Plus size={20}/>
                    </button>
                </form>
            </div>
        </div>
    );
};