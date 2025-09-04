import React from 'react';
import { Recipe, PantryItem } from '@/types';
import RecipeCard from '@/components/RecipeCard';
import { checkRecipePantryMatch } from '@/services/utils';

interface RecipeListProps {
  recipes: Recipe[];
  pantryItems: PantryItem[];
  onSelectRecipe: (recipe: Recipe) => void;
  isSelectMode?: boolean;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, pantryItems, onSelectRecipe, isSelectMode, selectedIds, onToggleSelect }) => {
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
            pantryMatch={checkRecipePantryMatch(recipe, pantryItems)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecipeList;