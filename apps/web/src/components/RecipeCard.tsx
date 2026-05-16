import React from 'react';
import { Recipe } from '../types';
import { Clock, Users, BarChart, Star, Leaf, CheckCircle, CheckSquare, Square, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RecipeCardProps {
  recipe: Recipe;
  onSelectRecipe?: (recipe: Recipe) => void;
  size?: 'normal' | 'small';
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
}

const RecipeCardBase: React.FC<RecipeCardProps> = ({ recipe, onSelectRecipe, size = 'normal', isSelectMode, isSelected, onToggleSelect }) => {
    const { t } = useTranslation();
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
      className={`group relative rounded-2xl overflow-hidden transition-all duration-500 ease-out isolate touch-manipulation gpu
        ${isSelectMode ? 'cursor-pointer' : 'cursor-pointer active:scale-[0.98] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'} 
        ${isSelected ? 'ring-2 ring-[var(--color-accent-500)] shadow-[0_0_30px_rgba(var(--color-accent-glow),0.4)]' : 'border border-white/5'}
      `}
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleInteraction(); }}
      style={{ height: isSmall ? '220px' : '360px' }}
    >
        {/* Layer 1: Background Image with refined scaling */}
        <div className="absolute inset-0 z-[-1] bg-zinc-900">
            {recipe.imageUrl ? (
                <img 
                    src={recipe.imageUrl} 
                    alt={recipe.recipeTitle} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full relative overflow-hidden">
                     {/* Generative abstract pattern fallback */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-900 to-black"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                    <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-800 w-16 h-16" />
                </div>
            )}
            
            {/* Selection Overlay */}
            {isSelected && <div className="absolute inset-0 bg-[var(--color-accent-500)]/30 backdrop-blur-[2px] z-10 transition-all duration-300"></div>}
        </div>

        {/* Layer 2: Sophisticated Gradient Scrim for Maximum Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent opacity-90 z-0 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent opacity-60 z-0 pointer-events-none h-1/3"></div>

        {/* Layer 3: Content */}
        <div className="absolute inset-0 flex flex-col p-4 md:p-5 z-10">
            
            {/* Top Bar */}
            <div className="flex justify-between items-start mb-auto">
                 <div className="flex gap-2">
                    {isVeg && <div className="glass-button !bg-green-500/20 !border-green-500/30 text-green-400 p-1.5 rounded-lg backdrop-blur-md shadow-sm"><Leaf size={14} /></div>}
                          {isCookable && <div className="glass-button !bg-emerald-500/20 !border-emerald-500/30 text-emerald-400 p-1.5 rounded-lg backdrop-blur-md shadow-sm flex items-center gap-1.5"><CheckCircle size={14} /> <span className="text-[10px] font-bold uppercase hidden md:inline">{t('recipeCard.pantryReady')}</span></div>}
                 </div>
                 <div className="min-h-[32px] min-w-[32px] flex justify-end"> 
                     {/* Increased hit area for selection on mobile */}
                     {isSelectMode ? (
                         <div className={`p-2 rounded-xl transition-colors backdrop-blur-md ${isSelected ? 'bg-[var(--color-accent-500)] text-zinc-900 shadow-lg' : 'bg-black/40 text-zinc-400 border border-white/10'}`}>
                            {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                         </div>
                     ) : recipe.isFavorite && (
                         <div className="bg-[var(--color-accent-500)] text-zinc-900 p-1.5 rounded-lg shadow-[0_0_15px_rgba(var(--color-accent-glow),0.5)] backdrop-blur-md">
                             <Star size={14} className="fill-current" />
                         </div>
                     )}
                 </div>
            </div>

            {/* Bottom Info */}
            <div className="space-y-2.5 transform transition-transform duration-300 md:group-hover:translate-y-[-4px]">
                <h3 className={`font-bold text-white leading-tight text-shadow-lg ${isSmall ? 'text-base line-clamp-2' : 'text-xl md:text-2xl line-clamp-2'}`}>
                    {recipe.recipeTitle}
                </h3>
                
                {!isSmall && (
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed opacity-90 text-shadow-sm font-medium hidden sm:block">
                        {recipe.shortDescription}
                    </p>
                )}

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-200 pt-1">
                    <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10">
                        <Clock size={12} className="text-[var(--color-accent-400)]" /> {recipe.totalTime}
                    </span>
                    {!isSmall && (
                        <>
                             <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10">
                                <Users size={12} className="text-[var(--color-accent-400)]" /> {recipe.servings}
                            </span>
                             <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10">
                                <BarChart size={12} className="text-[var(--color-accent-400)]" /> {recipe.difficulty}
                            </span>
                        </>
                    )}
                </div>

                {/* Pantry Match Bar */}
                 {totalCount > 0 && (
                    <div className="pt-3">
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                             <div 
                                className={`h-full rounded-full shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out ${matchPercentage === 100 ? 'bg-emerald-500 text-emerald-500' : 'bg-[var(--color-accent-500)] text-[var(--color-accent-500)]'}`} 
                                style={{ width: `${matchPercentage}%` }}
                             />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mt-1.5 text-zinc-400">
                            <span className="text-shadow-sm">{t('recipeCard.pantry')}</span>
                            <span className={`text-shadow-sm ${matchPercentage === 100 ? "text-emerald-400" : "text-[var(--color-accent-400)]"}`}>{t('recipeCard.ingredientsCount', { haveCount, totalCount })}</span>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    </div>
  );
};

const RecipeCard = React.memo(RecipeCardBase);
export default RecipeCard;