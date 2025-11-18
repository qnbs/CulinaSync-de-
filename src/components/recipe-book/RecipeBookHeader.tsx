import React from 'react';
import { BookOpen, Star, CheckCircle2, ChefHat } from 'lucide-react';
import { Recipe } from '../../types';

interface RecipeBookHeaderProps {
    recipes: Recipe[] | undefined;
}

const StatItem = ({ icon: Icon, label, value, subValue, colorClass }: { icon: any, label: string, value: number, subValue?: string, colorClass: string }) => (
    <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex items-center gap-4 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
        <div className={`p-3 rounded-full bg-black/20 ${colorClass}`}>
            <Icon size={24} />
        </div>
        <div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-zinc-100">{value}</span>
                {subValue && <span className="text-xs text-zinc-500">{subValue}</span>}
            </div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
        </div>
    </div>
);

export const RecipeBookHeader: React.FC<RecipeBookHeaderProps> = ({ recipes = [] }) => {
    const stats = React.useMemo(() => {
        return {
            total: recipes.length,
            favorites: recipes.filter(r => r.isFavorite).length,
            cookable: recipes.filter(r => (r.pantryMatchPercentage || 0) === 100).length
        };
    }, [recipes]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <ChefHat className="text-[var(--color-accent-400)]" size={28}/>
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                            Mein Kochbuch
                        </h2>
                    </div>
                    <p className="text-zinc-400 max-w-lg">
                        Deine kuratierte Sammlung kulinarischer Meisterwerke.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatItem 
                    icon={BookOpen} 
                    label="Rezepte" 
                    value={stats.total} 
                    colorClass="text-blue-400"
                />
                <StatItem 
                    icon={Star} 
                    label="Favoriten" 
                    value={stats.favorites} 
                    colorClass="text-[var(--color-accent-400)]"
                />
                <StatItem 
                    icon={CheckCircle2} 
                    label="Jetzt kochbar" 
                    value={stats.cookable} 
                    subValue={`von ${stats.total}`}
                    colorClass="text-green-400"
                />
            </div>
        </div>
    );
};