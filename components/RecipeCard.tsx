import React from 'react';
import { Recipe } from '@/types';
import { Clock, Users, BarChart, Star } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onSelectRecipe?: (recipe: Recipe) => void;
  matchInfo?: string;
  size?: 'normal' | 'small';
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelectRecipe, matchInfo, size = 'normal' }) => {
  const isSmall = size === 'small';

  const favoriteClasses = recipe.isFavorite 
    ? 'border-amber-400 favorite-glow' 
    : 'border-zinc-700 hover:border-zinc-600';

  return (
    <div 
      className={`bg-zinc-800/50 border rounded-lg shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300 group flex flex-col relative ${onSelectRecipe ? 'cursor-pointer' : ''} ${favoriteClasses}`}
      onClick={() => onSelectRecipe?.(recipe)}
      role={onSelectRecipe ? "button" : undefined}
      tabIndex={onSelectRecipe ? 0 : -1}
      onKeyDown={(e) => onSelectRecipe && (e.key === 'Enter' || e.key === ' ') && onSelectRecipe(recipe)}
    >
      {recipe.isFavorite && (
        <div className="absolute top-2 right-2 text-amber-400 z-10" title="Favorit">
            <Star size={isSmall ? 14 : 18} className="fill-current" />
        </div>
      )}
      <div className={`flex-grow ${isSmall ? 'p-3' : 'p-6'}`}>
        {matchInfo && <span className="text-xs font-bold bg-amber-500 text-zinc-900 px-2 py-1 rounded-full mb-2 inline-block">{matchInfo}</span>}
        <h3 className={`font-bold text-amber-400 group-hover:text-amber-300 transition-colors ${isSmall ? 'text-base leading-tight' : 'text-xl'}`}>{recipe.recipeTitle}</h3>
        {!isSmall && <p className="text-zinc-400 mt-2 text-sm h-20 overflow-hidden">{recipe.shortDescription}</p>}
      </div>
      <div className={`border-t border-zinc-700/50 flex justify-between text-zinc-400 ${isSmall ? 'p-3 pt-2 text-xs' : 'mt-4 p-6 pt-4 text-sm'}`}>
        <span className="flex items-center"><Clock size={isSmall ? 14 : 16} className="mr-1.5" /> {recipe.totalTime}</span>
        <span className="flex items-center"><Users size={isSmall ? 14 : 16} className="mr-1.5" /> {recipe.servings}</span>
        <span className="flex items-center"><BarChart size={isSmall ? 14 : 16} className="mr-1.5" /> {recipe.difficulty}</span>
      </div>
    </div>
  );
};

export default React.memo(RecipeCard);