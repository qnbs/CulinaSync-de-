import React from 'react';
import type { Recipe } from '../../types';
import type { TFunction } from 'i18next';
import { ArrowLeft, LoaderCircle, ImagePlus } from 'lucide-react';

interface RecipeHeaderProps {
  recipe: Recipe;
  onBack: () => void;
  displayImage: string | null;
  isGeneratingImage: boolean;
  handleGenerateImage: () => void;
  t: TFunction;
}

export const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  recipe,
  onBack,
  displayImage,
  isGeneratingImage,
  handleGenerateImage,
  t
}) => {
  return (
    <>
      <button onClick={onBack} className="flex items-center text-[var(--color-accent-400)] hover:text-[var(--color-accent-300)] mb-6 font-semibold">
        <ArrowLeft size={20} className="mr-2" />
        {t('recipeDetail.back')}
      </button>

      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8 bg-zinc-900 border border-zinc-800">
          {displayImage ? (
              <>
                <img src={displayImage} alt={recipe.recipeTitle} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
              </>
          ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                {isGeneratingImage ? (
                       <div className="flex flex-col items-center gap-2 animate-pulse text-[var(--color-accent-400)]">
                           <LoaderCircle size={40} className="animate-spin" />
                             <span className="text-sm font-medium">{t('recipeDetail.generatingImage')}</span>
                       </div>
                  ) : (
                    <>
                        <ImagePlus size={48} className="mb-2 opacity-50" />
                        <button onClick={handleGenerateImage} className="text-sm font-medium text-[var(--color-accent-400)] hover:underline">
                            {t('recipeDetail.generateImage')}
                        </button>
                    </>
                  )}
              </div>
          )}
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg shadow-black">{recipe.recipeTitle}</h2>
          </div>
      </div>
    </>
  );
};
