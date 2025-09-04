import React, { useState, useRef, useEffect } from 'react';
import { MealPlanItem, Recipe } from '@/types';
import { CheckCircle, Trash2, BookOpen, MoreVertical, FileText, CookingPot, AlertTriangle } from 'lucide-react';

const PlannedMealCard = React.memo<{
    meal: MealPlanItem;
    recipe: Recipe | undefined;
    pantryStatus: { status: 'ok' | 'partial' | 'missing' | 'unknown'; missing: string[]; missingCount: number, totalCount: number };
    onAction: (action: string, payload: any) => void;
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
             <div className="p-3 rounded-lg bg-zinc-700/50 border border-dashed border-zinc-600 flex items-start gap-3 relative group">
                <FileText size={18} className="text-zinc-400 mt-0.5 flex-shrink-0"/>
                <p className="text-sm text-zinc-300 flex-grow italic">{meal.note}</p>
                 <button onClick={() => onAction('remove', meal)} className="absolute top-1 right-1 p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14}/>
                </button>
            </div>
        )
    }

    // Handle orphaned meal items (recipe deleted)
    if (!recipe) {
        return (
            <div className="p-3 rounded-lg bg-red-900/30 border border-dashed border-red-500/50 flex items-start gap-3 relative group">
                <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0"/>
                <div>
                    <p className="text-sm text-red-300 font-semibold">Rezept nicht gefunden</p>
                    <p className="text-xs text-red-400">Es wurde möglicherweise gelöscht.</p>
                </div>
                 <button onClick={() => onAction('remove', meal)} className="absolute top-1 right-1 p-1 text-zinc-500 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14}/>
                </button>
            </div>
        )
    }

    const statusConfig = {
        ok: { color: 'bg-green-500', title: 'Alle Zutaten im Vorrat' },
        partial: { color: 'bg-yellow-500', title: `Fehlt u.a.: ${pantryStatus.missing.slice(0, 3).join(', ')}` },
        missing: { color: 'bg-red-500', title: `Fehlt u.a.: ${pantryStatus.missing.slice(0, 3).join(', ')}` },
        unknown: { color: 'bg-zinc-600', title: 'Status unbekannt' },
    };

    return (
        <div className={`p-3 rounded-lg group relative transition-all duration-300 flex flex-col gap-2 ${meal.isCooked ? 'bg-zinc-800/80 opacity-60' : 'bg-zinc-800/80 border border-zinc-700'}`}>
            <div className="flex items-start gap-2">
                <div className="flex-grow">
                    <p className={`font-semibold text-zinc-100 text-sm leading-tight ${meal.isCooked ? 'line-through' : ''}`}>{recipe.recipeTitle}</p>
                     {meal.servings && meal.servings !== parseInt(recipe.servings) && <p className="text-xs text-zinc-400">{meal.servings} Portionen</p>}
                    <div className="flex items-center gap-2 mt-2" title={statusConfig[pantryStatus.status].title}>
                        <div className="w-full bg-zinc-700 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${statusConfig[pantryStatus.status].color}`} style={{width: `${pantryStatus.totalCount > 0 ? (pantryStatus.totalCount - pantryStatus.missingCount) / pantryStatus.totalCount * 100 : 0}%`}}></div></div>
                        <span className="text-xs text-zinc-400">{pantryStatus.totalCount > 0 ? `${pantryStatus.totalCount - pantryStatus.missingCount}/${pantryStatus.totalCount}`: ''}</span>
                    </div>
                </div>
                 <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(p => !p)} className={`p-1 rounded-full ${isMenuOpen ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white group-hover:opacity-100'}`}><MoreVertical size={16}/></button>
                    {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg w-48 z-20 page-fade-in">
                            <button onClick={() => { onAction('view', recipe); setMenuOpen(false); }} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-zinc-700"><BookOpen size={14}/> Ansehen</button>
                            <button onClick={() => onAction('cook', recipe)} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-zinc-700"><CookingPot size={14}/> Kochmodus starten</button>
                            {!meal.isCooked && <button onClick={() => { onAction('cooked', meal); setMenuOpen(false); }} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-zinc-700 text-green-400"><CheckCircle size={14}/> Als gekocht markieren</button>}
                            <div className="border-t border-zinc-700 my-1"></div>
                            <button onClick={() => { onAction('remove', meal); setMenuOpen(false); }} className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-zinc-700 text-red-400"><Trash2 size={14}/> Entfernen</button>
                        </div>
                    )}
                </div>
            </div>
            {meal.isCooked && <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center"><CheckCircle className="text-green-400" size={24}/></div>}
        </div>
    );
});

export default PlannedMealCard;