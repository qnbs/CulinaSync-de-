import React, { useState, useMemo } from 'react';
import { Recipe } from '@/types';
import { db, addRecipe, deleteRecipe, addRecipeToMealPlan, addMissingIngredientsToShoppingList } from '@/services/db';
import { exportRecipeToPdf, exportRecipeToCsv, exportRecipeToMarkdown, exportRecipeToTxt } from '@/services/exportService';
import { ArrowLeft, Clock, Users, BarChart, UtensilsCrossed, Lightbulb, Save, Trash2, CheckCircle, CalendarPlus, FileDown, Star, ChevronDown, Plus, Minus, CookingPot, ShoppingCart, X as XIcon } from 'lucide-react';
import { scaleIngredientQuantity } from '@/services/utils';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
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

const CookModeView: React.FC<{ recipe: Recipe, currentStep: number, setCurrentStep: (updater: (s: number) => number) => void, onExit: () => void }> = ({ recipe, currentStep, setCurrentStep, onExit }) => (
    <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col p-4 sm:p-8 text-zinc-100 font-sans">
        <header className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-xl font-bold text-amber-400 truncate pr-4">{recipe.recipeTitle}</h3>
            <button onClick={onExit} className="flex items-center gap-2 py-2 px-4 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors">
                <XIcon size={18} /> <span className="hidden sm:inline">Kochmodus beenden</span>
            </button>
        </header>
        <div className="flex-grow flex flex-col justify-center items-center text-center overflow-y-auto">
            <p className="text-zinc-400 mb-4 font-semibold">Schritt {currentStep + 1} von {recipe.instructions.length}</p>
            <p className="text-2xl md:text-4xl leading-relaxed max-w-4xl animate-fade-in">{recipe.instructions[currentStep]}</p>
        </div>
        <footer className="flex justify-center items-center gap-4 pt-4 flex-shrink-0">
            <button onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 0} className="py-3 px-6 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 transition-colors">Zurück</button>
            <span className="font-bold text-lg tabular-nums">{currentStep + 1} / {recipe.instructions.length}</span>
            <button onClick={() => setCurrentStep(s => s + 1)} disabled={currentStep >= recipe.instructions.length - 1} className="py-3 px-6 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 disabled:opacity-50 transition-colors">Weiter</button>
        </footer>
    </div>
);


