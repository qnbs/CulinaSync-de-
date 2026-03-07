import React, { useMemo } from 'react';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { Recipe } from '../types';
import RecipeCard from './RecipeCard';
import { useWindowSize } from '../hooks/useWindowSize';

interface RecipeListProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  isSelectMode?: boolean;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onSelectRecipe, isSelectMode, selectedIds, onToggleSelect }) => {
  const { width, height } = useWindowSize();
  const columns = width >= 1280 ? 3 : width >= 768 ? 2 : 1;
  const rowCount = Math.ceil(recipes.length / columns);
  const listHeight = Math.max(480, Math.min(960, height - 320));
  const listWidth = Math.max(320, width - (width >= 1024 ? 180 : 48));
  const shouldVirtualize = recipes.length > 18;

  const rows = useMemo(() => Array.from({ length: rowCount }, (_, rowIndex) => (
    recipes.slice(rowIndex * columns, rowIndex * columns + columns)
  )), [columns, recipes, rowCount]);

  const Row = ({ index, style }: ListChildComponentProps) => (
    <div style={style} className="px-0.5 py-4">
      <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {rows[index].map((recipe) => (
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

  if (shouldVirtualize) {
    return (
      <div className="rounded-2xl border border-zinc-900/70 bg-zinc-950/20 p-2">
        <FixedSizeList
          height={listHeight}
          itemCount={rowCount}
          itemSize={392}
          width={listWidth}
        >
          {Row}
        </FixedSizeList>
      </div>
    );
  }

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