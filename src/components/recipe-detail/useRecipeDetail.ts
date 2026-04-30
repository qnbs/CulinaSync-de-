import { useActionState, useState, useMemo, useEffect, useCallback } from 'react';
import type { Recipe, PantryItem, IngredientItem } from '../../types';
import { db } from '../../services/dbInstance';
import { addRecipe, deleteRecipe, addMissingIngredientsToShoppingList, updateRecipeImage } from '../../services/repositories/recipeRepository';
import { addShoppingListItem } from '../../services/repositories/shoppingListRepository';
import type { NutritionAllergyReport } from '../../services/nutritionAllergyService';
import { analyzeRecipeNutritionInWorker } from '../../services/nutritionWorkerService';
import { useLiveQuery } from 'dexie-react-hooks';
import { scaleIngredientQuantity } from '../../services/utils';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToast, setVoiceAction } from '../../store/slices/uiSlice';
import { generateChefImage } from '../../features/ai-chef/commands/generateChefImage';
import { useTranslation } from 'react-i18next';

interface ImageActionState {
  recipeTitle: string | null;
  imageUrl: string | null;
  error: string | null;
}

type PendingRecipeAction =
  | { type: 'delete' }
  | { type: 'export'; format: 'pdf' | 'csv' | 'json' | 'md' | 'txt' };

const EMPTY_NUTRITION_REPORT: NutritionAllergyReport = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  allergens: [],
  matchedIngredients: 0,
  totalIngredients: 0,
};

