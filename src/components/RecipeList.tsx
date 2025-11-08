import React from 'react';
import { Recipe } from '../types';
import RecipeCard from './RecipeCard';

interface RecipeListProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  isSelectMode?: boolean;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onSelectRecipe, isSelectMode, selectedIds, onToggleSelect }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe) => (
          <RecipeCard 
            key={recipe.id || recipe.recipeTitle} 
            recipe={recipe} 
            onSelectRecipe={onSelectRecipe}
            isSelectMode={isSelectMode}
            isSelected={selectedIds?.includes(recipe.id!)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default RecipeList;