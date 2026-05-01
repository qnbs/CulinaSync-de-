import React, { useState } from 'react';
import type { Recipe } from '../../types';
import { useRecipeDetail } from './useRecipeDetail';
import { RecipeHeader } from './RecipeHeader';
import { RecipeMetadata } from './RecipeMetadata';
import { IngredientsList } from './IngredientsList';
import { InstructionsSection } from './InstructionsSection';
import { NutritionPanel } from './NutritionPanel';
import { RecipeActionBar } from './RecipeActionBar';
import { RecipeActionConfirmationModal } from './RecipeActionConfirmationModal';
import { MealPlanModal } from './MealPlanModal';
import CookModeView from '../CookModeView';
import { FileDown, Lightbulb, CalendarPlus, ChevronDown } from 'lucide-react';
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

          {/* Action row: Meal Plan + Export */}
          <div className="mb-6 flex flex-wrap gap-3">
            {isSaved && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-zinc-800 text-zinc-200 font-bold py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700"
              >
                <CalendarPlus size={18} /> {t('recipeDetail.actions.plan')}
              </button>
            )}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setExportOpen(!isExportOpen)}
                className="flex items-center gap-2 bg-zinc-800 text-zinc-200 font-bold py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700"
                aria-haspopup="menu"
                aria-expanded={isExportOpen}
                aria-controls="recipe-export-menu"
              >
                <FileDown size={18} /> {t('recipeDetail.actions.export')}
                <ChevronDown size={16} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>
              {isExportOpen && (
                <div
                  id="recipe-export-menu"
                  className="absolute top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-xl z-10 overflow-hidden"
                  role="menu"
                  aria-label={t('recipeDetail.confirm.exportTitle')}
                >
                  {(['pdf', 'csv', 'json', 'md', 'txt'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => { setExportOpen(false); void handleExport(fmt); }}
                      className="block w-full text-left text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer"
                      role="menuitem"
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <span key={index} className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="mt-2">
            <div className="flex border-b border-zinc-700 mb-4">
              {(['ingredients', 'instructions', 'nutrition'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-center font-medium text-sm ${activeTab === tab ? 'border-b-2 border-[var(--color-accent-500)] text-[var(--color-accent-400)]' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  {t(`recipeDetail.${tab}`)}
                </button>
              ))}
            </div>

            {activeTab === 'ingredients' && (
              <IngredientsList
                ingredients={currentRecipe.ingredients}
                scaleFactor={scaleFactor}
                pantryMap={pantryMap}
                onAddToShoppingList={handleAddSingleToShoppingList}
                t={t}
              />
            )}
            {activeTab === 'instructions' && (
              <InstructionsSection recipe={currentRecipe} t={t} />
            )}
            {activeTab === 'nutrition' && (
              <NutritionPanel
                report={nutritionReport}
                isNutritionLoading={isNutritionLoading}
                isGeminiCheckLoading={isGeminiCheckLoading}
                geminiVerification={geminiVerification}
                handleGeminiNutritionCheck={handleGeminiNutritionCheck}
                t={t}
              />
            )}
          </div>

          {/* Expert Tips */}
          {currentRecipe.expertTips && currentRecipe.expertTips.length > 0 && (
            <div className="mt-12 pt-8 border-t border-zinc-800">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Lightbulb className="mr-3 text-[var(--color-accent-400)]" />
                {t('recipeDetail.expertTips')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentRecipe.expertTips.map((tip, i) => (
                  <div key={tip.title + i} className="bg-zinc-900/50 border border-[var(--color-accent-500)]/20 p-5 rounded-xl">
                    <h4 className="font-bold text-[var(--color-accent-400)] mb-2">{tip.title}</h4>
                    <p className="text-zinc-400 text-sm">{tip.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
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
