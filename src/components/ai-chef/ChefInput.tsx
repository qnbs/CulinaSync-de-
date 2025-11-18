import React, { useMemo } from 'react';
import { Sparkles, PlusCircle, BrainCircuit, History, Wand2, Clock } from 'lucide-react';
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
            <div className="relative bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 lg:p-8 backdrop-blur-md shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-accent-500)] to-purple-500"></div>
                
                {/* Prompt Area */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                            <Wand2 className="text-[var(--color-accent-400)]" /> Dein Wunsch
                        </h3>
                        <button 
                            onClick={onSurpriseMe} 
                            className="text-xs font-medium text-[var(--color-accent-400)] hover:text-[var(--color-accent-300)] flex items-center gap-1 transition-colors"
                        >
                            <Sparkles size={14}/> Überrasch mich
                        </button>
                    </div>
                    <textarea
                        ref={promptRef}
                        value={craving}
                        onChange={(e) => setCraving(e.target.value)}
                        placeholder="Worauf hast du heute Appetit? (z.B. 'Etwas wärmendes mit Curry' oder 'Ein leichtes Sommergericht')"
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-lg text-zinc-200 placeholder-zinc-600 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none resize-none h-32 transition-all"
                        disabled={isLoading}
                    />
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* Ingredients */}
                    <section className="space-y-4">
                         <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <PlusCircle size={16}/> Zutaten
                        </h3>
                        
                        {expiringItems.length > 0 && (
                            <button 
                                onClick={handleAddExpiring}
                                className="w-full text-left p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-start gap-3 group"
                            >
                                <Clock size={18} className="text-amber-500 mt-0.5 group-hover:animate-pulse" />
                                <div>
                                    <span className="block text-amber-400 text-xs font-bold uppercase">Ablaufende Artikel nutzen</span>
                                    <span className="text-zinc-400 text-xs">Füge {expiringItems.join(', ')} hinzu.</span>
                                </div>
                            </button>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Muss enthalten sein</label>
                                <TagInput tags={includeIngredients} setTags={setIncludeIngredients} placeholder="+ Zutat" suggestions={pantrySuggestions} />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Darf nicht enthalten sein</label>
                                <TagInput tags={excludeIngredients} setTags={setExcludeIngredients} placeholder="- Zutat" suggestions={pantrySuggestions} />
                            </div>
                        </div>
                    </section>

                    {/* Modifiers */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <BrainCircuit size={16}/> Kontext
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {MODIFIER_OPTIONS.map(mod => (
                                <button 
                                    key={mod}
                                    onClick={() => toggleModifier(mod)}
                                    className={`text-sm px-3 py-1.5 rounded-full border transition-all ${modifiers.includes(mod) ? 'bg-[var(--color-accent-500)] text-zinc-900 border-[var(--color-accent-500)] font-medium' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                                >
                                    {mod}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Action */}
                <div className="mt-10 pt-6 border-t border-zinc-800 flex justify-end">
                    <button 
                        onClick={onSubmit}
                        disabled={isLoading || !craving.trim()}
                        className="bg-[var(--color-accent-500)] text-zinc-900 font-bold text-lg py-3 px-8 rounded-xl hover:bg-[var(--color-accent-400)] hover:scale-105 active:scale-95 transition-all disabled:bg-zinc-800 disabled:text-zinc-600 disabled:hover:scale-100 shadow-[0_0_20px_rgba(var(--color-accent-500),0.3)]"
                    >
                        Chef fragen
                    </button>
                </div>
            </div>

            {/* Recent History */}
            {history.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2 px-2">
                        <History size={16}/> Letzte Anfragen
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                         {history.map((prompt, idx) => (
                             <button 
                                key={idx} 
                                onClick={() => onLoadHistory(prompt)}
                                className="text-left bg-zinc-900/30 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4 transition-all group"
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