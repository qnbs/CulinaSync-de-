import React from 'react';
import { Recipe } from '../types';
import { Clock, Users, BarChart, Star, Leaf, CheckCircle, CheckSquare, Square, Image as ImageIcon } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onSelectRecipe?: (recipe: Recipe) => void;
  size?: 'normal' | 'small';
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelectRecipe, size = 'normal', isSelectMode, isSelected, onToggleSelect }) => {
  const isSmall = size === 'small';
  const isVeg = recipe.tags.diet.includes('Vegetarisch') || recipe.tags.diet.includes('Vegan');

  // Match Percentage logic
  const matchPercentage = recipe.pantryMatchPercentage ?? 0;
  const totalCount = recipe.ingredientCount ?? 0;
  const haveCount = Math.round(totalCount * (matchPercentage / 100));
  const isCookable = matchPercentage === 100 && totalCount > 0;

  const handleInteraction = () => {
      if (isSelectMode) {
          onToggleSelect?.(recipe.id!);
      } else {
          onSelectRecipe?.(recipe);
      }
  };

  return (
    <div 
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 isolate ${isSelectMode ? 'cursor-pointer' : 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl'} ${isSelected ? 'ring-2 ring-[var(--color-accent-500)]' : 'border border-zinc-800'}`}
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleInteraction(); }}
      style={{ height: isSmall ? '200px' : '320px' }}
    >
        {/* Background Image or Gradient */}
        <div className="absolute inset-0 z-[-1]">
            {recipe.imageUrl ? (
                <img 
                    src={recipe.imageUrl} 
                    alt={recipe.recipeTitle} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            ) : (
                <div className="w-full h-full bg-zinc-900 relative overflow-hidden">
                     {/* Generative abstract pattern fallback */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-900 to-black"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                    <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-800 w-16 h-16" />
                </div>
            )}
            {/* Overlay Gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
            
            {/* Selection Overlay */}
            {isSelected && <div className="absolute inset-0 bg-[var(--color-accent-500)]/20 backdrop-blur-[1px]"></div>}
        </div>

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col p-4 md:p-5">
            
            {/* Top Bar */}
            <div className="flex justify-between items-start mb-auto">
                 <div className="flex gap-2">
                    {isVeg && <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-400 p-1.5 rounded-lg"><Leaf size={14} /></div>}
                    {isCookable && <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 p-1.5 rounded-lg"><CheckCircle size={14} /></div>}
                 </div>
                 <div>
                     {isSelectMode ? (
                         <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-[var(--color-accent-500)] text-zinc-900' : 'bg-black/40 text-zinc-400 border border-white/10'}`}>
                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                         </div>
                     ) : recipe.isFavorite && (
                         <div className="bg-[var(--color-accent-500)] text-zinc-900 p-1.5 rounded-lg shadow-[0_0_10px_var(--color-accent-glow)]">
                             <Star size={14} className="fill-current" />
                         </div>
                     )}
                 </div>
            </div>

            {/* Recipe Info */}
            <div className="space-y-2">
                <h3 className={`font-bold text-white leading-tight drop-shadow-md ${isSmall ? 'text-base line-clamp-2' : 'text-2xl line-clamp-2'}`}>
                    {recipe.recipeTitle}
                </h3>
                
                {!isSmall && (
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed opacity-90 text-shadow">
                        {recipe.shortDescription}
                    </p>
                )}

                {/* Stats Row */}
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-300 pt-1">
                    <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm border border-white/5">
                        <Clock size={12} className="text-[var(--color-accent-400)]" /> {recipe.totalTime}
                    </span>
                    {!isSmall && (
                        <>
                             <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm border border-white/5">
                                <Users size={12} className="text-[var(--color-accent-400)]" /> {recipe.servings}
                            </span>
                             <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm border border-white/5">
                                <BarChart size={12} className="text-[var(--color-accent-400)]" /> {recipe.difficulty}
                            </span>
                        </>
                    )}
                </div>

                {/* Pantry Match Bar */}
                 {totalCount > 0 && (
                    <div className="pt-2">
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                             <div 
                                className={`h-full rounded-full shadow-[0_0_10px_currentColor] ${matchPercentage === 100 ? 'bg-emerald-500 text-emerald-500' : 'bg-[var(--color-accent-500)] text-[var(--color-accent-500)]'}`} 
                                style={{ width: `${matchPercentage}%` }}
                             />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mt-1 text-zinc-400">
                            <span>Vorrat</span>
                            <span className={matchPercentage === 100 ? "text-emerald-400" : "text-[var(--color-accent-400)]"}>{haveCount}/{totalCount}</span>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    </div>
  );
};

export default React.memo(RecipeCard);