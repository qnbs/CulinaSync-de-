import React, { useActionState, useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Recipe, PantryItem, IngredientItem } from '../types';
import { db } from '../services/dbInstance';
import { addRecipe, deleteRecipe, addMissingIngredientsToShoppingList, updateRecipeImage } from '../services/repositories/recipeRepository';
import { addRecipeToMealPlan } from '../services/repositories/mealPlanRepository';
import { addShoppingListItem } from '../services/repositories/shoppingListRepository';
import type { NutritionAllergyReport } from '../services/nutritionAllergyService';
import { analyzeRecipeNutritionInWorker } from '../services/nutritionWorkerService';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Clock, Users, BarChart, UtensilsCrossed, Lightbulb, Save, Trash2, CheckCircle, CalendarPlus, FileDown, Star, ChevronDown, Plus, Minus, CookingPot, ShoppingCartIcon, AlertCircle, ImagePlus, LoaderCircle, ShieldAlert } from 'lucide-react';
import { scaleIngredientQuantity } from '../services/utils';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToast, setVoiceAction } from '../store/slices/uiSlice';
import { generateChefImage } from '../features/ai-chef/commands/generateChefImage';
import CookModeView from './CookModeView';
import { useModalA11y } from '../hooks/useModalA11y';


interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}

type ImageActionState = {
  recipeTitle: string | null;
  imageUrl: string | null;
  error: string | null;
};

const EMPTY_NUTRITION_REPORT: NutritionAllergyReport = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  allergens: [],
  matchedIngredients: 0,
  totalIngredients: 0,
};

