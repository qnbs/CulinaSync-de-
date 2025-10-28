


import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { db, addOrUpdatePantryItem, addPantryItemsToShoppingList } from '@/services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { PantryItem } from '@/types';
import { PlusCircle, Trash2, Search, ArrowUpDown, ListTree, Filter, Check, Minus, Plus, Square, CheckSquare, Edit3, X, Save, ShoppingCart, Info } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import PantryListItem, { getExpiryStatus } from './PantryListItem';
import { getCategoryForItem } from '@/services/utils';

const DEFAULT_UNITS = ["Stück", "g", "kg", "ml", "l", "TL", "EL", "Dose", "Bund", "Zehen", "Flasche", "Packung"];

// Sophisticated Add/Edit Modal Component
const PantryItemModal: React.FC<{
    isOpen: boolean;
    item?: PantryItem | null;
    onClose: () => void;
    onSave: (item: PantryItem) => void;
    pantryItems: PantryItem[];
}> = ({ isOpen, item, onClose, onSave, pantryItems }) => {
    const [formData, setFormData] = useState<Partial<PantryItem>>({});
    const nameInputRef = useRef<HTMLInputElement>(null);

    const existingCategories = useMemo(() => Array.from(new Set(pantryItems.map(p => p.category).filter(Boolean))), [pantryItems]);

    useEffect(() => {
        if (isOpen) {
            setFormData(item ? { ...item } : { name: '', quantity: 1, unit: 'Stück', category: '', expiryDate: '', minQuantity: undefined, notes: '' });
            setTimeout(() => nameInputRef.current?.focus(), 100);
        }
    }, [isOpen, item]);
    
    const handleChange = (field: keyof PantryItem, value: any) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const category = getCategoryForItem(name);
        setFormData(prev => ({ ...prev, name, category: prev.category || category }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) return;
        onSave(formData as PantryItem);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 page-fade-in" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6">{item ? 'Artikel bearbeiten' : 'Neuer Artikel im Vorrat'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                           <label htmlFor="itemName" className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                           <input id="itemName" ref={nameInputRef} type="text" value={formData.name || ''} onChange={handleNameChange} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-amber-500" required />
                        </div>
                        <div>
                           <label htmlFor="itemCategory" className="block text-sm font-medium text-zinc-400 mb-1">Kategorie</label>
                           <input id="itemCategory" type="text" value={formData.category || ''} onChange={e => handleChange('category', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-amber-500" list="categories-list" />
                           <datalist id="categories-list">{existingCategories.map(c => <option key={c} value={c} />)}</datalist>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                           <label htmlFor="itemQuantity" className="block text-sm font-medium text-zinc-400 mb-1">Menge</label>
                           <input id="itemQuantity" type="number" value={formData.quantity || ''} onChange={e => handleChange('quantity', parseFloat(e.target.value))} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-amber-500" required min="0" step="any" />
                        </div>
                        <div>
                            <label htmlFor="itemUnit" className="block text-sm font-medium text-zinc-400 mb-1">Einheit</label>
                            <input id="itemUnit" type="text" value={formData.unit || ''} onChange={e => handleChange('unit', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-amber-500" required list="units-list"/>
                            <datalist id="units-list">{DEFAULT_UNITS.map(u => <option key={u} value={u}/>)}</datalist>
                        </div>
                        <div className="col-span-2">
                           <label htmlFor="itemExpiry" className="block text-sm font-medium text-zinc-400 mb-1">Ablaufdatum (optional)</label>
                           <input id="itemExpiry" type="date" value={formData.expiryDate || ''} onChange={e => handleChange('expiryDate', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-amber-500" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="minQuantity" className="block text-sm font-medium text-zinc-400 mb-1">Mindestmenge (optional)</label>
                        <input id="minQuantity" type="number" placeholder="z.B. 1" value={formData.minQuantity || ''} onChange={e => handleChange('minQuantity', parseFloat(e.target.value) || undefined)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-amber-500" min="0" step="any" />
                        <p className="text-xs text-zinc-500 mt-1">Wenn die Menge darunter fällt, wird eine Warnung angezeigt.</p>
                    </div>
                     <div>
                        <label htmlFor="itemNotes" className="block text-sm font-medium text-zinc-400 mb-1">Notizen (optional)</label>
                        <textarea id="itemNotes" value={formData.notes || ''} onChange={e => handleChange('notes', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-amber-500" rows={2}></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                        <button type="submit" className="flex items-center gap-2 py-2 px-4 rounded bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400"><Save size={16}/> Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface PantryManagerProps {
    initialSearchTerm?: string;
    // FIX: Add initialSelectedId to props to allow navigation to a specific item.
    initialSelectedId?: number | null;
    focusAction?: string | null;
    onActionHandled?: () => void;
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const PantryManager: React.FC<PantryManagerProps> = ({ initialSearchTerm, initialSelectedId, focusAction, onActionHandled, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortOrder, setSortOrder] = useState('name');
  const [isGrouped, setIsGrouped] = useState(true);
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'nearing' | 'expired'>('all');
  const [modalState, setModalState] = useState<{ isOpen: boolean; item?: PantryItem | null }>({ isOpen: false, item: null });
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // FIX: Added generic to useLiveQuery and used ?? [] to ensure pantryItems is always an array.
  const pantryItems: PantryItem[] = useLiveQuery<PantryItem[]>(() => db.pantry.orderBy('name').toArray()) ?? [];

  useEffect(() => {
    if (initialSearchTerm) {
        setSearchTerm(initialSearchTerm.split('#')[0]);
    }
  }, [initialSearchTerm]);
  
  useEffect(() => {
    if (focusAction) {
        if (focusAction === 'addItem') setModalState({ isOpen: true, item: null });
        else if (focusAction === 'search' && searchInputRef.current) searchInputRef.current.focus();
        onActionHandled?.();
    }
  }, [focusAction, onActionHandled]);

  // FIX: Add useEffect to handle opening the edit modal when an initialSelectedId is provided.
  useEffect(() => {
    if (initialSelectedId && pantryItems) {
        const itemToEdit = pantryItems.find(item => item.id === initialSelectedId);
        if (itemToEdit) {
            setModalState({ isOpen: true, item: itemToEdit });
        }
    }
  }, [initialSelectedId, pantryItems]);


  const filteredItems = useMemo(() => {
    if (!pantryItems) return [];
    let items = pantryItems;
    if (expiryFilter !== 'all') {
      items = items.filter(item => getExpiryStatus(item.expiryDate) === expiryFilter);
    }
    if (debouncedSearchTerm) {
      const lowerCaseSearch = debouncedSearchTerm.toLowerCase();
      items = items.filter(item => item.name.toLowerCase().includes(lowerCaseSearch) || item.category?.toLowerCase().includes(lowerCaseSearch));
    }
    if (sortOrder === 'expiryDate') {
        return [...items].sort((a, b) => {
            if (!a.expiryDate) return 1;
            if (!b.expiryDate) return -1;
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        });
    }
    if (sortOrder === 'createdAt') {
        return [...items].sort((a, b) => b.createdAt - a.createdAt);
    }
     if (sortOrder === 'updatedAt') {
        return [...items].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    }
    return items; // Already sorted by name from query
  }, [pantryItems, debouncedSearchTerm, expiryFilter, sortOrder]);

  const groupedItems = useMemo(() => {
    if (!isGrouped || !filteredItems) return null;
    return filteredItems.reduce((acc, item) => {
        const category = item.category?.trim() || 'Unkategorisiert';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, PantryItem[]>);
  }, [isGrouped, filteredItems]);

  const handleSaveItem = async (itemToSave: PantryItem) => {
    try {
        const { status, item } = await addOrUpdatePantryItem(itemToSave);
        const message = status === 'added'
            ? `"${item.name.trim()}" hinzugefügt.`
            : `"${item.name.trim()}" aktualisiert.`;
        addToast(message);
        setModalState({ isOpen: false, item: null });
    } catch (error) {
        addToast('Speichern fehlgeschlagen.', 'error');
        console.error(error);
    }
  };
  
  const adjustQuantity = useCallback(async (item: PantryItem, amount: number) => {
    const newQuantity = item.quantity + amount;
    if (newQuantity < 0) return;
    if (newQuantity === 0) {
        if (window.confirm(`Soll "${item.name}" wirklich aus dem Vorrat entfernt werden?`)) {
            await db.pantry.delete(item.id!);
            addToast(`"${item.name}" entfernt.`);
        }
    }
    else await db.pantry.update(item.id!, { quantity: newQuantity, updatedAt: Date.now() });
  }, [addToast]);

  const toggleSelectItem = useCallback((id: number) => setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]), []);
  
  const toggleSelectMode = () => { setIsSelectMode(prev => !prev); setSelectedItems([]); };

  const handleDeleteSelected = async () => {
    if (selectedItems.length > 0 && window.confirm(`${selectedItems.length} Artikel wirklich löschen?`)) {
      await db.pantry.bulkDelete(selectedItems);
      addToast(`${selectedItems.length} Artikel gelöscht.`);
      setIsSelectMode(false); setSelectedItems([]);
    }
  };
  
  const handleAddSelectedToShoppingList = async () => {
    if (selectedItems.length > 0) {
        const count = await addPantryItemsToShoppingList(selectedItems);
        if (count > 0) {
            addToast(`${count} Artikel zur Einkaufsliste hinzugefügt.`);
        } else {
            addToast("Alle ausgewählten Artikel sind bereits auf der Einkaufsliste.", "info");
        }
        setIsSelectMode(false); setSelectedItems([]);
    }
  }

  const renderItems = (itemsToRender: PantryItem[]) => {
      return itemsToRender.map(item => (
          <PantryListItem
              key={item.id}
              item={item}
              isSelectMode={isSelectMode}
              isSelected={selectedItems.includes(item.id!)}
              onStartEdit={(itemToEdit) => setModalState({ isOpen: true, item: itemToEdit })}
              onAdjustQuantity={adjustQuantity}
              onToggleSelect={toggleSelectItem}
              onAddToShoppingList={async () => {
                  const count = await addPantryItemsToShoppingList([item.id!]);
                  if (count > 0) addToast(`"${item.name}" zur Einkaufsliste hinzugefügt.`, 'success');
                  else addToast(`"${item.name}" ist bereits auf der Liste.`, 'info');
              }}
          />
      ));
  };


  return (
    <div className="space-y-8">
      <PantryItemModal isOpen={modalState.isOpen} item={modalState.item} onClose={() => setModalState({ isOpen: false, item: null })} onSave={handleSaveItem} pantryItems={pantryItems} />

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Meine Vorratskammer</h2>
          <p className="text-zinc-400 mt-1">Verwalte deine Zutaten für intelligentere Rezeptvorschläge.</p>
        </div>
        <button onClick={() => setModalState({ isOpen: true, item: null })} className="flex-shrink-0 flex items-center justify-center gap-2 bg-amber-500 text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400 transition-colors">
            <PlusCircle size={18} /> Neuen Artikel hinzufügen
        </button>
      </div>
      
      <div className="space-y-4">
         <div className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg">
           <div className="relative flex-grow"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} /><input type="text" placeholder="Vorratskammer durchsuchen..." value={searchTerm} ref={searchInputRef} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 pl-10 focus:ring-2 focus:ring-amber-500" /></div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
               <div className="relative"><select value={expiryFilter} onChange={e => setExpiryFilter(e.target.value as any)} className="appearance-none w-full md:w-auto bg-zinc-800 border-zinc-700 rounded-md py-2 pl-3 pr-8 focus:ring-2 focus:ring-amber-500"><option value="all">Alle</option><option value="nearing">Läuft bald ab</option><option value="expired">Abgelaufen</option></select><Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16}/></div>
               <div className="relative"><select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="appearance-none w-full md:w-auto bg-zinc-800 border-zinc-700 rounded-md py-2 pl-3 pr-8 focus:ring-2 focus:ring-amber-500"><option value="name">Name (A-Z)</option><option value="expiryDate">Ablaufdatum</option><option value="updatedAt">Zuletzt geändert</option><option value="createdAt">Hinzugefügt</option></select><ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16}/></div>
               <button onClick={() => setIsGrouped(!isGrouped)} className={`p-2 rounded-md transition-colors ${isGrouped ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`} title="Nach Kategorie gruppieren"><ListTree size={20} /></button>
               <button onClick={toggleSelectMode} className={`p-2 rounded-md transition-colors ${isSelectMode ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`} title="Auswählen"><CheckSquare size={20} /></button>
            </div>
          </div>

         <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg overflow-hidden">
             {isGrouped && groupedItems ? (
                Object.entries(groupedItems).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]) => (
                    <div key={category}>
                        <h4 className="font-bold text-amber-400 bg-zinc-900 px-4 py-2 border-b border-t border-zinc-800 sticky top-0 z-10">{category}</h4>
                        <ul className="divide-y divide-zinc-800">{renderItems(items)}</ul>
                    </div>
                ))
             ) : (
                <ul className="divide-y divide-zinc-800">
                {filteredItems && filteredItems.length > 0 ? renderItems(filteredItems)
                  : (<li className="p-12 text-center text-zinc-500 space-y-2"><Info size={32} className="mx-auto text-zinc-600"/><h4 className="font-semibold text-zinc-400">{pantryItems?.length ? "Keine Artikel entsprechen deinen Filtern." : "Deine Vorratskammer ist leer."}</h4><p className="text-sm">{pantryItems?.length ? "Versuche, die Filter zu ändern." : "Füge oben deinen ersten Artikel hinzu!"}</p></li>)}
               </ul>
             )}
         </div>
         {isSelectMode && (
          <div className="sticky bottom-4 z-20 bg-zinc-800/80 backdrop-blur-md border border-zinc-700 rounded-lg p-3 flex justify-between items-center w-full max-w-lg mx-auto shadow-xl page-fade-in">
              <span className="font-medium text-zinc-200">{selectedItems.length} Artikel ausgewählt</span>
              <div className="flex gap-2">
                <button onClick={handleAddSelectedToShoppingList} disabled={selectedItems.length === 0} className="flex items-center gap-2 bg-amber-500 text-zinc-900 font-bold py-2 px-3 rounded-md hover:bg-amber-400 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed text-sm">
                    <ShoppingCart size={16}/> Zur Liste
                </button>
                <button onClick={handleDeleteSelected} disabled={selectedItems.length === 0} className="flex items-center gap-2 bg-red-800/80 text-white font-bold py-2 px-3 rounded-md hover:bg-red-700 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed text-sm">
                    <Trash2 size={16}/> Löschen
                </button>
              </div>
          </div>
         )}
      </div>
    </div>
  );
};

export default PantryManager;