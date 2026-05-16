import React, { useState } from 'react';
import type { Recipe } from '../../types';
import { useRecipeDetail } from './useRecipeDetail';
import { RecipeHeader } from './RecipeHeader';
import { RecipeMetadata } from './RecipeMetadata';
import { RecipeActionBar } from './RecipeActionBar';
import { RecipeActionConfirmationModal } from './RecipeActionConfirmationModal';
import { MealPlanModal } from './MealPlanModal';
import { RecipePlanExportBar } from './RecipePlanExportBar';
import { RecipeExpertTipsSection } from './RecipeExpertTipsSection';
import { RecipeDetailTabs } from './RecipeDetailTabs';
import CookModeView from '../CookModeView';
import { addToast } from '../../store/slices/uiSlice';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack }) => {
  const {
    currentRecipe,
    isSaved,
    isModalOpen,
    isExportOpen,
    pendingAction,
    isGeminiCheckLoading,
    geminiVerification,
    isGeneratingImage,
    displayImage,
    pantryMap,
    currentServings,
    scaleFactor,
    isNutritionLoading,
    nutritionReport,
    allTags,
    setIsModalOpen,
    setExportOpen,
    setPendingAction,
    handleServingsChange,
    handleGeminiNutritionCheck,
    handleSave,
    handleGenerateImage,
    handleExport,
    handleConfirmPendingAction,
    handleToggleFavorite,
    handleStartCookMode,
    handleExitCookMode,
    isCookModeActive,
    handleAddMissingToShoppingList,
    handleAddSingleToShoppingList,
    t,
    dispatch,
  } = useRecipeDetail(recipe, onBack);

  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'nutrition'>('ingredients');

  return (
    <>
      {pendingAction && (
        <RecipeActionConfirmationModal
          title={pendingAction.type === 'delete' ? t('recipeDetail.confirm.deleteTitle') : t('recipeDetail.confirm.exportTitle')}
          description={pendingAction.type === 'delete'
            ? t('recipeDetail.confirm.deleteRecipe', { recipeTitle: currentRecipe.recipeTitle })
            : t('recipeDetail.confirm.exportRecipe', { format: pendingAction.format.toUpperCase() })}
          actionLabel={pendingAction.type === 'delete' ? t('common.delete') : t('recipeDetail.confirm.exportAction')}
          onClose={() => setPendingAction(null)}
          onConfirm={() => void handleConfirmPendingAction()}
        />
      )}
      {isModalOpen && currentRecipe.id && (
        <MealPlanModal
          recipeId={currentRecipe.id}
          onClose={() => setIsModalOpen(false)}
          onSave={() => dispatch(addToast({ message: t('recipeDetail.toast.addedToMealPlan') }))}
        />
      )}
      {isCookModeActive && <CookModeView recipe={currentRecipe} onExit={handleExitCookMode} />}

      <div className="page-fade-in pb-20">
        <RecipeHeader
          recipe={currentRecipe}
          onBack={onBack}
          displayImage={displayImage}
          isGeneratingImage={isGeneratingImage}
          handleGenerateImage={handleGenerateImage}
          t={t}
        />

        <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg shadow-xl p-6 md:p-8">
          <p className="text-zinc-300 mb-6 text-lg leading-relaxed">{currentRecipe.shortDescription}</p>

          <RecipeMetadata
            recipe={currentRecipe}
            currentServings={currentServings}
            handleServingsChange={handleServingsChange}
            t={t}
          />

          <RecipePlanExportBar
            isSaved={isSaved}
            isExportOpen={isExportOpen}
            onOpenMealPlan={() => setIsModalOpen(true)}
            onToggleExportMenu={() => setExportOpen(!isExportOpen)}
            onCloseExportMenu={() => setExportOpen(false)}
            onExport={handleExport}
            t={t}
          />

          {allTags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <span key={index} className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <RecipeDetailTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            currentRecipe={currentRecipe}
            scaleFactor={scaleFactor}
            pantryMap={pantryMap}
            onAddSingleToShoppingList={handleAddSingleToShoppingList}
            nutritionReport={nutritionReport}
            isNutritionLoading={isNutritionLoading}
            isGeminiCheckLoading={isGeminiCheckLoading}
            geminiVerification={geminiVerification}
            handleGeminiNutritionCheck={handleGeminiNutritionCheck}
            t={t}
          />

          {currentRecipe.expertTips && currentRecipe.expertTips.length > 0 && (
            <RecipeExpertTipsSection expertTips={currentRecipe.expertTips} t={t} />
          )}

          <RecipeActionBar
            recipe={currentRecipe}
            isSaved={isSaved}
            handleSave={handleSave}
            handleDelete={() => setPendingAction({ type: 'delete' })}
            handleExport={(fmt) => setPendingAction({ type: 'export', format: fmt })}
            handleAddMissingToShoppingList={handleAddMissingToShoppingList}
            handleAddSingleToShoppingList={handleAddSingleToShoppingList}
            handleToggleFavorite={handleToggleFavorite}
            handleStartCookMode={handleStartCookMode}
            isCookModeActive={isCookModeActive}
            handleExitCookMode={handleExitCookMode}
            t={t}
          />
        </div>
      </div>
    </>
  );
};

export default RecipeDetail;
