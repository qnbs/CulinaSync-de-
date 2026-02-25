import React, { useMemo, useState } from 'react';
import { Sparkles, PlusCircle, BrainCircuit, History, Wand2, Clock, Send } from 'lucide-react';
import { PantryItem, StructuredPrompt } from '../../types';
import TagInput from '../TagInput';
import { getExpiryStatus } from '../PantryListItem';

interface ChefInputProps {
    craving: string;
    setCraving: (v: string) => void;
    includeIngredients: string[];
    setIncludeIngredients: (v: string[]) => void;
    excludeIngredients: string[];
    setExcludeIngredients: (v: string[]) => void;
    modifiers: string[];
    setModifiers: (v: string[]) => void;
    pantryItems: PantryItem[];
    promptRef: React.RefObject<HTMLTextAreaElement>;
    onSubmit: () => void;
    onSurpriseMe: () => void;
    history: StructuredPrompt[];
    onLoadHistory: (prompt: StructuredPrompt) => void;
    isLoading: boolean;
}

const MODIFIER_OPTIONS = ['Schnell (< 30 Min)', 'Gesund', 'Low Carb', 'Vegetarisch', 'Für Gäste', 'Budget-freundlich'];

export const ChefInput: React.FC<ChefInputProps> = ({
    craving, setCraving,
    includeIngredients, setIncludeIngredients,
    excludeIngredients, setExcludeIngredients,
    modifiers, setModifiers,
    pantryItems, promptRef, onSubmit, onSurpriseMe,
    history, onLoadHistory, isLoading
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const pantrySuggestions = useMemo(() => pantryItems.map(i => i.name), [pantryItems]);
    
    const expiringItems = useMemo(() => {
        return pantryItems.filter(item => {
            const status = getExpiryStatus(item.expiryDate, 3); // 3 days warning
            return status === 'expired' || status === 'nearing';
        }).map(i => i.name).slice(0, 3);
    }, [pantryItems]);

    const handleAddExpiring = () => {
        const newIncludes = Array.from(new Set([...includeIngredients, ...expiringItems]));
        setIncludeIngredients(newIncludes);
    };

    const toggleModifier = (mod: string) => {
        setModifiers(modifiers.includes(mod) ? modifiers.filter(m => m !== mod) : [...modifiers, mod]);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Main Prompt Card */}
            <div className={`relative rounded-3xl p-1 transition-all duration-500 ${isFocused ? 'bg-gradient-to-br from-[var(--color-accent-500)] via-purple-500 to-blue-500 shadow-[0_0_40px_rgba(var(--color-accent-glow),0.3)]' : 'bg-zinc-800/50 shadow-xl'}`}>
                <div className="relative bg-zinc-950 rounded-[1.4rem] p-6 lg:p-8 overflow-hidden">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                            <Wand2 className={`transition-colors ${isFocused ? 'text-[var(--color-accent-400)]' : 'text-zinc-500'}`} /> 
                            Dein Wunsch
                        </h3>
                        <button 
                            onClick={onSurpriseMe} 
                            className="glass-button px-3 py-1.5 rounded-full text-xs font-bold text-[var(--color-accent-400)] hover:text-[var(--color-accent-300)] flex items-center gap-2 transition-all hover:shadow-[0_0_10px_rgba(var(--color-accent-glow),0.3)]"
                        >
                            <Sparkles size={14}/> Überrasch mich
                        </button>
                    </div>

                    {/* Text Area */}
                    <div className="relative">
                        <textarea
                            ref={promptRef}
                            value={craving}
                            onChange={(e) => setCraving(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Worauf hast du heute Appetit? (z.B. 'Etwas wärmendes mit Curry' oder 'Ein leichtes Sommergericht')"
                            className="w-full bg-transparent border-none p-2 text-xl lg:text-2xl text-zinc-100 placeholder-zinc-600 focus:ring-0 outline-none resize-none h-32 transition-all leading-relaxed"
                            disabled={isLoading}
                        />
                        
                        {/* Floating Action Button */}
                        <div className="absolute bottom-0 right-0">
                             <button 
                                onClick={onSubmit}
                                disabled={isLoading || !craving.trim()}
                                className="flex items-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-3 px-6 rounded-2xl hover:bg-[var(--color-accent-400)] hover:scale-105 active:scale-95 transition-all disabled:bg-zinc-800 disabled:text-zinc-600 disabled:hover:scale-100 shadow-lg shadow-[var(--color-accent-glow)]"
                            >
                                <span>Chef fragen</span>
                                <Send size={18} className="mt-0.5"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ingredients Panel */}
                <section className="glass-panel p-6 rounded-2xl space-y-5">
                     <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <PlusCircle size={14}/> Zutaten & Vorrat
                    </h3>
                    
                    {expiringItems.length > 0 && (
                        <button 
                            onClick={handleAddExpiring}
                            className="w-full text-left p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-start gap-3 group"
                        >
                            <Clock size={18} className="text-amber-500 mt-0.5 group-hover:animate-pulse" />
                            <div>
                                <span className="block text-amber-400 text-xs font-bold uppercase mb-0.5">Ablaufende Artikel retten</span>
                                <span className="text-zinc-400 text-xs">Füge {expiringItems.join(', ')} automatisch hinzu.</span>
                            </div>
                        </button>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-400 mb-1.5 block font-medium ml-1">Muss enthalten sein</label>
                            <TagInput tags={includeIngredients} setTags={setIncludeIngredients} placeholder="+ Zutat" suggestions={pantrySuggestions} />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-400 mb-1.5 block font-medium ml-1">Darf nicht enthalten sein</label>
                            <TagInput tags={excludeIngredients} setTags={setExcludeIngredients} placeholder="- Zutat" suggestions={pantrySuggestions} />
                        </div>
                    </div>
                </section>

                {/* Context Panel */}
                <section className="glass-panel p-6 rounded-2xl space-y-5">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <BrainCircuit size={14}/> Kontext & Modifikatoren
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {MODIFIER_OPTIONS.map(mod => (
                            <button 
                                key={mod}
                                onClick={() => toggleModifier(mod)}
                                className={`text-sm px-4 py-2 rounded-xl border transition-all duration-200 ${modifiers.includes(mod) ? 'bg-[var(--color-accent-500)] text-zinc-900 border-[var(--color-accent-500)] font-bold shadow-[0_0_10px_rgba(var(--color-accent-glow),0.4)]' : 'bg-zinc-800/30 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 hover:border-white/10'}`}
                            >
                                {mod}
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            {/* Recent History */}
            {history.length > 0 && (
                <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-2">
                        <History size={14}/> Letzte Anfragen
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                         {history.map((prompt, idx) => (
                             <button 
                                key={idx} 
                                onClick={() => onLoadHistory(prompt)}
                                className="text-left glass-panel p-4 rounded-xl hover:bg-white/5 hover:border-white/10 transition-all group active:scale-95"
                            >
                                <p className="font-medium text-zinc-200 line-clamp-1 group-hover:text-[var(--color-accent-400)] transition-colors">{prompt.craving}</p>
                                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                                    {prompt.modifiers.length > 0 ? prompt.modifiers.join(', ') : 'Keine Extras'}
                                </p>
                             </button>
                         ))}
                    </div>
                </div>
            )}
        </div>
    );
};