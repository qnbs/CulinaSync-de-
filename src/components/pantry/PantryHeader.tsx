import React from 'react';
import { PlusCircle } from 'lucide-react';
import { usePantryManagerContext } from '../../contexts/PantryManagerContext';

export const PantryHeader = () => {
    const { setModalState } = usePantryManagerContext();
    return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Meine Vorratskammer</h2>
                <p className="text-zinc-400 mt-1">Verwalte deine Zutaten für intelligentere Rezeptvorschläge.</p>
            </div>
            <button onClick={() => setModalState({ isOpen: true, item: null })} className="flex-shrink-0 flex items-center justify-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-[var(--color-accent-400)] transition-colors">
                <PlusCircle size={18} /> Neuen Artikel hinzufügen
            </button>
        </div>
    );
};