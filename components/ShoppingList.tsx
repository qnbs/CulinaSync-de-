import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateShoppingListItem, clearShoppingList, addShoppingListItem } from '@/services/db';
import { ShoppingListItem, Recipe, MealPlanItem, PantryItem } from '@/types';
import { RefreshCw, Trash2, FileDown, Plus, ClipboardList, CheckCircle, Info, Edit3, X, Save, ChevronDown, ChevronUp, CheckSquare, Square, Bot, LoaderCircle } from 'lucide-react';
import { exportShoppingListToCsv, exportShoppingListToPdf, exportShoppingListToMarkdown, exportShoppingListToTxt } from '@/services/exportService';
import { generateShoppingList } from '@/services/geminiService';
import { getCategoryForItem } from '@/services/utils';

interface GenerateListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (mealIds: number[]) => void;
    mealPlan: MealPlanItem[];
    recipesById: Map<number | undefined, Recipe>;
}

const GenerateListModal: React.FC<GenerateListModalProps> = ({ isOpen, onClose, onGenerate, mealPlan, recipesById }) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSelectedIds(mealPlan.map(m => m.id!));
        }
    }, [isOpen, mealPlan]);

    const handleToggle = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    
    const handleSelectAll = () => setSelectedIds(mealPlan.map(m => m.id!));
    const handleDeselectAll = () => setSelectedIds([]);
    
    const groupedMeals = useMemo(() => {
        return mealPlan.reduce((acc, meal) => {
            const date = new Date(meal.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            if (!acc[date]) acc[date] = [];
            acc[date].push(meal);
            return acc;
        }, {} as Record<string, MealPlanItem[]>);
    }, [mealPlan]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 page-fade-in" onClick={onClose}>
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-2xl shadow-xl flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Einkaufsliste aus Plan generieren</h3>
                <p className="text-zinc-400 text-sm mb-4">Wähle die Mahlzeiten aus, für die du einkaufen möchtest. Bereits gekochte Mahlzeiten werden nicht angezeigt.</p>
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={handleSelectAll} className="text-sm font-semibold text-amber-400 hover:text-amber-300">Alle auswählen</button>
                    <button onClick={handleDeselectAll} className="text-sm font-semibold text-amber-400 hover:text-amber-300">Alle abwählen</button>
                </div>
                <div className="overflow-y-auto flex-grow pr-2 -mr-2 border-y border-zinc-700 py-2">
                    {Object.entries(groupedMeals).length > 0 ? Object.entries(groupedMeals).map(([date, meals]) => (
                        <div key={date} className="mb-4">
                            <h4 className="font-semibold text-amber-500 mb-2">{date}</h4>
                            <ul className="space-y-2">
                                {meals.map(meal => {
                                    const recipe = recipesById.get(meal.recipeId);
                                    return (
                                        <li key={meal.id} onClick={() => handleToggle(meal.id!)} className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-zinc-700 transition-colors">
                                            {selectedIds.includes(meal.id!) ? <CheckSquare className="text-amber-400"/> : <Square className="text-zinc-500"/>}
                                            <span className="text-zinc-300">{meal.mealType}: <span className="font-semibold text-white">{recipe?.recipeTitle || "Unbekanntes Rezept"}</span></span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    )) : <p className="text-zinc-500 text-center py-8">Keine geplanten Mahlzeiten gefunden.</p>}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                    <button onClick={() => onGenerate(selectedIds)} disabled={selectedIds.length === 0} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 disabled:bg-zinc-600 disabled:cursor-not-allowed">
                        {selectedIds.length} Mahlzeiten generieren
                    </button>
                </div>
            </div>
        </div>
    );
};

const ShoppingListItemComponent = React.memo<{
    item: ShoppingListItem;
    isEditing: boolean;
    editingItem: ShoppingListItem | null;
    recipeName: string | null;
    onToggle: (item: ShoppingListItem) => void;
    onStartEdit: (item: ShoppingListItem) => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    setEditingItem: React.Dispatch<React.SetStateAction<ShoppingListItem | null>>;
    onDeleteItem: (id: number) => void;
}>(({
    item, isEditing, editingItem, recipeName,
    onToggle, onStartEdit, onCancelEdit, onSaveEdit, setEditingItem, onDeleteItem
}) => {
    if (isEditing) {
        return (
            <li className="p-2 bg-zinc-800 rounded-md">
                <div className="flex items-center gap-2">
                  <input type="text" value={editingItem!.name} onChange={e => setEditingItem({...editingItem!, name: e.target.value})} className="flex-grow bg-zinc-700 rounded p-1 focus:ring-1 focus:ring-amber-500" />
                  <input type="number" value={editingItem!.quantity} onChange={e => setEditingItem({...editingItem!, quantity: parseFloat(e.target.value) || 0})} className="w-16 bg-zinc-700 rounded p-1 focus:ring-1 focus:ring-amber-500" />
                  <input type="text" value={editingItem!.unit} onChange={e => setEditingItem({...editingItem!, unit: e.target.value})} className="w-20 bg-zinc-700 rounded p-1 focus:ring-1 focus:ring-amber-500" />
                  <button onClick={onSaveEdit} className="p-2 rounded bg-amber-500 hover:bg-amber-400 text-zinc-900"><Save size={16}/></button>
                  <button onClick={onCancelEdit} className="p-2 rounded bg-zinc-600 hover:bg-zinc-500"><X size={16}/></button>
                </div>
            </li>
        );
    }

    return (
        <li className="flex items-start gap-3 p-2 rounded-md group hover:bg-zinc-800 transition-colors">
            <button onClick={() => onToggle(item)} className="mt-1">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${item.isChecked ? 'bg-amber-500 border-amber-500' : 'border-zinc-500'}`}>
                    {item.isChecked && <div className="w-2 h-2 rounded-sm bg-zinc-900"/>}
                </div>
            </button>
            <div className="flex-grow cursor-pointer" onClick={() => onToggle(item)}>
                <span className={` ${item.isChecked ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>{item.name}</span>
                <div className="text-xs text-zinc-400">
                    <span>({item.quantity.toFixed(1).replace(/\.0$/, '')} {item.unit})</span>
                    {recipeName && <span className="italic ml-2">für: {recipeName}</span>}
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onStartEdit(item)} className="p-1 text-zinc-400 hover:text-amber-400"><Edit3 size={14}/></button>
                <button onClick={() => onDeleteItem(item.id!)} className="p-1 text-zinc-400 hover:text-red-400"><Trash2 size={14}/></button>
            </div>
        </li>
    );
});


interface ShoppingListProps {
    focusAction?: string | null;
    onActionHandled?: () => void;
    triggerCheckItem?: string;
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ focusAction, onActionHandled, triggerCheckItem, addToast }) => {
  const shoppingList: ShoppingListItem[] | undefined = useLiveQuery(() => db.shoppingList.toArray(), []);
  // FIX: Use nullish coalescing operator to ensure pantryItems is always an array,
  // preventing type errors when passed to generateShoppingList.
  const pantryItems = useLiveQuery(() => db.pantry.toArray(), []) ?? [];
  const recipes: Recipe[] | undefined = useLiveQuery(() => db.recipes.toArray(), []);
  const allMealPlans: MealPlanItem[] | undefined = useLiveQuery(() => db.mealPlan.toArray(), []);

  const [isGenerating, setIsGenerating] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
  const [isAiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [isCompletedVisible, setIsCompletedVisible] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);

  const addItemInputRef = useRef<HTMLInputElement>(null);

  const recipesById = useMemo(() => new Map(recipes?.map(r => [r.id, r])), [recipes]);

  const upcomingUncookedMeals = useMemo(() => {
      if (!allMealPlans) return [];
      const today = new Date().toISOString().split('T')[0];
      const futureLimit = new Date();
      futureLimit.setDate(futureLimit.getDate() + 14);
      const futureLimitStr = futureLimit.toISOString().split('T')[0];

      return allMealPlans
          .filter(meal => !meal.isCooked && meal.date >= today && meal.date <= futureLimitStr)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allMealPlans]);


  const generateList = async (selectedMealIds: number[]) => {
    setIsGenerating(true);
    setGenerateModalOpen(false);
    
    const existingItems = await db.shoppingList.toArray();
    const existingItemsSet = new Set(existingItems.map(i => i.name.toLowerCase()));

    const plannedMeals = await db.mealPlan.where('id').anyOf(selectedMealIds).toArray();
    const recipeIds = [...new Set(plannedMeals.map(m => m.recipeId))];
    if (recipeIds.length === 0) {
        setIsGenerating(false);
        addToast('Keine Mahlzeiten zum Generieren ausgewählt.', 'info');
        return;
    }
    
    const recipesToCook = await db.recipes.where('id').anyOf(recipeIds).toArray();
    const pantry = await db.pantry.toArray();
    const pantryMap = new Map<string, number>(pantry.map(p => [p.name.toLowerCase(), p.quantity]));

    const requiredItems = new Map<string, Omit<ShoppingListItem, 'id' | 'isChecked'> & { recipeIds: Set<number> }>();

    recipesToCook.forEach(recipe => {
        const planOccurrences = plannedMeals.filter(m => m.recipeId === recipe.id).length;
        recipe.ingredients.forEach(group => {
            group.items.forEach(item => {
                if(existingItemsSet.has(item.name.toLowerCase())) return;
                const requiredQty = (parseFloat(item.quantity) || 1) * planOccurrences;
                const pantryQty = pantryMap.get(item.name.toLowerCase()) || 0;
                const neededQty = requiredQty - pantryQty;

                if (neededQty > 0) {
                    const key = `${item.name.toLowerCase()}-${item.unit.toLowerCase()}`;
                    const existing = requiredItems.get(key);
                    if(existing){
                        existing.quantity += neededQty;
                        existing.recipeIds.add(recipe.id!);
                    } else {
                        requiredItems.set(key, {name: item.name, quantity: neededQty, unit: item.unit, recipeIds: new Set([recipe.id!])});
                    }
                }
            })
        })
    });
    
    const itemsToAdd = Array.from(requiredItems.values()).map(item => ({...item, isChecked: false, recipeId: Array.from(item.recipeIds)[0]}));

    if(itemsToAdd.length > 0) {
        await db.shoppingList.bulkAdd(itemsToAdd as ShoppingListItem[]);
        addToast(`${itemsToAdd.length} Artikel wurden zur Liste hinzugefügt.`, 'success');
    } else {
        addToast('Dein Vorrat deckt alle geplanten Mahlzeiten ab. Nichts hinzuzufügen!', 'info');
    }
    
    setIsGenerating(false);
  };
  
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || !pantryItems) return;
    setIsAiGenerating(true);
    try {
        const generatedItems = await generateShoppingList(aiPrompt, pantryItems);
        const existingItemsSet = new Set(shoppingList?.map(i => i.name.toLowerCase()));
        
        const newItems = generatedItems
            .filter(item => !existingItemsSet.has(item.name.toLowerCase()))
            .map(item => ({...item, isChecked: false }));

        if (newItems.length > 0) {
            await db.shoppingList.bulkAdd(newItems as ShoppingListItem[]);
            addToast(`${newItems.length} Artikel von der KI zur Liste hinzugefügt.`, 'success');
        } else {
            addToast('Die KI hat keine neuen Artikel gefunden, die hinzugefügt werden müssen.', 'info');
        }
        setAiModalOpen(false);
        setAiPrompt('');
    } catch (error) {
        addToast('Fehler bei der KI-Generierung.', 'error');
    } finally {
        setIsAiGenerating(false);
    }
  }

  const handleClearCompleted = async () => {
    const idsToDelete = shoppingList?.filter(i => i.isChecked).map(i => i.id!) || [];
    if (idsToDelete.length > 0) {
        if(window.confirm(`${idsToDelete.length} erledigte Artikel wirklich entfernen?`)) {
            await db.shoppingList.bulkDelete(idsToDelete);
            addToast(`${idsToDelete.length} erledigte Artikel entfernt.`)
        }
    }
  }
  
  const handleCheckItemByVoice = useCallback((itemName: string) => {
    const item = shoppingList?.find(i => i.name.toLowerCase() === itemName.toLowerCase() && !i.isChecked);
    if(item) {
        handleToggle(item);
        addToast(`"${item.name}" abgehakt.`);
    } else {
        addToast(`"${itemName}" nicht auf der Liste gefunden.`, 'error');
    }
  }, [shoppingList, addToast]);
  
  useEffect(() => {
    if(triggerCheckItem) {
        handleCheckItemByVoice(triggerCheckItem);
    }
  }, [triggerCheckItem, handleCheckItemByVoice]);


  useEffect(() => {
    if (focusAction) {
        switch(focusAction) {
            case 'addItem': addItemInputRef.current?.focus(); break;
            case 'generate': setGenerateModalOpen(true); break;
            case 'clear':
                clearShoppingList();
                break;
        }
        onActionHandled?.();
    }
  }, [focusAction, onActionHandled]);

  const handleToggle = useCallback(async (item: ShoppingListItem) => {
    await updateShoppingListItem({...item, isChecked: !item.isChecked });
  }, []);
  
  const handleAddItem = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newItemName.trim()) return;
      await addShoppingListItem({name: newItemName, quantity: 1, unit: 'Stk.', isChecked: false});
      setNewItemName('');
  }

  const handleStartEdit = useCallback((item: ShoppingListItem) => setEditingItem({ ...item }), []);
  const handleCancelEdit = useCallback(() => setEditingItem(null), []);
  const handleSaveEdit = useCallback(async () => {
    if (editingItem && editingItem.id) {
        await db.shoppingList.update(editingItem.id, editingItem);
        setEditingItem(null);
    }
  }, [editingItem]);
  const handleDeleteItem = useCallback((id: number) => db.shoppingList.delete(id), []);

  const activeItems = useMemo(() => shoppingList?.filter(item => !item.isChecked) || [], [shoppingList]);
  const completedItems = useMemo(() => shoppingList?.filter(item => item.isChecked) || [], [shoppingList]);
  
  const groupedList = useMemo(() => activeItems.reduce((acc, item) => {
    const category = getCategoryForItem(item.name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>), [activeItems]);
  
  const renderList = (items: ShoppingListItem[]) => items.map(item => (
      <ShoppingListItemComponent
        key={item.id}
        item={item}
        isEditing={editingItem?.id === item.id}
        editingItem={editingItem}
        recipeName={item.recipeId ? recipesById.get(item.recipeId)?.recipeTitle ?? null : null}
        onToggle={handleToggle}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
        setEditingItem={setEditingItem}
        onDeleteItem={handleDeleteItem}
      />
  ));

  return (
    <div className="space-y-8">
      <GenerateListModal isOpen={isGenerateModalOpen} onClose={() => setGenerateModalOpen(false)} onGenerate={generateList} mealPlan={upcomingUncookedMeals} recipesById={recipesById} />
       {isAiModalOpen && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 page-fade-in" onClick={() => setAiModalOpen(false)}>
                 <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                     <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Bot /> KI-gestützte Einkaufsliste</h3>
                     <p className="text-zinc-400 text-sm mb-4">Beschreibe, wofür du einkaufen möchtest, und die KI erstellt eine Liste. Dein Vorrat wird dabei berücksichtigt.</p>
                     <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="z.B. eine Einkaufsliste für eine Grillparty für 10 Personen, oder Grundausstattung für eine Woche..." className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 h-24 focus:ring-2 focus:ring-amber-500" />
                     <div className="flex justify-end gap-3 pt-4">
                         <button onClick={() => setAiModalOpen(false)} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                         <button onClick={handleAiGenerate} disabled={!aiPrompt.trim() || isAiGenerating} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 disabled:bg-zinc-600 disabled:cursor-not-allowed flex items-center gap-2">
                             {isAiGenerating ? <><LoaderCircle size={18} className="animate-spin" /> Generiere...</> : 'Generieren'}
                         </button>
                     </div>
                 </div>
            </div>
       )}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Einkaufsliste</h2>
        <p className="text-zinc-400 mt-1">Generiere eine Liste aus deinem Essensplan oder füge Artikel manuell hinzu.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => setGenerateModalOpen(true)} disabled={isGenerating} className="flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors disabled:bg-zinc-800">
              {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              Aus Plan generieren
          </button>
          <button onClick={() => setAiModalOpen(true)} className="flex items-center justify-center gap-2 bg-amber-500 text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400 transition-colors">
              <Bot size={18} /> KI-Liste generieren
          </button>
          <div className="relative">
             <button onClick={() => setExportOpen(!isExportOpen)} disabled={!shoppingList || shoppingList.length === 0} className="w-full flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500">
                <FileDown size={18}/> Exportieren <ChevronDown size={16} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
            </button>
            {isExportOpen && (
                <div className="absolute top-full mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10">
                    <a onClick={() => { exportShoppingListToPdf(shoppingList || []); setExportOpen(false); }} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">PDF</a>
                    <a onClick={() => { exportShoppingListToCsv(shoppingList || []); setExportOpen(false); }} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">CSV</a>
                    <a onClick={() => { exportShoppingListToMarkdown(shoppingList || []); setExportOpen(false); }} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">Markdown</a>
                    <a onClick={() => { exportShoppingListToTxt(shoppingList || []); setExportOpen(false); }} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">Text</a>
                </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleClearCompleted} disabled={completedItems.length === 0} className="w-1/2 flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-2 rounded-md hover:bg-zinc-600 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500" title="Erledigte entfernen">
                <CheckCircle size={18}/>
            </button>
            <button onClick={() => clearShoppingList()} disabled={!shoppingList || shoppingList.length === 0} className="w-1/2 flex items-center justify-center gap-2 bg-red-900/80 text-white font-bold py-2 px-2 rounded-md hover:bg-red-800 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500" title="Komplette Liste leeren">
                <Trash2 size={18}/>
            </button>
           </div>
      </div>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 sm:p-6 space-y-6">
          <form onSubmit={handleAddItem} className="flex gap-4">
              <input ref={addItemInputRef} type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Artikel manuell hinzufügen..." className="flex-grow bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"/>
              <button type="submit" className="flex-shrink-0 flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors">
                  <Plus size={18}/> Hinzufügen
              </button>
          </form>

          {shoppingList && shoppingList.length > 0 ? (
              <div className="space-y-4">
                  {Object.entries(groupedList).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]) => (
                      <div key={category}>
                          <h3 className="font-bold text-amber-400 mb-2">{category}</h3>
                          <ul className="space-y-1">{renderList(items)}</ul>
                      </div>
                  ))}
                  {completedItems.length > 0 && (
                      <div className="pt-4 border-t border-zinc-700">
                          <button onClick={() => setIsCompletedVisible(!isCompletedVisible)} className="w-full flex justify-between items-center text-lg font-semibold text-zinc-400 hover:text-white">
                              <span>Erledigt ({completedItems.length})</span>
                              {isCompletedVisible ? <ChevronUp/> : <ChevronDown/>}
                          </button>
                          {isCompletedVisible && (
                              <ul className="mt-2 space-y-1 page-fade-in">{renderList(completedItems)}</ul>
                          )}
                      </div>
                  )}
              </div>
          ) : (
             <div className="text-center py-20">
                <ClipboardList className="mx-auto h-12 w-12 text-zinc-600" />
                <h3 className="mt-4 text-lg font-medium text-zinc-300">Deine Einkaufsliste ist leer</h3>
                <p className="mt-1 text-sm text-zinc-500">
                    Generiere eine Liste aus deinem Essensplan oder füge manuell Artikel hinzu.
                </p>
             </div>
          )}
      </div>
    </div>
  );
};

export default ShoppingList;
