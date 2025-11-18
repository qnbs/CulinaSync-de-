import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronsRight, ChefHat } from 'lucide-react';
import { Recipe } from '../../types';
import RecipeCard from '../RecipeCard';

interface PlannerSidebarProps {
    recipes: Recipe[];
    onDragStart: (e: React.DragEvent, recipe: Recipe) => void;
    isCollapsed: boolean;
    onToggle: () => void;
}

export const PlannerSidebar: React.FC<PlannerSidebarProps> = ({ recipes, onDragStart, isCollapsed, onToggle }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredRecipes = useMemo(() => {
        if (!searchTerm) return recipes;
        const lower = searchTerm.toLowerCase();
        return recipes.filter(r => r.recipeTitle.toLowerCase().includes(lower));
    }, [recipes, searchTerm]);

    if (isCollapsed) {
        return (
             <div className="hidden lg:flex flex-col items-center w-16 border-l border-white/5 bg-zinc-950/30 backdrop-blur-xl pt-4 h-[calc(100vh-8rem)] sticky top-24 rounded-l-2xl">
                <button 
                    onClick={onToggle} 
                    title="Rezepte anzeigen" 
                    className="p-3 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-[var(--color-accent-400)] transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="mt-8 text-zinc-700">
                     <ChefHat size={24} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full lg:w-80 flex-shrink-0 bg-zinc-950/30 backdrop-blur-xl border-l border-white/5 p-4 flex flex-col h-[calc(100vh-8rem)] sticky top-24 rounded-l-2xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-zinc-100">Rezepte</h3>
                    <p className="text-xs text-zinc-500">Drag & Drop in den Plan</p>
                </div>
                <button 
                    onClick={onToggle} 
                    className="hidden lg:flex p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
                    title="Einklappen"
                >
                    <ChevronsRight size={20}/>
                </button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Suchen..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-zinc-200 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none transition-all placeholder-zinc-600" 
                />
            </div>

            <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar">
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map(recipe => (
                        <div 
                            key={recipe.id} 
                            draggable 
                            onDragStart={(e) => onDragStart(e, recipe)} 
                            className="cursor-grab active:cursor-grabbing transform transition-transform hover:scale-[1.02]"
                        >
                            <RecipeCard recipe={recipe} size="small" />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 opacity-50">
                        <ChefHat className="mx-auto mb-2 text-zinc-600" size={32} />
                        <p className="text-sm text-zinc-500">Keine Rezepte gefunden.</p>
                    </div>
                )}
            </div>
        </div>
    );
};