import React, { useState, useRef, useEffect } from 'react';
import { MealPlanItem, Recipe } from '../types';
import { CheckCircle, Trash2, BookOpen, MoreVertical, FileText, CookingPot, AlertTriangle, Clock, Leaf } from 'lucide-react';

const PlannedMealCard = React.memo<{
    meal: MealPlanItem;
    recipe: Recipe | undefined;
    pantryStatus: { status: 'ok' | 'partial' | 'missing' | 'unknown'; have: number; total: number };
    onAction: (action: string, payload: Recipe | MealPlanItem) => void;
}>(({ meal, recipe, pantryStatus, onAction }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle notes
    if (meal.note) {
        return (
             <div className="group relative p-3 rounded-xl bg-zinc-900/40 border border-dashed border-zinc-700/50 hover:bg-zinc-800/40 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                        <FileText size={16} />
                    </div>
                    <p className="text-sm text-zinc-300 italic flex-grow mt-1">{meal.note}</p>
                </div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onAction('remove', meal); }} 
                    className="absolute top-2 right-2 p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all"
                    title="Notiz entfernen"
                >
                    <Trash2 size={14}/>
                </button>
            </div>
        )
    }

    // Handle orphaned meal items
    if (!recipe) {
        return (
            <div className="p-3 rounded-xl bg-red-950/20 border border-dashed border-red-900/50 flex items-center gap-3 relative group">
                <AlertTriangle size={18} className="text-red-500/80"/>
                <span className="text-sm text-red-400/80 italic">Rezept nicht verfügbar</span>
                 <button onClick={() => onAction('remove', meal)} className="absolute right-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-900/40 rounded opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={14}/>
                </button>
            </div>
        )
    }

    const statusColor = {
        ok: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
        partial: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
        missing: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
        unknown: 'bg-zinc-600',
    }[pantryStatus.status];
    
    const isVeg = recipe.tags?.diet?.includes('Vegetarisch') || recipe.tags?.diet?.includes('Vegan');

    return (
        <div className={`group relative flex flex-col gap-2 p-3 rounded-xl border transition-all duration-300 ${meal.isCooked ? 'bg-zinc-900/30 border-zinc-800/30 opacity-60' : 'bg-zinc-800/40 border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/60 hover:shadow-lg'}`}>
            <div className="flex justify-between items-start">
                <h4 className={`font-bold text-sm text-zinc-100 leading-snug line-clamp-2 ${meal.isCooked && 'line-through text-zinc-500'}`}>
                    {recipe.recipeTitle}
                </h4>
                
                 <div className="relative ml-2 flex-shrink-0" ref={menuRef}>
                    <button onClick={() => setMenuOpen(p => !p)} className={`p-1 rounded-md transition-colors ${isMenuOpen ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/50 opacity-0 group-hover:opacity-100'}`}>
                        <MoreVertical size={16}/>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-48 z-20 overflow-hidden py-1 page-fade-in">
                            <button onClick={() => { onAction('view', recipe); setMenuOpen(false); }} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-800 text-zinc-300"><BookOpen size={14}/> Rezept ansehen</button>
                            <button onClick={() => { onAction('cook', recipe); setMenuOpen(false); }} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-800 text-zinc-300"><CookingPot size={14}/> Kochmodus</button>
                            {!meal.isCooked && <button onClick={() => { onAction('cooked', meal); setMenuOpen(false); }} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-800 text-emerald-400"><CheckCircle size={14}/> Als gekocht markieren</button>}
                            <div className="border-t border-zinc-800 my-1"></div>
                            <button onClick={() => { onAction('remove', meal); setMenuOpen(false); }} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-800 text-red-400"><Trash2 size={14}/> Entfernen</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><Clock size={12}/> {recipe.totalTime}</span>
                    {isVeg && <span className="flex items-center gap-1 text-green-600/80"><Leaf size={12}/> Veggie</span>}
                </div>
                {meal.servings && meal.servings !== parseInt(recipe.servings) && <span className="text-[10px] font-bold bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded">{meal.servings} Port.</span>}
            </div>

            {/* Pantry Match Indicator */}
            <div className="mt-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                    <span>Vorrat</span>
                    <span>{pantryStatus.have}/{pantryStatus.total}</span>
                </div>
                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${statusColor}`} 
                        style={{width: `${pantryStatus.total > 0 ? (pantryStatus.have / pantryStatus.total) * 100 : 0}%`}}
                    />
                </div>
            </div>

            {meal.isCooked && (
                <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-500 p-1 rounded-full">
                    <CheckCircle size={14} className="fill-current"/>
                </div>
            )}
        </div>
    );
});

export default PlannedMealCard;