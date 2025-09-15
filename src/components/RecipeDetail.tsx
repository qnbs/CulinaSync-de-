
import React, { useState, useMemo, useEffect } from 'react';
import { Recipe, PantryItem, IngredientItem } from '@/types';
import { db, addRecipe, deleteRecipe, addRecipeToMealPlan, addMissingIngredientsToShoppingList, addShoppingListItem } from '@/services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { exportRecipeToPdf, exportRecipeToCsv, exportRecipeToMarkdown, exportRecipeToTxt, exportRecipeToJson } from '@/services/exportService';
import { ArrowLeft, Clock, Users, BarChart, UtensilsCrossed, Lightbulb, Save, Trash2, CheckCircle, CalendarPlus, FileDown, Star, ChevronDown, Plus, Minus, CookingPot, ShoppingCart, X as XIcon, AlertCircle, ShoppingCartIcon, Volume2, PauseCircle } from 'lucide-react';
import { scaleIngredientQuantity } from '@/services/utils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  // FIX: Add voiceAction prop to handle voice commands on this page.
  voiceAction?: {type: string, payload: any} | null;
}

const MealPlanModal: React.FC<{recipeId: number, onClose: () => void, onSave: () => void}> = ({recipeId, onClose, onSave}) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [mealType, setMealType] = useState<'Frühstück' | 'Mittagessen' | 'Abendessen'>('Abendessen');

    const handleSave = async () => {
        await addRecipeToMealPlan({ recipeId, date, mealType });
        onSave();
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Zum Essensplan hinzufügen</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-zinc-400 mb-1">Datum</label>
                        <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"/>
                    </div>
                    <div>
                        <label htmlFor="mealType" className="block text-sm font-medium text-zinc-400 mb-1">Mahlzeit</label>
                        <select id="mealType" value={mealType} onChange={e => setMealType(e.target.value as any)} className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
                            <option>Frühstück</option>
                            <option>Mittagessen</option>
                            <option>Abendessen</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                        <button onClick={handleSave} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400">Speichern</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const CookModeView: React.FC<{ recipe: Recipe, currentStep: number, setCurrentStep: (updater: (s: number) => number) => void, onExit: () => void }> = ({ recipe, currentStep, setCurrentStep, onExit }) => {
    const { speak, cancel } = useSpeechSynthesis();
    
    useEffect(() => {
        // Speak the current step when it changes
        speak(`Schritt ${currentStep + 1}. ${recipe.instructions[currentStep]}`);
        
        // Cleanup function to stop speaking if component unmounts or step changes
        return () => {
            cancel();
        };
    }, [currentStep, recipe, speak, cancel]);

    return (
    <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col p-4 sm:p-8 text-zinc-100 font-sans">
        <header className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-xl font-bold text-amber-400 truncate pr-4">{recipe.recipeTitle}</h3>
            <button onClick={onExit} className="flex items-center gap-2 py-2 px-4 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors">
                <XIcon size={18} /> <span className="hidden sm:inline">Kochmodus beenden</span>
            </button>
        </header>
        <div className="flex-grow flex flex-col justify-center items-center text-center overflow-y-auto">
            <p className="text-zinc-400 mb-4 font-semibold">Schritt {currentStep + 1} von {recipe.instructions.length}</p>
            <p className="text-2xl md:text-4xl leading-relaxed max-w-4xl page-fade-in">{recipe.instructions[currentStep]}</p>
        </div>
        <footer className="flex justify-center items-center gap-4 pt-4 flex-shrink-0">
            <button onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 0} className="py-3 px-6 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 transition-colors">Zurück</button>
            <span className="font-bold text-lg tabular-nums">{currentStep + 1} / {recipe.instructions.length}</span>
            <button onClick={() => setCurrentStep(s => s + 1)} disabled={currentStep >= recipe.instructions.length - 1} className="py-3 px-6 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 disabled:opacity-50 transition-colors">Weiter</button>
        </footer>
    </div>
)};


