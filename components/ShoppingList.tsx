import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateShoppingListItem, clearShoppingList, addShoppingListItem, moveCheckedToPantry } from '@/services/db';
import { ShoppingListItem, Recipe, PantryItem } from '@/types';
import { Trash2, FileDown, Plus, ClipboardList, CheckCircle, Info, Edit3, X, Save, ChevronDown, ChevronUp, Bot, LoaderCircle, Archive, Send } from 'lucide-react';
import { exportShoppingListToCsv, exportShoppingListToPdf, exportShoppingListToMarkdown, exportShoppingListToTxt } from '@/services/exportService';
import { generateShoppingList } from '@/services/geminiService';
import { getCategoryForItem, parseShoppingItemString } from '@/services/utils';

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
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveEdit();
    };

    if (isEditing) {
        return (
            <li className="p-2 bg-zinc-800 rounded-md">
                <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                  <input type="text" value={editingItem!.name} onChange={e => setEditingItem({...editingItem!, name: e.target.value})} className="flex-grow bg-zinc-700 rounded p-1 focus:ring-1 focus:ring-amber-500" autoFocus/>
                  <input type="number" value={editingItem!.quantity} onChange={e => setEditingItem({...editingItem!, quantity: parseFloat(e.target.value) || 0})} className="w-16 bg-zinc-700 rounded p-1 focus:ring-1 focus:ring-amber-500" />
                  <input type="text" value={editingItem!.unit} onChange={e => setEditingItem({...editingItem!, unit: e.target.value})} className="w-20 bg-zinc-700 rounded p-1 focus:ring-1 focus:ring-amber-500" />
                  <button type="submit" className="p-2 rounded bg-amber-500 hover:bg-amber-400 text-zinc-900"><Save size={16}/></button>
                  <button type="button" onClick={onCancelEdit} className="p-2 rounded bg-zinc-600 hover:bg-zinc-500"><X size={16}/></button>
                </form>
            </li>
        );
    }

    return (
        <li className="flex items-start gap-3 p-2 rounded-md group hover:bg-zinc-800/50 transition-colors">
            <button onClick={() => onToggle(item)} className="mt-1" aria-label={`Mark ${item.name} as ${item.isChecked ? 'incomplete' : 'complete'}`}>
                {item.isChecked ? <CheckCircle className="text-amber-500"/> : <div className="w-5 h-5 rounded-full border-2 border-zinc-500 group-hover:border-amber-500 transition-colors"/>}
            </button>
            <div className="flex-grow cursor-pointer" onClick={() => onToggle(item)}>
                <span className={` ${item.isChecked ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>{item.name}</span>
                <div className="text-xs text-zinc-400">
                    <span>({item.quantity.toFixed(1).replace(/\.0$/, '')} {item.unit})</span>
                    {recipeName && <span className="italic ml-2">für: {recipeName}</span>}
                </div>
            </div>
            {!item.isChecked && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onStartEdit(item)} className="p-1 text-zinc-400 hover:text-amber-400"><Edit3 size={14}/></button>
                    <button onClick={() => onDeleteItem(item.id!)} className="p-1 text-zinc-400 hover:text-red-400"><Trash2 size={14}/></button>
                </div>
            )}
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
  const pantryItems: PantryItem[] = useLiveQuery(() => db.pantry.toArray(), []) ?? [];
  const recipes: Recipe[] | undefined = useLiveQuery(() => db.recipes.toArray(), []);

  const [quickAddItem, setQuickAddItem] = useState('');
  const [isAiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [isCompletedVisible, setIsCompletedVisible] = useState(true);
  const [isExportOpen, setExportOpen] = useState(false);

  const addItemInputRef = useRef<HTMLInputElement>(null);
  const recipesById = useMemo(() => {
    const recipeMap = new Map<number, Recipe>();
    if (recipes) {
        for (const recipe of recipes) {
            if (recipe.id) {
                recipeMap.set(recipe.id, recipe);
            }
        }
    }
    return recipeMap;
  }, [recipes]);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
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
    if(triggerCheckItem) handleCheckItemByVoice(triggerCheckItem);
  }, [triggerCheckItem, handleCheckItemByVoice]);

  useEffect(() => {
    if (focusAction) {
        if (focusAction === 'addItem') addItemInputRef.current?.focus();
        else if (focusAction === 'clear') clearShoppingList();
        onActionHandled?.();
    }
  }, [focusAction, onActionHandled]);

  const handleToggle = useCallback(async (item: ShoppingListItem) => {
    await updateShoppingListItem({...item, isChecked: !item.isChecked });
  }, []);
  
  const handleQuickAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!quickAddItem.trim()) return;
      const parsed = parseShoppingItemString(quickAddItem);
      await addShoppingListItem({...parsed, isChecked: false});
      setQuickAddItem('');
  }

  const handleStartEdit = useCallback((item: ShoppingListItem) => setEditingItem({ ...item }), []);
  const handleCancelEdit = useCallback(() => setEditingItem(null), []);
  const handleSaveEdit = useCallback(async () => {
    if (editingItem && editingItem.id) {
        await db.shoppingList.update(editingItem.id, editingItem);
        setEditingItem(null);
    }
  }, [editingItem]);
  const handleDeleteItem = useCallback(async (id: number) => {
    if(window.confirm("Soll dieser Artikel wirklich gelöscht werden?")) {
        await db.shoppingList.delete(id)
    }
  }, []);

  const handleMoveToPantry = async () => {
    const checkedCount = completedItems.length;
    if (checkedCount === 0) return;
    if (window.confirm(`${checkedCount} gekaufte Artikel in den Vorrat verschieben?`)) {
        const movedCount = await moveCheckedToPantry();
        addToast(`${movedCount} Artikel in den Vorrat verschoben.`, 'success');
    }
  }

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
        key={item.id} item={item} isEditing={editingItem?.id === item.id}
        editingItem={editingItem} recipeName={item.recipeId ? recipesById.get(item.recipeId)?.recipeTitle ?? null : null}
        onToggle={handleToggle} onStartEdit={handleStartEdit} onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit} setEditingItem={setEditingItem} onDeleteItem={handleDeleteItem}
      />
  ));

  const progress = shoppingList?.length ? (completedItems.length / shoppingList.length) * 100 : 0;

  return (
    <div className="space-y-8 pb-24">
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
        <p className="text-zinc-400 mt-1">Verwalte deine Einkäufe und übertrage sie mit einem Klick in den Vorrat.</p>
      </div>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 space-y-4">
          <div>
              <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-zinc-400">Fortschritt</span>
                  <span className="text-sm font-bold text-zinc-200">{completedItems.length} / {shoppingList?.length || 0}</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2.5">
                  <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
              </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
             <button onClick={() => setAiModalOpen(true)} className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-amber-500 text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400 transition-colors text-sm">
                <Bot size={16} /> KI-Liste
            </button>
            <div className="relative">
                <button onClick={() => setExportOpen(!isExportOpen)} disabled={!shoppingList || shoppingList.length === 0} className="w-full flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 text-sm">
                    <FileDown size={16}/> Exportieren <ChevronDown size={16} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                </button>
                {isExportOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10">
                        <a onClick={() => { exportShoppingListToPdf(shoppingList || []); setExportOpen(false); }} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">PDF</a>
                        <a onClick={() => { exportShoppingListToCsv(shoppingList || []); setExportOpen(false); }} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">CSV</a>
                    </div>
                )}
            </div>
            <button onClick={() => clearShoppingList()} disabled={!shoppingList || shoppingList.length === 0} className="flex items-center justify-center gap-2 bg-red-900/80 text-white font-bold py-2 px-4 rounded-md hover:bg-red-800 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 text-sm">
                <Trash2 size={16}/> Leeren
            </button>
           </div>
      </div>

      <div className="space-y-6">
          {shoppingList && shoppingList.length > 0 ? (
              <>
                  {Object.entries(groupedList).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]) => (
                      <div key={category}>
                          <h3 className="font-bold text-amber-400 mb-2 border-b border-zinc-700 pb-1">{category}</h3>
                          <ul className="space-y-1">{renderList(items)}</ul>
                      </div>
                  ))}
                  {completedItems.length > 0 && (
                      <div className="pt-4 border-t border-zinc-700/50">
                          <button onClick={() => setIsCompletedVisible(!isCompletedVisible)} className="w-full flex justify-between items-center text-lg font-semibold text-zinc-400 hover:text-white">
                              <span>Erledigt ({completedItems.length})</span>
                              {isCompletedVisible ? <ChevronUp/> : <ChevronDown/>}
                          </button>
                          {isCompletedVisible && (
                              <ul className="mt-2 space-y-1 page-fade-in">{renderList(completedItems)}</ul>
                          )}
                      </div>
                  )}
              </>
          ) : (
             <div className="text-center py-20 bg-zinc-950/50 border border-dashed border-zinc-700 rounded-lg">
                <ClipboardList className="mx-auto h-12 w-12 text-zinc-600" />
                <h3 className="mt-4 text-lg font-medium text-zinc-300">Deine Einkaufsliste ist leer</h3>
                <p className="mt-1 text-sm text-zinc-500">
                    Füge Artikel mit der Leiste unten hinzu oder nutze die KI.
                </p>
             </div>
          )}
      </div>

       <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-800 p-3 z-30">
            <div className="max-w-4xl mx-auto px-4">
                {completedItems.length > 0 ? (
                    <button onClick={handleMoveToPantry} className="w-full flex items-center justify-center gap-3 bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-500 transition-colors shadow-lg">
                        <Archive size={20}/>
                        <span>{completedItems.length} gekaufte Artikel in den Vorrat verschieben</span>
                    </button>
                ) : (
                    <form onSubmit={handleQuickAdd} className="flex items-center gap-2 bg-zinc-800 rounded-md p-1 border border-zinc-700 focus-within:ring-2 focus-within:ring-amber-500">
                         <Plus className="text-zinc-500 ml-2"/>
                         <input ref={addItemInputRef} type="text" value={quickAddItem} onChange={e => setQuickAddItem(e.target.value)} placeholder="z.B. 2l Milch, Eier, Brot..." className="flex-grow bg-transparent focus:outline-none p-2"/>
                         <button type="submit" className="flex-shrink-0 flex items-center justify-center bg-amber-500 text-zinc-900 font-bold p-2 rounded-md hover:bg-amber-400 transition-colors" aria-label="Artikel hinzufügen">
                             <Send size={18}/>
                         </button>
                    </form>
                )}
            </div>
        </div>
    </div>
  );
};

export default ShoppingList;