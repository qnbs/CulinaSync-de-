import React from 'react';
import { RecipeIdea } from '../../types';
import { ArrowRight, RefreshCw } from 'lucide-react';

interface ChefResultsProps {
    ideas: RecipeIdea[];
    onSelectIdea: (idea: RecipeIdea) => void;
    onReset: () => void;
}

export const ChefResults: React.FC<ChefResultsProps> = ({ ideas, onSelectIdea, onReset }) => {
    return (
        <div className="space-y-8 page-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-100">Ich habe 3 Ideen für dich.</h3>
                    <p className="text-zinc-400">Wähle deinen Favoriten, um das vollständige Rezept zu generieren.</p>
                </div>
                <button 
                    onClick={onReset}
                    className="text-sm font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                    <RefreshCw size={16}/> Neue Anfrage
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ideas.map((idea, idx) => (
                    <div 
                        key={idx}
                        className="group relative flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800/40 hover:border-[var(--color-accent-500)]/50 hover:shadow-[0_0_30px_rgba(var(--color-accent-500),0.1)] transition-all duration-300 backdrop-blur-sm"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-accent-500)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <h4 className="text-xl font-bold text-[var(--color-accent-400)] mb-3 group-hover:text-[var(--color-accent-300)] transition-colors">
                            {idea.recipeTitle}
                        </h4>
                        <p className="text-zinc-400 text-sm leading-relaxed flex-grow">
                            {idea.shortDescription}
                        </p>

                        <button 
                            onClick={() => onSelectIdea(idea)}
                            className="mt-6 w-full py-3 rounded-xl bg-zinc-800 text-zinc-200 font-bold group-hover:bg-[var(--color-accent-500)] group-hover:text-zinc-900 transition-all flex items-center justify-center gap-2"
                        >
                            Rezept erstellen <ArrowRight size={18}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};