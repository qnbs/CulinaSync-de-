
import React from 'react';
import { Recipe } from '@/types';
import RecipeCard from '@/components/RecipeCard';

interface RecipeListProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onSelectRecipe }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Gespeicherte Rezepte</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id || recipe.recipeTitle} recipe={recipe} onSelectRecipe={onSelectRecipe} />
        ))}
      </div>
    </div>
  );
};

export default RecipeList;