const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, addToast, voiceAction }) => {
  const [currentRecipe, setCurrentRecipe] = useState(recipe);
  const [isSaved, setIsSaved] = useState(!!currentRecipe.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);
  const [isCookMode, setIsCookMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { speak, cancel, isSpeaking } = useSpeechSynthesis();

  const pantryItems = useLiveQuery(() => db.pantry.toArray(), []);
  const pantryMap: Map<string, number> = useMemo(() => new Map(pantryItems?.map((p: PantryItem) => [p.name.toLowerCase(), p.quantity]) || []), [pantryItems]);
  
  const originalServings = useMemo(() => parseInt(recipe.servings.match(/\d+/)?.[0] || '1', 10), [recipe.servings]);
  const [currentServings, setCurrentServings] = useState(originalServings);
  
  useEffect(() => {
    if (voiceAction && voiceAction.type.startsWith('START_COOK_MODE')) {
        handleStartCookMode();
    }
  }, [voiceAction]);

  const handleServingsChange = (newServings: number) => {
      if (!isNaN(newServings) && newServings > 0 && newServings <= 100) {
          setCurrentServings(newServings);
      }
  };

  const scaleFactor = useMemo(() => {
      if (!originalServings || !currentServings || originalServings === 0) return 1;
      return currentServings / originalServings;
  }, [currentServings, originalServings]);

  const handleSave = async () => {
    try {
      const newId = await addRecipe(currentRecipe);
      if(newId) {
        setCurrentRecipe(prev => ({ ...prev, id: newId }));
        setIsSaved(true);
        addToast('Rezept erfolgreich gespeichert!');
      }
    } catch (error) {
      console.error("Failed to save recipe:", error);
      addToast('Speichern fehlgeschlagen.', 'error');
    }
  };

  const handleDelete = async () => {
    if (currentRecipe.id && window.confirm(`Möchtest du das Rezept "${currentRecipe.recipeTitle}" wirklich endgültig löschen?`)) {
      try {
        await deleteRecipe(currentRecipe.id);
        addToast('Rezept gelöscht.');
        onBack();
      } catch (error) {
        console.error("Failed to delete recipe:", error);
        addToast('Löschen fehlgeschlagen.', 'error');
      }
    }
  };
  
  const handleExport = (format: 'pdf' | 'csv' | 'json' | 'md' | 'txt') => {
    setExportOpen(false);
    if (window.confirm(`Möchtest du das Rezept wirklich als ${format.toUpperCase()}-Datei exportieren?`)) {
      try {
        switch (format) {
            case 'pdf': exportRecipeToPdf(currentRecipe); break;
            case 'csv': exportRecipeToCsv(currentRecipe); break;
            case 'json': exportRecipeToJson(currentRecipe); break;
            case 'md': exportRecipeToMarkdown(currentRecipe); break;
            case 'txt': exportRecipeToTxt(currentRecipe); break;
        }
        addToast(`Rezept als ${format.toUpperCase()} exportiert.`, 'success');
      } catch (error) {
          addToast("Export fehlgeschlagen.", "error");
          console.error(error);
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (currentRecipe.id) {
        try {
            const newIsFavorite = !currentRecipe.isFavorite;
            await db.recipes.update(currentRecipe.id, { isFavorite: newIsFavorite, updatedAt: Date.now() });
            setCurrentRecipe(prev => ({...prev, isFavorite: newIsFavorite}));
            addToast(newIsFavorite ? 'Als Favorit markiert!' : 'Favorit entfernt.');
        } catch (error) {
            console.error("Failed to update favorite status:", error);
            addToast('Aktion fehlgeschlagen.', 'error');
        }
    }
  };

  const handleStartCookMode = () => {
    setCurrentStep(0);
    setIsCookMode(true);
  };
  
  const handleAddMissingToShoppingList = async () => {
      if(!recipe.id) return;
      try {
        const count = await addMissingIngredientsToShoppingList(recipe.id);
        if (count > 0) {
            addToast(`${count} fehlende(r) Artikel zur Einkaufsliste hinzugefügt.`);
        } else {
            addToast('Alle Zutaten sind bereits im Vorrat oder auf der Liste!', 'info');
        }
      } catch (e) {
        addToast("Fehler beim Hinzufügen zur Einkaufsliste.", "error");
      }
  };

  const handleAddSingleToShoppingList = async (item: IngredientItem) => {
    const scaledQuantityStr = scaleIngredientQuantity(item.quantity, scaleFactor);
    const requiredQty = parseFloat(scaledQuantityStr.replace(',', '.')) || 0;
    const pantryQty = pantryMap.get(item.name.toLowerCase()) || 0;

    try {
        await addShoppingListItem({ 
            name: item.name, 
            quantity: Math.max(1, requiredQty - pantryQty), 
            unit: item.unit,
            recipeId: currentRecipe.id, 
            isChecked: false 
        });
        addToast(`"${item.name}" zur Einkaufsliste hinzugefügt.`);
    } catch (e) {
        addToast(`Fehler beim Hinzufügen von "${item.name}".`, 'error');
    }
  }

  const handleReadInstructions = () => {
      if (isSpeaking) {
          cancel();
      } else {
          const textToSpeak = `Anleitung für ${currentRecipe.recipeTitle}. ` + currentRecipe.instructions.map((step, i) => `Schritt ${i+1}. ${step}`).join(' ');
          speak(textToSpeak);
      }
  };
  
  const allTags = currentRecipe.tags ? [
    ...(currentRecipe.tags.course || []),
    ...(currentRecipe.tags.cuisine || []),
    ...(currentRecipe.tags.occasion || []),
    ...(currentRecipe.tags.mainIngredient || []),
    ...(currentRecipe.tags.prepMethod || []),
    ...(currentRecipe.tags.diet || [])
  ].flat().filter(Boolean) : [];

  return (
    <div className="page-fade-in">
      {isModalOpen && currentRecipe.id && <MealPlanModal recipeId={currentRecipe.id} onClose={() => setIsModalOpen(false)} onSave={() => addToast('Zum Essensplan hinzugefügt!')} />}
      {isCookMode && <CookModeView recipe={currentRecipe} currentStep={currentStep} setCurrentStep={setCurrentStep} onExit={() => setIsCookMode(false)} />}

      <button onClick={onBack} className="flex items-center text-amber-400 hover:text-amber-300 mb-6 font-semibold">
        <ArrowLeft size={20} className="mr-2" />
        Zurück zur Übersicht
      </button>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg shadow-xl p-6 md:p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-amber-400 mb-4">{currentRecipe.recipeTitle}</h2>
        <p className="text-zinc-300 mb-6">{currentRecipe.shortDescription}</p>
        
        <div className="flex flex-wrap gap-x-6 gap-y-4 text-zinc-300 mb-6 pb-6 border-b border-zinc-700">
            <span className="flex items-center" title="Gesamtzeit"><Clock size={18} className="mr-2 text-zinc-500" /> {currentRecipe.totalTime}</span>
            <span className="flex items-center" title="Portionen"><Users size={18} className="mr-2 text-zinc-500" /> {currentServings} Person{currentServings > 1 ? 'en' : ''}</span>
            <span className="flex items-center" title="Schwierigkeit"><BarChart size={18} className="mr-2 text-zinc-500" /> {currentRecipe.difficulty}</span>
        </div>
        
        <div className="my-6 p-4 bg-zinc-800 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-4">
            <label htmlFor="servings-input" className="font-semibold text-zinc-200">Portionen anpassen:</label>
            <div className="flex items-center gap-2">
                <button onClick={() => handleServingsChange(currentServings - 1)} className="p-2 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors disabled:opacity-50" disabled={currentServings <= 1} aria-label="Portionen verringern"><Minus size={18} /></button>
                <input id="servings-input" type="number" value={currentServings} onChange={(e) => handleServingsChange(parseInt(e.target.value, 10))} className="w-16 text-center bg-zinc-900 border border-zinc-700 rounded-md p-2 font-bold text-lg text-amber-400 focus:ring-2 focus:ring-amber-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" min="1" max="100"/>
                <button onClick={() => handleServingsChange(currentServings + 1)} className="p-2 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors disabled:opacity-50" disabled={currentServings >= 100} aria-label="Portionen erhöhen"><Plus size={18} /></button>
            </div>
        </div>
        
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 my-8">
              {allTags.map((tag, i) => (
                  <span key={`${tag}-${i}`} className="bg-zinc-700 text-zinc-300 text-xs font-medium px-3 py-1 rounded-full">{tag}</span>
              ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-semibold text-white mb-4 flex items-center"><UtensilsCrossed className="mr-3 text-amber-400"/>Zutaten</h3>
            <div className="space-y-4">
              {currentRecipe.ingredients.map((group, idx) => (
                <div key={group.sectionTitle || idx}>
                  {group.sectionTitle && <h4 className="font-bold text-zinc-300 mb-2">{group.sectionTitle}</h4>}
                  <ul className="space-y-2">
                    {group.items.map(item => {
                      const scaledQuantityStr = scaleIngredientQuantity(item.quantity, scaleFactor);
                      const requiredQty = parseFloat(scaledQuantityStr.replace(',', '.')) || 0;
                      const pantryQty = pantryMap.get(item.name.toLowerCase()) || 0;
                      
                      let status: 'have' | 'low' | 'missing' = 'missing';
                      if(pantryQty >= requiredQty) status = 'have';
                      else if (pantryQty > 0) status = 'low';

                      return (
                      <li key={item.name} className="flex items-start text-zinc-300 group">
                        <div className="flex-grow flex items-start">
                           {status === 'have' && <span title="Im Vorrat" className="flex-shrink-0"><CheckCircle size={16} className="text-green-500 mr-2 mt-1"/></span>}
                           {status === 'low' && <span title={`Wird knapp! Du hast ${pantryQty}${item.unit}`} className="flex-shrink-0"><AlertCircle size={16} className="text-yellow-500 mr-2 mt-1"/></span>}
                           {status === 'missing' && <div className="w-4 h-4 rounded-full border-2 border-zinc-600 mr-2 mt-1 flex-shrink-0"/>}
                           <div>
                            <span>{`${scaledQuantityStr || ''} ${item.unit || ''} ${item.name}`.trim()}</span>
                            {scaleFactor !== 1 && <span className="text-xs text-zinc-500 ml-2">(Original: {item.quantity} {item.unit})</span>}
                           </div>
                        </div>
                        {status !== 'have' && <button onClick={() => handleAddSingleToShoppingList(item)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 text-zinc-400 hover:text-amber-400" title="Zur Einkaufsliste hinzufügen"><ShoppingCartIcon size={16}/></button>}
                      </li>
                    )})}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-white">Anleitung</h3>
                <button onClick={handleReadInstructions} className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:bg-zinc-700'}`} title={isSpeaking ? "Vorlesen stoppen" : "Anleitung vorlesen"}>
                    {isSpeaking ? <PauseCircle /> : <Volume2 />}
                </button>
            </div>
            <ol className="space-y-4">
              {currentRecipe.instructions.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-amber-500 text-zinc-900 font-bold rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center text-md mr-4">{index + 1}</span>
                  <p className="text-zinc-300 pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {currentRecipe.expertTips && currentRecipe.expertTips.length > 0 && (
          <div className="mt-10 pt-6 border-t border-zinc-700">
             <h3 className="text-2xl font-semibold text-white mb-4 flex items-center"><Lightbulb className="mr-3 text-amber-400"/>Expertentipps</h3>
             <div className="space-y-4">
              {currentRecipe.expertTips.map((tip, i) => (
                  <div key={tip.title + i} className="bg-zinc-900/50 p-4 rounded-md">
                      <h4 className="font-bold text-zinc-200">{tip.title}</h4>
                      <p className="text-zinc-400 mt-1">{tip.content}</p>
                  </div>
              ))}
             </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-zinc-700 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="flex flex-wrap gap-2">
             {isSaved && (
                <>
                    <button onClick={handleStartCookMode} className="flex items-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors">
                        <CookingPot size={18} /> Kochmodus
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors">
                        <CalendarPlus size={18} /> Zum Essensplan
                    </button>
                     <button onClick={handleAddMissingToShoppingList} className="flex items-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors">
                        <ShoppingCart size={18} /> Fehlendes kaufen
                    </button>
                </>
             )}
             <div className="relative inline-block">
                <button onClick={() => setExportOpen(!isExportOpen)} className="flex items-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors">
                    <FileDown size={18} /> Exportieren <ChevronDown size={16} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                </button>
                {isExportOpen && (
                    <div className="absolute bottom-full mb-2 w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10">
                        <a onClick={() => handleExport('pdf')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">PDF</a>
                        <a onClick={() => handleExport('csv')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">CSV</a>
                        <a onClick={() => handleExport('json')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">JSON</a>
                        <a onClick={() => handleExport('md')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">Markdown (.md)</a>
                        <a onClick={() => handleExport('txt')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">Text (.txt)</a>
                    </div>
                )}
             </div>
           </div>

           <div className="flex items-center gap-4">
                 {isSaved && (
                    <button onClick={handleToggleFavorite} title={currentRecipe.isFavorite ? "Favorit entfernen" : "Als Favorit markieren"} className="p-2 rounded-full text-zinc-400 hover:text-amber-400 hover:bg-zinc-700 transition-colors">
                        <Star size={22} className={`transition-colors ${currentRecipe.isFavorite ? 'fill-current text-amber-400' : ''}`} />
                    </button>
                )}
                {isSaved ? (
                    <button onClick={handleDelete} className="flex items-center gap-2 bg-red-600/80 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors">
                        <Trash2 size={18} /> Rezept löschen
                    </button>
                ) : (
                    <button onClick={handleSave} className="flex items-center gap-2 bg-amber-500 text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400 transition-colors">
                        <Save size={18} /> Rezept speichern
                    </button>
                )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