const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack }) => {
  const [currentRecipe, setCurrentRecipe] = useState(recipe);
  const [isSaved, setIsSaved] = useState(!!currentRecipe.id);
  const [feedback, setFeedback] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);
  const [isCookMode, setIsCookMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
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

  const showFeedback = (message: string, isError: boolean = false) => {
    setFeedback(message);
    setTimeout(() => setFeedback(''), 4000);
  }

  const handleSave = async () => {
    try {
      const newId = await addRecipe(currentRecipe);
      if(newId) {
        setCurrentRecipe(prev => ({ ...prev, id: newId }));
        setIsSaved(true);
        showFeedback('Rezept erfolgreich gespeichert!');
      }
    } catch (error) {
      console.error("Failed to save recipe:", error);
      showFeedback('Speichern fehlgeschlagen.', true);
    }
  };

  const handleDelete = async () => {
    if (currentRecipe.id && window.confirm(`Möchtest du das Rezept "${currentRecipe.recipeTitle}" wirklich endgültig löschen?`)) {
      try {
        await deleteRecipe(currentRecipe.id);
        onBack(); // Go back after deleting
      } catch (error) {
        console.error("Failed to delete recipe:", error);
        showFeedback('Löschen fehlgeschlagen.', true);
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (currentRecipe.id) {
        try {
            const newIsFavorite = !currentRecipe.isFavorite;
            await db.recipes.update(currentRecipe.id, { isFavorite: newIsFavorite });
            setCurrentRecipe(prev => ({...prev, isFavorite: newIsFavorite}));
            showFeedback(newIsFavorite ? 'Als Favorit markiert!' : 'Favorit entfernt.');
        } catch (error) {
            console.error("Failed to update favorite status:", error);
            showFeedback('Aktion fehlgeschlagen.', true);
        }
    }
  };

  const handleStartCookMode = () => {
    setCurrentStep(0);
    setIsCookMode(true);
  };
  
  const handleAddToShoppingList = async () => {
    if (!currentRecipe.id) return;
    try {
        const count = await addMissingIngredientsToShoppingList(currentRecipe.id);
        if (count > 0) {
            showFeedback(`${count} fehlende(r) Artikel zur Einkaufsliste hinzugefügt.`);
        } else {
            showFeedback('Alle Zutaten sind bereits im Vorrat oder auf der Liste!');
        }
    } catch (error) {
        console.error("Failed to add missing ingredients:", error);
        showFeedback('Fehler beim Hinzufügen zur Einkaufsliste.', true);
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
    <div className="animate-fade-in">
      {isModalOpen && currentRecipe.id && <MealPlanModal recipeId={currentRecipe.id} onClose={() => setIsModalOpen(false)} onSave={() => showFeedback('Zum Essensplan hinzugefügt!')} />}
      {isCookMode && <CookModeView recipe={currentRecipe} currentStep={currentStep} setCurrentStep={setCurrentStep} onExit={() => setIsCookMode(false)} />}

      <button onClick={onBack} className="flex items-center text-amber-400 hover:text-amber-300 mb-6 font-semibold">
        <ArrowLeft size={20} className="mr-2" />
        Zurück
      </button>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg shadow-xl p-6 md:p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-amber-400 mb-4">{currentRecipe.recipeTitle}</h2>
        <p className="text-zinc-300 mb-6">{currentRecipe.shortDescription}</p>
        
        <div className="flex flex-wrap gap-x-6 gap-y-4 text-zinc-300 mb-6 pb-6 border-b border-zinc-700">
            <div className="flex items-center" title="Gesamtzeit"><Clock size={18} className="mr-2 text-zinc-500" /> {currentRecipe.totalTime}</div>
            <div className="flex items-center" title="Portionen"><Users size={18} className="mr-2 text-zinc-500" /> {currentRecipe.servings}</div>
            <div className="flex items-center" title="Schwierigkeit"><BarChart size={18} className="mr-2 text-zinc-500" /> {currentRecipe.difficulty}</div>
        </div>
        
        <div className="my-6 p-4 bg-zinc-800 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-4">
            <label htmlFor="servings-input" className="font-semibold text-zinc-200">Portionen anpassen:</label>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => handleServingsChange(currentServings - 1)} 
                    className="p-2 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors disabled:opacity-50"
                    disabled={currentServings <= 1}
                    aria-label="Portionen verringern"
                >
                    <Minus size={18} />
                </button>
                <input 
                    id="servings-input"
                    type="number" 
                    value={currentServings} 
                    onChange={(e) => handleServingsChange(parseInt(e.target.value, 10))}
                    className="w-16 text-center bg-zinc-900 border border-zinc-700 rounded-md p-2 font-bold text-lg text-amber-400 focus:ring-2 focus:ring-amber-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                    max="100"
                />
                <button 
                    onClick={() => handleServingsChange(currentServings + 1)} 
                    className="p-2 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors disabled:opacity-50"
                    disabled={currentServings >= 100}
                    aria-label="Portionen erhöhen"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>

        {currentRecipe.nutritionPerServing && (
          <div className="my-6">
            <h3 className="text-xl font-semibold text-white mb-3">Nährwerte (pro Portion)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-zinc-800 p-3 rounded-lg">
                <p className="text-sm text-zinc-400">Kalorien</p>
                <p className="text-lg font-bold text-amber-400">{currentRecipe.nutritionPerServing.calories}</p>
              </div>
              <div className="bg-zinc-800 p-3 rounded-lg">
                <p className="text-sm text-zinc-400">Protein</p>
                <p className="text-lg font-bold text-amber-400">{currentRecipe.nutritionPerServing.protein}</p>
              </div>
              <div className="bg-zinc-800 p-3 rounded-lg">
                <p className="text-sm text-zinc-400">Fett</p>
                <p className="text-lg font-bold text-amber-400">{currentRecipe.nutritionPerServing.fat}</p>
              </div>
              <div className="bg-zinc-800 p-3 rounded-lg">
                <p className="text-sm text-zinc-400">Kohlenhydrate</p>
                <p className="text-lg font-bold text-amber-400">{currentRecipe.nutritionPerServing.carbs}</p>
              </div>
            </div>
          </div>
        )}
        
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
                      const scaledQuantity = scaleIngredientQuantity(item.quantity, scaleFactor);
                      return (
                      <li key={item.name} className="flex items-start text-zinc-300">
                        <span className="text-amber-500 mr-2 mt-1.5">&#9679;</span>
                        <span>{`${scaledQuantity || ''} ${item.unit || ''} ${item.name}`.trim()}</span>
                      </li>
                    )})}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-semibold text-white mb-4">Anleitung</h3>
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
                     <button onClick={handleAddToShoppingList} className="flex items-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors">
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
                        <a onClick={() => { exportRecipeToPdf(currentRecipe); setExportOpen(false); }} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">PDF</a>
                        <a onClick={() => { exportRecipeToCsv(currentRecipe); setExportOpen(false); }} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">CSV</a>
                        <a onClick={() => { exportRecipeToMarkdown(currentRecipe); setExportOpen(false); }} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">Markdown</a>
                        <a onClick={() => { exportRecipeToTxt(currentRecipe); setExportOpen(false); }} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">Text</a>
                    </div>
                )}
             </div>
           </div>

           <div className="flex items-center gap-4">
                {feedback && <p role="status" className="text-sm text-zinc-400 min-h-[1.25rem]">{feedback}</p>}
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