export const useRecipeDetail = (recipe: Recipe, onBack: () => void) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { voiceAction } = useAppSelector(state => state.ui);

  const [currentRecipe, setCurrentRecipe] = useState(recipe);
  const [isSaved, setIsSaved] = useState(!!currentRecipe.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingRecipeAction | null>(null);
  const [isCookMode, setIsCookMode] = useState(false);
  const [isGeminiCheckLoading, setGeminiCheckLoading] = useState(false);
  const [geminiVerification, setGeminiVerification] = useState<{ summary: string; warnings: string[] } | null>(null);
  const [nutritionResult, setNutritionResult] = useState<{ key: string | null; report: NutritionAllergyReport }>({
    key: null,
    report: EMPTY_NUTRITION_REPORT,
  });

  const [imageState, requestRecipeImage, isGeneratingImage] = useActionState<ImageActionState, string>(async (
    _previousState,
    recipeTitle: string,
  ): Promise<ImageActionState> => {
    try {
      return {
        recipeTitle,
        imageUrl: await generateChefImage(recipeTitle),
        error: null,
      };
    } catch (error) {
      return {
        recipeTitle,
        imageUrl: null,
        error: error instanceof Error ? error.message : t('common.error'),
      };
    }
  }, {
    recipeTitle: null,
    imageUrl: null,
    error: null,
  });

  const displayImage = currentRecipe.imageUrl || (currentRecipe.recipeTitle === imageState.recipeTitle ? imageState.imageUrl : null);

  const pantryItems = useLiveQuery(() => db.pantry.toArray(), []);
  const pantryMap: Map<string, number> = useMemo(() => new Map(pantryItems?.map((p: PantryItem) => [p.name.toLowerCase(), p.quantity]) || []), [pantryItems]);

  const originalServings = useMemo(() => parseInt(recipe.servings.match(/\d+/)?.[0] || '1', 10), [recipe.servings]);
  const [currentServings, setCurrentServings] = useState(originalServings);

  const handleServingsChange = (newServings: number) => {
      if (!isNaN(newServings) && newServings > 0 && newServings <= 100) {
          setCurrentServings(newServings);
      }
  };

  const scaleFactor = useMemo(() => {
      if (!originalServings || !currentServings || originalServings === 0) return 1;
      return currentServings / originalServings;
  }, [currentServings, originalServings]);

  const nutritionKey = useMemo(() => JSON.stringify({
    recipeTitle: currentRecipe.recipeTitle,
    ingredients: currentRecipe.ingredients,
    instructions: currentRecipe.instructions,
  }), [currentRecipe.ingredients, currentRecipe.instructions, currentRecipe.recipeTitle]);
  const isNutritionLoading = nutritionResult.key !== nutritionKey;
  const nutritionReport = nutritionResult.key === nutritionKey ? nutritionResult.report : EMPTY_NUTRITION_REPORT;

  useEffect(() => {
    let isActive = true;

    void analyzeRecipeNutritionInWorker(currentRecipe)
      .then((report: NutritionAllergyReport) => {
        if (isActive) {
          setNutritionResult({ key: nutritionKey, report });
        }
      });

    return () => {
      isActive = false;
    };
  }, [currentRecipe, nutritionKey]);

  const handleGeminiNutritionCheck = async () => {
    setGeminiCheckLoading(true);
    try {
      const { verifyNutritionAndAllergensWithGemini } = await import('../../services/geminiService');
      const verification = await verifyNutritionAndAllergensWithGemini(currentRecipe, {
        calories: nutritionReport.calories,
        protein: nutritionReport.protein,
        fat: nutritionReport.fat,
        carbs: nutritionReport.carbs,
        allergens: nutritionReport.allergens,
      });
      setGeminiVerification(verification);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.error');
      dispatch(addToast({ message, type: 'error' }));
    } finally {
      setGeminiCheckLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const recipeToSave = { ...currentRecipe, imageUrl: displayImage || undefined };
      const newId = await addRecipe(recipeToSave);
      if(newId) {
        setCurrentRecipe(prev => ({ ...prev, id: newId, imageUrl: displayImage || undefined }));
        setIsSaved(true);
        dispatch(addToast({message: t('recipeDetail.toast.saved')}));
      }
    } catch (error) {
      console.error("Failed to save recipe:", error);
      dispatch(addToast({message: t('recipeDetail.toast.saveFailed'), type: 'error'}));
    }
  };

  const handleDelete = async () => {
    if (!currentRecipe.id) {
      return;
    }

    try {
      await deleteRecipe(currentRecipe.id);
      onBack();
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      dispatch(addToast({message: t('recipeDetail.toast.deleteFailed'), type: 'error'}));
    }
  };

  const handleGenerateImage = async () => {
      requestRecipeImage(currentRecipe.recipeTitle);
  };

  useEffect(() => {
    if (imageState.error) {
      dispatch(addToast({ message: imageState.error, type: 'error' }));
    }
  }, [imageState.error, dispatch]);

  useEffect(() => {
    if (!imageState.imageUrl || imageState.recipeTitle !== currentRecipe.recipeTitle) {
      return;
    }

    if (currentRecipe.id) {
      void updateRecipeImage(currentRecipe.id, imageState.imageUrl)
        .then(() => dispatch(addToast({ message: t('recipeDetail.toast.imageSaved') })));
    }
  }, [currentRecipe.id, currentRecipe.recipeTitle, dispatch, imageState.imageUrl, imageState.recipeTitle, t]);

  const handleExport = async (format: 'pdf' | 'csv' | 'json' | 'md' | 'txt') => {
    const {
      exportRecipeToPdf,
      exportRecipeToCsv,
      exportRecipeToJson,
      exportRecipeToMarkdown,
      exportRecipeToTxt,
    } = await import('../../services/exportService');
    switch (format) {
      case 'pdf': await exportRecipeToPdf(currentRecipe); break;
      case 'csv': await exportRecipeToCsv(currentRecipe); break;
      case 'json': await exportRecipeToJson(currentRecipe); break;
      case 'md': await exportRecipeToMarkdown(currentRecipe); break;
      case 'txt': await exportRecipeToTxt(currentRecipe); break;
    }
  };

  const handleConfirmPendingAction = async () => {
    if (!pendingAction) {
      return;
    }

    const actionToRun = pendingAction;
    setPendingAction(null);

    if (actionToRun.type === 'delete') {
      await handleDelete();
      return;
    }

    await handleExport(actionToRun.format);
  };

  const handleToggleFavorite = async () => {
    if (currentRecipe.id) {
        try {
            const newIsFavorite = !currentRecipe.isFavorite;
            const { setRecipeFavorite } = await import('../../services/repositories/recipeRepository');
            await setRecipeFavorite(currentRecipe.id, newIsFavorite);
            setCurrentRecipe(prev => ({...prev, isFavorite: newIsFavorite}));
            dispatch(addToast({message: newIsFavorite ? t('recipeDetail.toast.favoriteAdded') : t('recipeDetail.toast.favoriteRemoved')}));
        } catch (error) {
            console.error("Failed to update favorite status:", error);
            dispatch(addToast({message: t('recipeDetail.toast.actionFailed'), type: 'error'}));
        }
    }
  };

  const handleStartCookMode = useCallback(() => {
    setIsCookMode(true);
  }, []);
  const isCookModeActive = isCookMode || voiceAction?.type === 'START_COOK_MODE';
  const handleExitCookMode = useCallback(() => {
    setIsCookMode(false);
    if (voiceAction?.type === 'START_COOK_MODE') {
      dispatch(setVoiceAction(null));
    }
  }, [dispatch, voiceAction]);

  const handleAddMissingToShoppingList = async () => {
      if(!recipe.id) return;
      const count = await addMissingIngredientsToShoppingList(recipe.id);
      if (count > 0) {
        dispatch(addToast({message: t('recipeDetail.toast.missingItemsAdded', { count })}));
      } else {
        dispatch(addToast({message: t('recipeDetail.toast.noMissingItems'), type: 'info'}));
      }
  };

  const handleAddSingleToShoppingList = async (item: IngredientItem) => {
    const scaledQuantityStr = scaleIngredientQuantity(item.quantity, scaleFactor);
    const requiredQty = parseFloat(scaledQuantityStr.replace(',', '.')) || 0;
    const pantryQty = pantryMap.get(item.name.toLowerCase()) || 0;

    await addShoppingListItem({
        name: item.name,
        quantity: Math.max(1, requiredQty - pantryQty),
        unit: item.unit,
        recipeId: currentRecipe.id,
        isChecked: false
    });
    dispatch(addToast({message: t('recipeDetail.toast.singleItemAdded', { itemName: item.name })}));
  };

  const allTags = currentRecipe.tags ? [
    ...(currentRecipe.tags.course || []),
    ...(currentRecipe.tags.cuisine || []),
    ...(currentRecipe.tags.occasion || []),
    ...(currentRecipe.tags.mainIngredient || []),
    ...(currentRecipe.tags.prepMethod || []),
    ...(currentRecipe.tags.diet || [])
  ].flat().filter(Boolean) : [];

  return {
    // State
    currentRecipe,
    isSaved,
    isModalOpen,
    isExportOpen,
    pendingAction,
    isCookMode,
    isGeminiCheckLoading,
    geminiVerification,
    nutritionResult,
    imageState,
    isGeneratingImage,
    displayImage,
    pantryItems,
    pantryMap,
    originalServings,
    currentServings,
    scaleFactor,
    nutritionKey,
    isNutritionLoading,
    nutritionReport,
    allTags,
    // Setters
    setCurrentRecipe,
    setIsSaved,
    setIsModalOpen,
    setExportOpen,
    setPendingAction,
    setIsCookMode,
    setGeminiCheckLoading,
    setGeminiVerification,
    setNutritionResult,
    // Handlers
    handleServingsChange,
    handleGeminiNutritionCheck,
    handleSave,
    handleDelete,
    handleGenerateImage,
    handleExport,
    handleConfirmPendingAction,
    handleToggleFavorite,
    handleStartCookMode,
    handleExitCookMode,
    isCookModeActive,
    handleAddMissingToShoppingList,
    handleAddSingleToShoppingList,
    // t and dispatch for component use
    t,
    dispatch,
  };
};
