import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateShoppingListItem, clearShoppingList, addShoppingListItem, moveCheckedToPantry, renameShoppingListCategory, batchAddShoppingListItems, generateListFromMealPlan } from '@/services/db';
import { ShoppingListItem, Recipe, PantryItem } from '@/types';
import { Trash2, FileDown, Plus, CheckCircle, Edit3, X, Save, ChevronDown, Bot, LoaderCircle, Archive, Send, GripVertical, TextQuote, ListCollapse, ListTree, RefreshCw, ArrowLeft, CheckSquare, Square, ShoppingCart } from 'lucide-react';
import { exportShoppingListToCsv, exportShoppingListToPdf, exportShoppingListToMarkdown, exportShoppingListToTxt, exportShoppingListToJson } from '@/services/exportService';
import { generateShoppingList } from '@/services/geminiService';
import { parseShoppingItemString } from '@/services/utils';

// #region Modals
const AiModal = ({ isOpen, onClose, onAdd, pantryItems, currentListItems }: { isOpen: boolean, onClose: () => void, onAdd: (items: Omit<ShoppingListItem, 'id' | 'isChecked' | 'category' | 'sortOrder'>[]) => void, pantryItems: PantryItem[], currentListItems: ShoppingListItem[] }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [reviewItems, setReviewItems] = useState<Omit<ShoppingListItem, 'id' | 'isChecked' | 'sortOrder'>[] | null>(null);
    const [selectedItems, setSelectedItems] = useState<Map<string, boolean>>(new Map());

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        try {
            const items = await generateShoppingList(prompt, pantryItems, currentListItems);
            setReviewItems(items);
            setSelectedItems(new Map(items.map(item => [item.name, true])));
        } catch (err: any) {
             setError(err.message || 'Liste konnte nicht generiert werden. Bitte versuche es erneut.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleItem = (itemName: string) => {
        const newSelected = new Map(selectedItems);
        newSelected.set(itemName, !newSelected.get(itemName));
        setSelectedItems(newSelected);
    };

    const handleAddSelected = () => {
        if (!reviewItems) return;
        const itemsToAdd = reviewItems.filter(item => selectedItems.get(item.name));
        onAdd(itemsToAdd.map(({ category, ...rest }) => rest));
        handleClose();
    };
    
    const handleClose = () => {
        setPrompt('');
        setIsLoading(false);
        setError('');
        setReviewItems(null);
        setSelectedItems(new Map());
        onClose();
    }

    if (!isOpen) return null;

    const selectedCount = Array.from(selectedItems.values()).filter(Boolean).length;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 page-fade-in" onClick={handleClose}>
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Bot /> KI-gestützte Einkaufsliste</h3>
                {!reviewItems ? (
                    <>
                        <p className="text-zinc-400 text-sm mb-4">Beschreibe, was du vorhast (z.B. "Grillparty für 6 Personen" oder "Zutaten für Lasagne"), und die KI erstellt eine passende Einkaufsliste für dich. Dein aktueller Vorrat wird dabei berücksichtigt.</p>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="z.B. Zutaten für einen Schokoladenkuchen..." className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 h-24 focus:ring-2 focus:ring-amber-500" />
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={handleClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                            <button onClick={handleGenerate} disabled={!prompt.trim() || isLoading} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 disabled:bg-zinc-600 flex items-center gap-2">
                                {isLoading ? <><LoaderCircle size={18} className="animate-spin"/> Generiere...</> : 'Liste erstellen'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-zinc-400 text-sm mb-4">Überprüfe die Vorschläge der KI. Entferne Artikel, die du nicht benötigst.</p>
                        <div className="bg-zinc-900 rounded-md p-2 max-h-60 overflow-y-auto border border-zinc-700 space-y-1">
                            {reviewItems.map(item => (
                                <div key={item.name} onClick={() => handleToggleItem(item.name)} className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-zinc-800">
                                    {selectedItems.get(item.name) ? <CheckSquare className="text-amber-400"/> : <Square className="text-zinc-500"/>}
                                    <span className="flex-grow">{item.name}</span>
                                    <span className="text-zinc-400 text-sm">({item.quantity} {item.unit})</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center gap-3 pt-4">
                            <button type="button" onClick={() => setReviewItems(null)} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"><ArrowLeft size={16} /> Zurück</button>
                            <button onClick={handleAddSelected} disabled={selectedCount === 0} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 disabled:bg-zinc-600 flex items-center gap-2">
                                {selectedCount} Artikel hinzufügen
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const BulkAddModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (items: Omit<ShoppingListItem, 'id' | 'isChecked' | 'sortOrder' | 'category'>[]) => void }) => {
    const [text, setText] = useState('');
    const [parsedItems, setParsedItems] = useState<Omit<ShoppingListItem, 'id' | 'isChecked' | 'sortOrder' | 'category'>[]>([]);
    const [isParsed, setIsParsed] = useState(false);

    const handleParse = () => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const items = lines.map(line => parseShoppingItemString(line));
        setParsedItems(items);
        setIsParsed(true);
    };

    const handleAdd = () => {
        onAdd(parsedItems);
        handleClose();
    };

    const handleClose = () => {
        setText(''); setParsedItems([]); setIsParsed(false); onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 page-fade-in" onClick={handleClose}>
             <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><TextQuote /> Liste einfügen</h3>
                 {!isParsed ? (
                     <>
                        <p className="text-zinc-400 text-sm mb-4">Füge eine Liste von Zutaten ein, einen Artikel pro Zeile. Mengen und Einheiten werden automatisch erkannt.</p>
                        <textarea value={text} onChange={e => setText(e.target.value)} placeholder={"250g Mehl\n1 Prise Salz\nEier"} className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 h-40 focus:ring-2 focus:ring-amber-500" />
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={handleClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                            <button onClick={handleParse} disabled={!text.trim()} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 disabled:bg-zinc-600">Analysieren</button>
                        </div>
                     </>
                 ) : (
                    <>
                        <p className="text-zinc-400 text-sm mb-4">Überprüfe die erkannten Artikel. Du kannst sie nach dem Hinzufügen noch bearbeiten.</p>
                        <div className="bg-zinc-900 rounded-md p-2 max-h-48 overflow-y-auto border border-zinc-700">
                            <ul>{parsedItems.map((item, i) => <li key={i} className="text-sm p-1"><b>{item.name}</b> ({item.quantity} {item.unit})</li>)}</ul>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setIsParsed(false)} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Zurück</button>
                            <button onClick={handleAdd} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400">Zur Liste hinzufügen</button>
                        </div>
                    </>
                 )}
             </div>
        </div>
    );
};
// #endregion Modals

// #region Sub-components
const ShoppingListItemComponent = React.memo<{
    item: ShoppingListItem;
    isEditing: boolean;
    editingItem: ShoppingListItem | null;
    recipeName: string | null;
    isDragged: boolean;
    dropTargetId: number | null;
    onToggle: (item: ShoppingListItem) => void;
    onStartEdit: (item: ShoppingListItem) => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    setEditingItem: React.Dispatch<React.SetStateAction<ShoppingListItem | null>>;
    onDeleteItem: (id: number) => void;
    onDragStart: (e: React.DragEvent, item: ShoppingListItem) => void;
    onDragOver: (e: React.DragEvent, item: ShoppingListItem) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, item: ShoppingListItem) => void;
    onDragEnd: (e: React.DragEvent) => void;
}>(({ item, isEditing, editingItem, recipeName, isDragged, dropTargetId, onToggle, onStartEdit, onCancelEdit, onSaveEdit, setEditingItem, onDeleteItem, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd }) => {
    
    if (isEditing) {
        return (
            <li className="p-2 bg-zinc-800 rounded-md ring-2 ring-amber-500">
                <form onSubmit={e => { e.preventDefault(); onSaveEdit(); }} className="flex items-center gap-2">
                  <input type="text" value={editingItem!.name} onChange={e => setEditingItem({...editingItem!, name: e.target.value})} className="flex-grow bg-zinc-700 rounded p-1" autoFocus/>
                  <input type="number" value={editingItem!.quantity} onChange={e => setEditingItem({...editingItem!, quantity: parseFloat(e.target.value) || 0})} className="w-16 bg-zinc-700 rounded p-1" />
                  <input type="text" value={editingItem!.unit} onChange={e => setEditingItem({...editingItem!, unit: e.target.value})} className="w-20 bg-zinc-700 rounded p-1" />
                  <button type="submit" className="p-2 rounded bg-amber-500 hover:bg-amber-400 text-zinc-900"><Save size={16}/></button>
                  <button type="button" onClick={onCancelEdit} className="p-2 rounded bg-zinc-600 hover:bg-zinc-500"><X size={16}/></button>
                </form>
            </li>
        );
    }

    return (
        <li
            draggable={!item.isChecked}
            onDragStart={e => onDragStart(e, item)}
            onDragOver={e => onDragOver(e, item)}
            onDragLeave={onDragLeave}
            onDrop={e => onDrop(e, item)}
            onDragEnd={onDragEnd}
            className={`transition-opacity duration-200 relative`}
        >
            {dropTargetId === item.id && <div className="absolute -top-1 left-0 right-0 h-1.5 bg-amber-400 rounded-full" />}
            <div className={`flex items-start gap-3 p-2 rounded-md group ${isDragged ? 'opacity-30' : ''} ${!item.isChecked ? 'hover:bg-zinc-800/50' : ''}`}>
                {!item.isChecked && <GripVertical className="text-zinc-600 cursor-grab touch-none mt-1" size={18} />}
                <button onClick={() => onToggle(item)} className="mt-0.5" aria-label={`Mark ${item.name} as ${item.isChecked ? 'incomplete' : 'complete'}`}>
                    {item.isChecked ? <CheckCircle className="text-amber-500"/> : <div className="w-5 h-5 rounded-full border-2 border-zinc-500 group-hover:border-amber-500 transition-colors"/>}
                </button>
                <div className="flex-grow cursor-pointer" onClick={() => onToggle(item)}>
                    <span className={` ${item.isChecked ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>{item.name}</span>
                    <div className="text-xs text-zinc-400">
                        <span>({(item.quantity || 0).toFixed(1).replace(/\.0$/, '')} {item.unit})</span>
                        {recipeName && <span className="italic ml-2 text-amber-500">für: {recipeName}</span>}
                    </div>
                </div>
                {!item.isChecked && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onStartEdit(item)} className="p-1 text-zinc-400 hover:text-amber-400"><Edit3 size={14}/></button>
                        <button onClick={() => onDeleteItem(item.id!)} className="p-1 text-zinc-400 hover:text-red-400"><Trash2 size={14}/></button>
                    </div>
                )}
            </div>
        </li>
    );
});

// #endregion Sub-components

interface ShoppingListProps {
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    triggerCheckItem?: string;
    focusAction?: string | null;
    onActionHandled?: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ addToast, triggerCheckItem, focusAction, onActionHandled }) => {
  // FIX: Added generics to useLiveQuery and used ?? [] to ensure variables are always arrays.
  const shoppingList: ShoppingListItem[] = useLiveQuery<ShoppingListItem[]>(() => db.shoppingList.orderBy(['category', 'sortOrder']).toArray()) ?? [];
  const pantryItems: PantryItem[] = useLiveQuery<PantryItem[]>(() => db.pantry.toArray()) ?? [];
  const recipes: Recipe[] = useLiveQuery<Recipe[]>(() => db.recipes.toArray()) ?? [];

  const [quickAddItem, setQuickAddItem] = useState('');
  const [isAiModalOpen, setAiModalOpen] = useState(false);
  const [isBulkAddModalOpen, setBulkAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);
  const [isCompletedVisible, setIsCompletedVisible] = useState(true);
  const [isExportOpen, setExportOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<ShoppingListItem | null>(null);
  const [dropTargetInfo, setDropTargetInfo] = useState<{ itemId?: number; category: string } | null>(null);

  const addItemInputRef = useRef<HTMLInputElement>(null);
  const recipesById = useMemo(() => new Map<number, Recipe>((recipes || []).map(r => [r.id!, r])), [recipes]);

  const handleToggle = useCallback(async (item: ShoppingListItem) => {
    await updateShoppingListItem({...item, isChecked: !item.isChecked });
  }, []);

  const handleClearList = async () => {
    if (window.confirm('Möchtest du die Einkaufsliste wirklich komplett leeren?')) {
        const count = await clearShoppingList();
        if (count > 0) addToast('Liste geleert.');
    }
  };

  useEffect(() => {
    if (focusAction) {
        if(focusAction === 'addItem' && addItemInputRef.current) addItemInputRef.current.focus();
        if(focusAction === 'generate') handleGenerateFromPlan();
        if(focusAction === 'clear') handleClearList();
        onActionHandled?.();
    }
  }, [focusAction, onActionHandled]);

  useEffect(() => {
    if (triggerCheckItem && shoppingList) {
        const itemNameToFind = triggerCheckItem.split('#')[0].toLowerCase();
        const itemToToggle = shoppingList.find(
            (item) => item.name.toLowerCase() === itemNameToFind && !item.isChecked
        );
        if (itemToToggle) {
            handleToggle(itemToToggle);
            addToast(`"${itemToToggle.name}" abgehakt.`);
        } else {
            addToast(`Artikel "${triggerCheckItem.split('#')[0]}" nicht auf der Liste gefunden oder bereits erledigt.`, 'info');
        }
    }
  }, [triggerCheckItem, shoppingList, handleToggle, addToast]);

  const handleQuickAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!quickAddItem.trim()) return;
      const parsed = parseShoppingItemString(quickAddItem);
      const { status } = await addShoppingListItem({...parsed, isChecked: false});
      if(status === 'updated') {
        addToast(`Menge für "${parsed.name}" aktualisiert.`);
      }
      setQuickAddItem('');
  };

  const handleAiAdd = useCallback(async (items: Omit<ShoppingListItem, 'id' | 'isChecked' | 'sortOrder' | 'category'>[]) => {
      const { added, updated } = await batchAddShoppingListItems(items);
      addToast(`${added} Artikel von KI hinzugefügt, ${updated} aktualisiert.`, 'success');
  }, [addToast]);

  const handleBulkAdd = useCallback(async (items: Omit<ShoppingListItem, 'id'|'isChecked'|'sortOrder'|'category'>[]) => {
    const { added, updated } = await batchAddShoppingListItems(items);
    addToast(`${added} Artikel hinzugefügt, ${updated} aktualisiert.`, 'success');
  }, [addToast]);
  
  const handleGenerateFromPlan = useCallback(async () => {
    setIsGenerating(true);
    try {
        const { added, existing } = await generateListFromMealPlan();
        if(added === 0 && existing === 0) {
            addToast("Keine fehlenden Zutaten im Essensplan gefunden.", "info");
        } else {
            addToast(`${added} neue(r) Artikel hinzugefügt, ${existing} bereits auf der Liste.`, 'success');
        }
    } catch (e) {
        addToast("Fehler beim Generieren der Liste aus dem Plan.", "error");
    } finally {
        setIsGenerating(false);
    }
  }, [addToast]);

  const handleRenameCategory = useCallback(async () => {
    if (!editingCategory || !editingCategory.newName.trim() || editingCategory.newName === editingCategory.oldName) {
        setEditingCategory(null);
        return;
    }
    try {
        await renameShoppingListCategory(editingCategory.oldName, editingCategory.newName.trim());
        addToast(`Kategorie umbenannt in "${editingCategory.newName.trim()}".`);
    } catch (error) { addToast("Fehler beim Umbenennen.", "error"); }
    setEditingCategory(null);
  }, [editingCategory, addToast]);

  const handleToggleCategoryCollapse = useCallback((category: string) => {
    setCollapsedCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(category)) newSet.delete(category);
        else newSet.add(category);
        return newSet;
    });
  }, []);
  
  const collapseAll = useCallback(() => {
    if(!shoppingList) return;
    // FIX: Add explicit type to map parameter to fix type inference issue.
    const allCategories = new Set(shoppingList.map((i: ShoppingListItem) => i.category));
    setCollapsedCategories(allCategories);
  }, [shoppingList]);
  
  const expandAll = useCallback(() => setCollapsedCategories(new Set()), []);

  // #region Drag and Drop Handlers
  const handleDragStart = useCallback((e: React.DragEvent, item: ShoppingListItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id!.toString());
  }, []);
  
   const handleDragOver = useCallback((e: React.DragEvent, item: ShoppingListItem) => {
    e.preventDefault();
    if (draggedItem?.id !== item.id) {
        setDropTargetInfo({ itemId: item.id, category: item.category });
    }
   }, [draggedItem]);

  const handleDrop = useCallback(async (e: React.DragEvent, targetItem: ShoppingListItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;
    
    const itemsInCategory = shoppingList?.filter(i => i.category === targetItem.category && i.id !== draggedItem.id).sort((a,b) => a.sortOrder - b.sortOrder) || [];
    const targetIdx = itemsInCategory.findIndex(i => i.id === targetItem.id);
    const prevItem = itemsInCategory[targetIdx -1];
    const newSortOrder = ((prevItem ? prevItem.sortOrder : 0) + targetItem.sortOrder) / 2;
    
    await updateShoppingListItem({ ...draggedItem, category: targetItem.category, sortOrder: newSortOrder });
  }, [draggedItem, shoppingList]);

  const onCategoryDrop = useCallback(async (category: string) => {
    if (!draggedItem || draggedItem.category === category) return;
    
    const itemsInCategory = shoppingList?.filter(i => i.category === category).sort((a,b) => a.sortOrder - b.sortOrder) || [];
    const lastItem = itemsInCategory[itemsInCategory.length - 1];
    const newSortOrder = (lastItem ? lastItem.sortOrder : 0) + 1000;
    
    await updateShoppingListItem({ ...draggedItem, category, sortOrder: newSortOrder });
  }, [draggedItem, shoppingList]);

  const onDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDropTargetInfo(null);
  }, []);
  // #endregion

  const handleExport = (format: 'pdf' | 'csv' | 'json' | 'md' | 'txt') => {
    setExportOpen(false);
    if (!shoppingList.length) return;
    if (window.confirm(`Möchtest du die Einkaufsliste wirklich als ${format.toUpperCase()}-Datei exportieren?`)) {
      switch(format) {
          case 'pdf': exportShoppingListToPdf(shoppingList); break;
          case 'csv': exportShoppingListToCsv(shoppingList); break;
          case 'json': exportShoppingListToJson(shoppingList); break;
          case 'md': exportShoppingListToMarkdown(shoppingList); break;
          case 'txt': exportShoppingListToTxt(shoppingList); break;
      }
    }
  };

  const activeItems = useMemo(() => shoppingList?.filter(item => !item.isChecked) || [], [shoppingList]);
  const completedItems = useMemo(() => shoppingList?.filter(item => item.isChecked) || [], [shoppingList]);

  const groupedList = useMemo(() => activeItems.reduce((acc, item) => {
    const category = item.category || 'Sonstiges';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>), [activeItems]);

  const handleMoveToPantry = async () => {
      if (completedItems.length > 0 && window.confirm(`${completedItems.length} gekaufte(r) Artikel in den Vorrat verschieben?`)) {
        const movedCount = await moveCheckedToPantry();
        if (movedCount > 0) addToast(`${movedCount} Artikel in den Vorrat verschoben.`, 'success');
      }
  };

  if (shoppingList === undefined) {
      return <div className="text-center p-12"><LoaderCircle className="mx-auto animate-spin text-amber-500" size={32} /></div>;
  }

  return (
    <div className="space-y-8 pb-24">
        <AiModal isOpen={isAiModalOpen} onClose={() => setAiModalOpen(false)} onAdd={handleAiAdd} pantryItems={pantryItems} currentListItems={activeItems} />
        <BulkAddModal isOpen={isBulkAddModalOpen} onClose={() => setBulkAddModalOpen(false)} onAdd={handleBulkAdd} />
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Einkaufsliste</h2>
        <p className="text-zinc-400 mt-1">Verwalte, organisiere und übertrage deine Einkäufe.</p>
      </div>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 space-y-4">
          <div className="flex flex-wrap gap-2 justify-between items-center">
             <div className="flex items-center gap-2">
                <button onClick={expandAll} className="flex items-center gap-2 p-2 rounded-md bg-zinc-700 text-sm hover:bg-zinc-600" title="Alle ausklappen"><ListTree size={16}/></button>
                <button onClick={collapseAll} className="flex items-center gap-2 p-2 rounded-md bg-zinc-700 text-sm hover:bg-zinc-600" title="Alle einklappen"><ListCollapse size={16}/></button>
             </div>
             <div className="flex flex-wrap gap-2 justify-end">
                <button onClick={handleGenerateFromPlan} disabled={isGenerating} className="flex items-center gap-2 bg-zinc-700 font-semibold py-2 px-3 rounded-md hover:bg-zinc-600 text-sm disabled:bg-zinc-800 disabled:text-zinc-500">
                    {isGenerating ? <LoaderCircle size={16} className="animate-spin"/> : <RefreshCw size={16}/>} Aus Plan generieren
                </button>
                <button onClick={() => setBulkAddModalOpen(true)} className="flex items-center gap-2 bg-zinc-700 font-semibold py-2 px-3 rounded-md hover:bg-zinc-600 text-sm"><TextQuote size={16}/> Liste einfügen</button>
                <button onClick={() => setAiModalOpen(true)} className="flex items-center gap-2 bg-zinc-700 font-semibold py-2 px-3 rounded-md hover:bg-zinc-600 text-sm"><Bot size={16} /> KI-Liste</button>
                <div className="relative inline-block">
                    <button onClick={() => setExportOpen(!isExportOpen)} className="w-full flex items-center gap-2 bg-zinc-700 font-semibold py-2 px-3 rounded-md hover:bg-zinc-600 text-sm">
                        <FileDown size={16} /> Exportieren <ChevronDown size={16} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isExportOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10">
                            <a onClick={() => handleExport('pdf')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">PDF (.pdf)</a>
                            <a onClick={() => handleExport('csv')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">CSV (.csv)</a>
                            <a onClick={() => handleExport('json')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">JSON (.json)</a>
                            <a onClick={() => handleExport('md')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">Markdown (.md)</a>
                            <a onClick={() => handleExport('txt')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">Text (.txt)</a>
                        </div>
                    )}
                </div>
                {/* FIX: Add guard to disabled prop to prevent accessing length on a potentially undefined value. */}
                <button onClick={handleClearList} disabled={!shoppingList || shoppingList.length === 0} className="flex items-center gap-2 bg-red-900/80 font-semibold py-2 px-3 rounded-md hover:bg-red-800 disabled:bg-zinc-800 disabled:text-zinc-500 text-sm"><Trash2 size={16}/> Leeren</button>
            </div>
          </div>
      </div>

      <div className="space-y-4">
          {shoppingList && shoppingList.length > 0 ? (
            <>
              {activeItems.length > 0 && (
                  Object.entries(groupedList).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]) => {
                      const isCollapsed = collapsedCategories.has(category);
                      const isDropTargetCategory = dropTargetInfo?.category === category && !dropTargetInfo.itemId;
                      return (
                      <div key={category} onDragOver={e => { e.preventDefault(); setDropTargetInfo({category}) }} onDragLeave={() => setDropTargetInfo(null)} onDrop={() => onCategoryDrop(category)} onDragEnd={onDragEnd}>
                            {editingCategory?.oldName === category ? (
                                <form onSubmit={e => { e.preventDefault(); handleRenameCategory(); }} className="mb-2">
                                    <input type="text" value={editingCategory.newName} onChange={e => setEditingCategory({ ...editingCategory, newName: e.target.value })} onBlur={handleRenameCategory} autoFocus className="font-bold text-amber-400 bg-zinc-800 border-amber-500 border-2 rounded-md w-full p-2 text-lg" />
                                </form>
                            ) : (
                                <h3 onDoubleClick={() => setEditingCategory({ oldName: category, newName: category })} onClick={() => handleToggleCategoryCollapse(category)} title="Klicken zum Ein-/Ausklappen, Doppelklick zum Umbenennen" className="font-bold text-amber-400 text-lg mb-2 p-2 rounded-md bg-zinc-900/50 flex justify-between items-center cursor-pointer hover:bg-zinc-800/50" aria-expanded={!isCollapsed}>
                                    <span>{category} ({items.length})</span>
                                    <ChevronDown className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                                </h3>
                            )}
                          {!isCollapsed && <ul className={`space-y-1 p-2 rounded-lg transition-colors ${isDropTargetCategory ? 'bg-amber-900/20' : ''}`}>
                            {items.map(item => (
                                <ShoppingListItemComponent
                                    key={item.id} item={item} isEditing={editingItem?.id === item.id}
                                    editingItem={editingItem} recipeName={item.recipeId ? recipesById.get(item.recipeId)?.recipeTitle ?? null : null}
                                    onToggle={handleToggle} 
                                    onStartEdit={(itemToEdit) => setEditingItem({ ...itemToEdit })} 
                                    onCancelEdit={() => setEditingItem(null)}
                                    onSaveEdit={async () => { if (editingItem) { await db.shoppingList.update(editingItem.id!, editingItem); setEditingItem(null); } }}
                                    setEditingItem={setEditingItem} 
                                    onDeleteItem={async (id) => { if (window.confirm("Artikel löschen?")) await db.shoppingList.delete(id); }}
                                    onDragStart={handleDragStart}
                                    onDragEnd={onDragEnd}
                                    onDragOver={e => handleDragOver(e, item)}
                                    onDragLeave={() => setDropTargetInfo(null)}
                                    onDrop={e => handleDrop(e, item)}
                                    isDragged={draggedItem?.id === item.id}
                                    dropTargetId={dropTargetInfo?.itemId ?? null}
                                />))}
                            </ul>}
                      </div>
                  )})
              )}
              {completedItems.length > 0 && (
                  <div className="pt-4 border-t border-zinc-700/50">
                      <button onClick={() => setIsCompletedVisible(!isCompletedVisible)} className="w-full flex justify-between items-center text-lg font-semibold text-zinc-400 hover:text-white p-2">
                          <span>Erledigt ({completedItems.length})</span>
                          <ChevronDown className={`transition-transform ${!isCompletedVisible ? '' : 'rotate-180'}`} />
                      </button>
                      {isCompletedVisible && <ul className="mt-2 space-y-1 page-fade-in">{
                        // FIX: Add a guard to ensure completedItems is an array before mapping.
                        Array.isArray(completedItems) && completedItems.map(item => ( <ShoppingListItemComponent key={item.id} item={item} isEditing={false} editingItem={null} recipeName={item.recipeId ? recipesById.get(item.recipeId)?.recipeTitle ?? null : null} onToggle={handleToggle} onStartEdit={() => {}} onCancelEdit={() => {}} onSaveEdit={() => {}} setEditingItem={() => {}} onDeleteItem={() => {}} onDragStart={() => {}} onDragEnd={onDragEnd} onDragOver={() => {}} onDragLeave={() => {}} onDrop={() => {}} isDragged={false} dropTargetId={null} /> ))
                      }</ul>}
                  </div>
              )}
              {activeItems.length === 0 && completedItems.length > 0 && (
                <div className="text-center py-20 bg-zinc-950/50 border border-dashed border-zinc-700 rounded-lg">
                    <CheckCircle className="mx-auto h-12 w-12 text-zinc-600" />
                    <h3 className="mt-4 text-lg font-medium text-zinc-300">Alle Artikel erledigt!</h3>
                    <p className="mt-1 text-sm text-zinc-500">Du kannst die gekauften Artikel nun in den Vorrat verschieben.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-zinc-950/50 border border-dashed border-zinc-700 rounded-lg">
                <ShoppingCart className="mx-auto h-12 w-12 text-zinc-600" />
                <h3 className="mt-4 text-lg font-medium text-zinc-300">Deine Einkaufsliste ist leer</h3>
                <p className="mt-1 text-sm text-zinc-500 max-w-md mx-auto">
                    Füge Artikel manuell hinzu, erstelle eine KI-Liste oder generiere sie aus deinem Essensplan.
                </p>
            </div>
          )}
      </div>

       <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-800 p-3 z-30">
            <div className="max-w-4xl mx-auto px-4">
                {completedItems.length > 0 ? (
                    <button onClick={handleMoveToPantry} className="w-full flex items-center justify-center gap-3 bg-amber-500 text-zinc-900 font-bold py-3 px-4 rounded-md hover:bg-amber-400 transition-colors shadow-lg">
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