const MealPlanModal: React.FC<{recipeId: number, onClose: () => void, onSave: () => void}> = ({recipeId, onClose, onSave}) => {
  const { t } = useTranslation();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [mealType, setMealType] = useState<'Frühstück' | 'Mittagessen' | 'Abendessen'>('Abendessen');
  const modalRef = React.useRef<HTMLDivElement>(null);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  useModalA11y({
    isOpen: true,
    onClose,
    containerRef: modalRef,
    initialFocusRef: dateInputRef,
  });

    const handleSave = async () => {
        await addRecipeToMealPlan({ recipeId, date, mealType });
        onSave();
        onClose();
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 glass-overlay" onClick={onClose}>
        <div ref={modalRef} className="rounded-lg p-6 w-full max-w-sm glass-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="mealplan-modal-title" tabIndex={-1}>
          <h3 id="mealplan-modal-title" className="text-lg font-bold mb-4">{t('recipeDetail.modal.addToMealPlanTitle')}</h3>
                <div className="space-y-4">
                    <div>
                <label htmlFor="date" className="block text-sm font-medium text-zinc-400 mb-1">{t('recipeDetail.modal.date')}</label>
              <input ref={dateInputRef} type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none"/>
                    </div>
                    <div>
                <label htmlFor="mealType" className="block text-sm font-medium text-zinc-400 mb-1">{t('recipeDetail.modal.mealType')}</label>
              <select id="mealType" value={mealType} onChange={e => setMealType(e.target.value as 'Frühstück' | 'Mittagessen' | 'Abendessen')} className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none">
                  <option>{t('recipeDetail.mealType.breakfast')}</option>
                  <option>{t('recipeDetail.mealType.lunch')}</option>
                  <option>{t('recipeDetail.mealType.dinner')}</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">{t('common.cancel')}</button>
            <button type="button" onClick={handleSave} className="py-2 px-4 rounded-md bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)]">{t('common.save')}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { voiceAction } = useAppSelector(state => state.ui);

  const [currentRecipe, setCurrentRecipe] = useState(recipe);
  const [isSaved, setIsSaved] = useState(!!currentRecipe.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);
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

  // If the recipe has an image, use it. If not, and we just generated one, use that.
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
      .then((report) => {
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
      const { verifyNutritionAndAllergensWithGemini } = await import('../services/geminiService');
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
      // If we have a generated image but it's not in the recipe object yet, add it.
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
    if (currentRecipe.id && window.confirm(t('recipeDetail.confirm.deleteRecipe', { recipeTitle: currentRecipe.recipeTitle }))) {
      try {
        await deleteRecipe(currentRecipe.id);
        onBack();
      } catch (error) {
        console.error("Failed to delete recipe:", error);
        dispatch(addToast({message: t('recipeDetail.toast.deleteFailed'), type: 'error'}));
      }
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
    setExportOpen(false);
    if (window.confirm(t('recipeDetail.confirm.exportRecipe', { format: format.toUpperCase() }))) {
      const {
        exportRecipeToPdf,
        exportRecipeToCsv,
        exportRecipeToJson,
        exportRecipeToMarkdown,
        exportRecipeToTxt,
      } = await import('../services/exportService');
      switch (format) {
        case 'pdf': await exportRecipeToPdf(currentRecipe); break;
        case 'csv': await exportRecipeToCsv(currentRecipe); break;
        case 'json': await exportRecipeToJson(currentRecipe); break;
        case 'md': await exportRecipeToMarkdown(currentRecipe); break;
        case 'txt': await exportRecipeToTxt(currentRecipe); break;
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (currentRecipe.id) {
        try {
            const newIsFavorite = !currentRecipe.isFavorite;
        const { setRecipeFavorite } = await import('../services/repositories/recipeRepository');
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
  }
  
  const allTags = currentRecipe.tags ? [
    ...(currentRecipe.tags.course || []),
    ...(currentRecipe.tags.cuisine || []),
    ...(currentRecipe.tags.occasion || []),
    ...(currentRecipe.tags.mainIngredient || []),
    ...(currentRecipe.tags.prepMethod || []),
    ...(currentRecipe.tags.diet || [])
  ].flat().filter(Boolean) : [];

  return (
    <div className="page-fade-in pb-20">
      {isModalOpen && currentRecipe.id && <MealPlanModal recipeId={currentRecipe.id} onClose={() => setIsModalOpen(false)} onSave={() => dispatch(addToast({message: t('recipeDetail.toast.addedToMealPlan')}))} />}
      {isCookModeActive && <CookModeView recipe={currentRecipe} onExit={handleExitCookMode} />}

      <button onClick={onBack} className="flex items-center text-[var(--color-accent-400)] hover:text-[var(--color-accent-300)] mb-6 font-semibold">
        <ArrowLeft size={20} className="mr-2" />
        {t('recipeDetail.back')}
      </button>
      
      {/* Hero Image Section */}
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8 bg-zinc-900 border border-zinc-800">
          {displayImage ? (
              <>
                <img src={displayImage} alt={currentRecipe.recipeTitle} className="w-full h-full object-cover" />
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
            <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg shadow-black">{currentRecipe.recipeTitle}</h2>
          </div>
      </div>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg shadow-xl p-6 md:p-8">
        <p className="text-zinc-300 mb-6 text-lg leading-relaxed">{currentRecipe.shortDescription}</p>
        
        <div className="flex flex-wrap gap-x-6 gap-y-4 text-zinc-300 mb-6 pb-6 border-b border-zinc-700">
            <span className="flex items-center" title="Gesamtzeit"><Clock size={18} className="mr-2 text-[var(--color-accent-400)]" /> {currentRecipe.totalTime}</span>
            <span className="flex items-center" title="Portionen"><Users size={18} className="mr-2 text-[var(--color-accent-400)]" /> {currentServings} Person{currentServings > 1 ? 'en' : ''}</span>
            <span className="flex items-center" title="Schwierigkeit"><BarChart size={18} className="mr-2 text-[var(--color-accent-400)]" /> {currentRecipe.difficulty}</span>
        </div>
        
        <div className="my-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-4">
          <label htmlFor="servings-input" className="font-semibold text-zinc-200">{t('recipeDetail.adjustServings')}</label>
            <div className="flex items-center gap-2">
                <button onClick={() => handleServingsChange(currentServings - 1)} className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50" disabled={currentServings <= 1} aria-label="Portionen verringern"><Minus size={18} /></button>
                <input id="servings-input" type="number" value={currentServings} onChange={(e) => handleServingsChange(parseInt(e.target.value, 10))} className="w-16 text-center bg-transparent border-b-2 border-[var(--color-accent-500)] font-bold text-xl text-zinc-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" min="1" max="100"/>
                <button onClick={() => handleServingsChange(currentServings + 1)} className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50" disabled={currentServings >= 100} aria-label="Portionen erhöhen"><Plus size={18} /></button>
            </div>
        </div>
        
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 my-8">
              {allTags.map((tag, i) => (
                  <span key={`${tag}-${i}`} className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium px-3 py-1 rounded-full">{tag}</span>
              ))}
          </div>
        )}

        <div className="mb-8 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <ShieldAlert size={18} className="text-[var(--color-accent-400)]" /> Naehrwert- & Allergie-Check
            </h3>
            <button
              type="button"
              onClick={handleGeminiNutritionCheck}
              disabled={isGeminiCheckLoading || isNutritionLoading}
              className="py-1.5 px-3 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors text-sm font-medium disabled:opacity-60"
            >
              {isGeminiCheckLoading ? 'Gemini prueft...' : isNutritionLoading ? 'Analyse laeuft...' : 'Mit Gemini verifizieren'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
            <div className="bg-zinc-800/70 rounded-lg p-2">kcal: {Math.round(nutritionReport.calories)}</div>
            <div className="bg-zinc-800/70 rounded-lg p-2">Protein: {Math.round(nutritionReport.protein)} g</div>
            <div className="bg-zinc-800/70 rounded-lg p-2">Fett: {Math.round(nutritionReport.fat)} g</div>
            <div className="bg-zinc-800/70 rounded-lg p-2">Kohlenhydrate: {Math.round(nutritionReport.carbs)} g</div>
          </div>
          <p className="text-xs text-zinc-400 mb-2">
            Lokale USDA-Matches: {nutritionReport.matchedIngredients}/{nutritionReport.totalIngredients}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {nutritionReport.allergens.length > 0 ? nutritionReport.allergens.map((allergen) => (
              <span key={allergen} className="text-xs px-2 py-1 rounded-full border border-amber-600/40 text-amber-300 bg-amber-900/20">
                {allergen}
              </span>
            )) : <span className="text-xs text-zinc-400">Keine klaren Allergene erkannt.</span>}
          </div>
          {geminiVerification && (
            <div className="mt-3 p-3 rounded-lg border border-zinc-700 bg-zinc-900/60 text-sm">
              <p className="text-zinc-200 mb-2">{geminiVerification.summary}</p>
              {geminiVerification.warnings.length > 0 && (
                <ul className="list-disc pl-5 text-zinc-300 space-y-1">
                  {geminiVerification.warnings.map((warning, idx) => <li key={`${warning}-${idx}`}>{warning}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center"><UtensilsCrossed className="mr-3 text-[var(--color-accent-400)]"/>Zutaten</h3>
            <div className="space-y-6">
              {currentRecipe.ingredients.map((group, idx) => (
                <div key={group.sectionTitle || idx}>
                  {group.sectionTitle && <h4 className="font-bold text-[var(--color-accent-400)] mb-3 uppercase text-sm tracking-wider">{group.sectionTitle}</h4>}
                  <ul className="space-y-3">
                    {group.items.map(item => {
                      const scaledQuantityStr = scaleIngredientQuantity(item.quantity, scaleFactor);
                      const requiredQty = parseFloat(scaledQuantityStr.replace(',', '.')) || 0;
                      const pantryQty = pantryMap.get(item.name.toLowerCase()) || 0;
                      
                      let status: 'have' | 'low' | 'missing' = 'missing';
                      if(pantryQty >= requiredQty) status = 'have';
                      else if (pantryQty > 0) status = 'low';

                      return (
                      <li key={item.name} className="flex items-start text-zinc-300 group bg-zinc-900/30 p-2 rounded-lg hover:bg-zinc-900/80 transition-colors">
                        <div className="flex-grow flex items-center">
                           {status === 'have' && <span title="Im Vorrat" className="flex-shrink-0 mr-3"><CheckCircle size={16} className="text-emerald-500"/></span>}
                           {status === 'low' && <span title={`Wird knapp! Du hast ${pantryQty}${item.unit}`} className="flex-shrink-0 mr-3"><AlertCircle size={16} className="text-amber-500"/></span>}
                           {status === 'missing' && <div className="w-4 h-4 rounded-full border-2 border-zinc-700 mr-3 flex-shrink-0"/>}
                           <div className="flex-grow">
                            <span className="font-medium text-zinc-100">{scaledQuantityStr} {item.unit}</span> <span className="text-zinc-400">{item.name}</span>
                           </div>
                        </div>
                        {status !== 'have' && <button onClick={() => handleAddSingleToShoppingList(item)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-zinc-800 rounded text-zinc-400 hover:text-[var(--color-accent-400)]" title="Zur Einkaufsliste hinzufügen"><ShoppingCartIcon size={16}/></button>}
                      </li>
                    )})}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-semibold text-white mb-6">Anleitung</h3>
            <div className="space-y-8">
              {currentRecipe.instructions.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 flex flex-col items-center">
                      <span className="bg-zinc-800 text-[var(--color-accent-400)] font-bold rounded-full h-8 w-8 flex items-center justify-center border border-zinc-700 shadow-lg">{index + 1}</span>
                      {index < currentRecipe.instructions.length - 1 && <div className="w-px h-full bg-zinc-800 my-2"></div>}
                  </div>
                  <p className="text-zinc-300 pt-1 text-lg leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {currentRecipe.expertTips && currentRecipe.expertTips.length > 0 && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
             <h3 className="text-2xl font-semibold text-white mb-6 flex items-center"><Lightbulb className="mr-3 text-[var(--color-accent-400)]"/>Expertentipps</h3>
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

        <div className="mt-12 pt-6 border-t border-zinc-700 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
             {isSaved && (
                <>
                    <button onClick={handleStartCookMode} className="flex items-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-[var(--color-accent-400)] transition-colors shadow-lg shadow-[var(--color-accent-500)]/20">
                        <CookingPot size={18} /> Kochmodus
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-zinc-800 text-zinc-200 font-bold py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700">
                        <CalendarPlus size={18} /> Planen
                    </button>
                     <button onClick={handleAddMissingToShoppingList} className="flex items-center gap-2 bg-zinc-800 text-zinc-200 font-bold py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700">
                        <ShoppingCartIcon size={18} /> Einkaufen
                    </button>
                </>
             )}
             <div className="relative inline-block">
              <button type="button" onClick={() => setExportOpen(!isExportOpen)} className="flex items-center gap-2 bg-zinc-800 text-zinc-200 font-bold py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700" aria-haspopup="menu" aria-expanded={isExportOpen} aria-controls="recipe-export-menu">
                    <FileDown size={18} /> Export <ChevronDown size={16} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                </button>
                {isExportOpen && (
                <div id="recipe-export-menu" className="absolute bottom-full mb-2 w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-xl z-10 overflow-hidden" role="menu" aria-label="Rezept exportieren">
                  <button type="button" onClick={() => handleExport('pdf')} className="block w-full text-left text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer" role="menuitem">PDF</button>
                  <button type="button" onClick={() => handleExport('csv')} className="block w-full text-left text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer" role="menuitem">CSV</button>
                  <button type="button" onClick={() => handleExport('json')} className="block w-full text-left text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer" role="menuitem">JSON</button>
                  <button type="button" onClick={() => handleExport('md')} className="block w-full text-left text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer" role="menuitem">Markdown</button>
                    </div>
                )}
             </div>
           </div>

           <div className="flex items-center gap-4">
                 {isSaved && (
                  <button onClick={handleToggleFavorite} title={currentRecipe.isFavorite ? t('recipeDetail.actions.removeFavorite') : t('recipeDetail.actions.markFavorite')} className="p-2 rounded-full text-zinc-400 hover:text-[var(--color-accent-400)] hover:bg-zinc-800 transition-colors">
                        <Star size={22} className={`transition-colors ${currentRecipe.isFavorite ? 'fill-current text-[var(--color-accent-400)]' : ''}`} />
                    </button>
                )}
                {isSaved ? (
                    <button onClick={handleDelete} className="flex items-center gap-2 bg-red-900/20 text-red-400 font-bold py-2 px-4 rounded-md hover:bg-red-900/40 transition-colors border border-red-900/50">
                    <Trash2 size={18} /> {t('common.delete')}
                    </button>
                ) : (
                    <button onClick={handleSave} className="flex items-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-[var(--color-accent-400)] transition-colors shadow-lg shadow-[var(--color-accent-500)]/20">
                    <Save size={18} /> {t('common.save')}
                    </button>
                )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;