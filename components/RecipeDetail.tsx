import React, { useState } from 'react';
import { Recipe, MealPlanItem } from '@/types';
import { db, addRecipe, deleteRecipe, addRecipeToMealPlan } from '@/services/db';
import { exportRecipeToPdf, exportRecipeToCsv, exportRecipeToMarkdown, exportRecipeToTxt } from '@/services/exportService';
import { ArrowLeft, Clock, Users, BarChart, UtensilsCrossed, Lightbulb, Save, Trash2, CheckCircle, CalendarPlus, FileDown, Star, ChevronDown } from 'lucide-react';

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


const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack }) => {
  const [currentRecipe, setCurrentRecipe] = useState(recipe);
  const [isSaved, setIsSaved] = useState(!!currentRecipe.id);
  const [feedback, setFeedback] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);

  const showFeedback = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(''), 3000);
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
      showFeedback('Speichern fehlgeschlagen.');
    }
  };

  const handleDelete = async () => {
    if (currentRecipe.id && window.confirm(`Möchtest du das Rezept "${currentRecipe.recipeTitle}" wirklich endgültig löschen?`)) {
      try {
        await deleteRecipe(currentRecipe.id);
        onBack(); // Go back after deleting
      } catch (error) {
        console.error("Failed to delete recipe:", error);
        showFeedback('Löschen fehlgeschlagen.');
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
            showFeedback('Aktion fehlgeschlagen.');
        }
    }
  };
  
  const allTags = currentRecipe.tags ? [
    ...(currentRecipe.tags.course || []),
    ...(currentRecipe.tags.cuisine || []),
    ...(currentRecipe.tags.occasion || []),
    ...(currentRecipe.tags.mainIngredient || []),
    ...(currentRecipe.tags.prepMethod || []),
    ...(currentRecipe.tags.difficulty || []),
    ...(currentRecipe.tags.totalTime || [])
  ].flat().filter(Boolean) : [];

  return (
    <div className="animate-fade-in">
      {isModalOpen && currentRecipe.id && <MealPlanModal recipeId={currentRecipe.id} onClose={() => setIsModalOpen(false)} onSave={() => showFeedback('Zum Essensplan hinzugefügt!')} />}

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
                    {group.items.map(item => (
                      <li key={item.name} className="flex items-start text-zinc-300">
                        <span className="text-amber-500 mr-2 mt-1.5">&#9679;</span>
                        <span>{`${item.quantity || ''} ${item.unit || ''} ${item.name}`.trim()}</span>
                      </li>
                    ))}
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
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors">
                    <CalendarPlus size={18} /> Zum Essensplan
                </button>
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
                {feedback && <p role="status" className="text-sm text-zinc-400">{feedback}</p>}
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