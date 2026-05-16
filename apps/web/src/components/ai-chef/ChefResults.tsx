import React from 'react';
import { RecipeIdea } from '../../types';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChefResultsProps {
    ideas: RecipeIdea[];
    onSelectIdea: (idea: RecipeIdea) => void;
    onReset: () => void;
    pendingIdeaTitle?: string | null;
    isLoading?: boolean;
}

export const ChefResults: React.FC<ChefResultsProps> = ({ ideas, onSelectIdea, onReset, pendingIdeaTitle, isLoading = false }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-8 page-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-100">{t('settings.aiChef.results.title', { count: ideas.length })}</h3>
                    <p className="text-zinc-400">{t('settings.aiChef.results.description')}</p>
                </div>
                <button 
                    type="button"
                    onClick={onReset}
                    className="text-sm font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                    <RefreshCw size={16}/> {t('settings.aiChef.results.newRequest')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ideas.map((idea, idx) => {
                    const isPending = pendingIdeaTitle === idea.recipeTitle;

                    return (
                        <div 
                            key={idx}
                            className={`group relative flex flex-col bg-zinc-900/40 border rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm ${isPending ? 'border-[var(--color-accent-500)] shadow-[0_0_30px_rgba(var(--color-accent-500),0.18)]' : 'border-zinc-800 hover:bg-zinc-800/40 hover:border-[var(--color-accent-500)]/50 hover:shadow-[0_0_30px_rgba(var(--color-accent-500),0.1)]'}`}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-accent-500)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <h4 className="text-xl font-bold text-[var(--color-accent-400)] mb-3 group-hover:text-[var(--color-accent-300)] transition-colors">
                                {idea.recipeTitle}
                            </h4>
                            <p className="text-zinc-400 text-sm leading-relaxed flex-grow">
                                {idea.shortDescription}
                            </p>

                            <button 
                                type="button"
                                onClick={() => onSelectIdea(idea)}
                                disabled={isLoading}
                                aria-label={t('settings.aiChef.results.selectAria', { title: idea.recipeTitle })}
                                className="mt-6 w-full py-3 rounded-xl bg-zinc-800 text-zinc-200 font-bold group-hover:bg-[var(--color-accent-500)] group-hover:text-zinc-900 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
                            >
                                {isPending ? t('settings.aiChef.results.creating') : t('settings.aiChef.results.createRecipe')} <ArrowRight size={18}/>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};