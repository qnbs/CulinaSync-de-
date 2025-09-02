import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { db, addOrUpdatePantryItem } from '@/services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { PantryItem } from '@/types';
import { PlusCircle, Trash2, Search, ArrowUpDown, ListTree, Filter, Check, Minus, Plus, Square, CheckSquare, Edit3, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const getExpiryStatus = (expiryDate?: string): 'expired' | 'nearing' | 'ok' => {
  if (!expiryDate) return 'ok';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0,0,0,0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'nearing';
  return 'ok';
};

interface PantryListItemProps {
    item: PantryItem;
    isEditing: boolean;
    editingItem: PantryItem | null;
    isSelectMode: boolean;
    isSelected: boolean;
    onStartEdit: (item: PantryItem) => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    onUpdateEditingItem: (field: keyof PantryItem, value: any) => void;
    onAdjustQuantity: (item: PantryItem, amount: number) => void;
    onToggleSelect: (id: number) => void;
}

const PantryListItem = React.memo<PantryListItemProps>(({
    item, isEditing, editingItem, isSelectMode, isSelected,
    onStartEdit, onCancelEdit, onSaveEdit, onUpdateEditingItem, onAdjustQuantity, onToggleSelect
}) => {
    if (isEditing) {
      return (
        <li className="p-2 sm:p-4 bg-zinc-800 border-l-4 border-amber-500 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input type="text" value={editingItem!.name} onChange={e => onUpdateEditingItem('name', e.target.value)} className="w-full bg-zinc-700 col-span-2 rounded p-2 focus:ring-1 focus:ring-amber-500" />
            <input type="number" value={editingItem!.quantity} onChange={e => onUpdateEditingItem('quantity', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-1 focus:ring-amber-500" />
            <input type="text" value={editingItem!.unit} onChange={e => onUpdateEditingItem('unit', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-1 focus:ring-amber-500" />
            <input type="text" value={editingItem!.category || ''} onChange={e => onUpdateEditingItem('category', e.target.value)} placeholder="Kategorie" className="w-full bg-zinc-700 col-span-2 rounded p-2 focus:ring-1 focus:ring-amber-500" list="common-categories"/>
            <input type="date" value={editingItem!.expiryDate || ''} onChange={e => onUpdateEditingItem('expiryDate', e.target.value)} className="w-full bg-zinc-700 col-span-2 rounded p-2 focus:ring-1 focus:ring-amber-500" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onCancelEdit} className="flex items-center gap-2 py-1 px-3 rounded bg-zinc-600 hover:bg-zinc-500"><X size={16}/> Abbrechen</button>
            <button onClick={onSaveEdit} className="flex items-center gap-2 py-1 px-3 rounded bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400"><Check size={16}/> Speichern</button>
          </div>
        </li>
      );
    }
    
    const status = getExpiryStatus(item.expiryDate);
    let itemClasses = 'p-2 sm:p-4 flex items-center gap-3 transition-all duration-300';
    if (status === 'nearing') itemClasses += ' bg-yellow-900/20 border-l-4 border-yellow-500';
    if (status === 'expired') itemClasses += ' bg-red-900/20 border-l-4 border-red-500 opacity-80';

    return (
        <li className={`${itemClasses} group`}>
          {isSelectMode && (
            <button onClick={() => onToggleSelect(item.id!)} className="p-1 text-zinc-400">
              {isSelected ? <CheckSquare className="text-amber-400"/> : <Square/>}
            </button>
          )}
          <div className="flex-grow cursor-pointer" onClick={() => onStartEdit(item)}>
            <p className="font-medium">{item.name}</p>
            <p className="text-zinc-400 text-sm">
              {item.expiryDate && <span>Läuft ab: {new Date(item.expiryDate).toLocaleDateString('de-DE')}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <button onClick={() => onAdjustQuantity(item, -1)} className="p-1.5 rounded-full bg-zinc-700/50 hover:bg-zinc-700 transition-colors"><Minus size={14}/></button>
            <span className="font-mono w-16 text-center">{item.quantity} {item.unit}</span>
            <button onClick={() => onAdjustQuantity(item, 1)} className="p-1.5 rounded-full bg-zinc-700/50 hover:bg-zinc-700 transition-colors"><Plus size={14}/></button>
          </div>
          <button onClick={() => onStartEdit(item)} className="p-2 rounded-full text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-zinc-700 hover:text-zinc-100 transition-opacity">
            <Edit3 size={16} />
          </button>
        </li>
    );
});


interface PantryManagerProps {
    initialSearchTerm?: string;
    focusAction?: string | null;
    onActionHandled?: () => void;
    addToast: (message: string, type?: 'success' | 'error') => void;
}

const PantryManager: React.FC<PantryManagerProps> = ({ initialSearchTerm, focusAction, onActionHandled, addToast }) => {
  const [quickAddItem, setQuickAddItem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortOrder, setSortOrder] = useState('name');
  const [isGrouped, setIsGrouped] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'nearing' | 'expired'>('all');
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const addItemInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if(initialSearchTerm) setSearchTerm(initialSearchTerm) }, [initialSearchTerm]);
  
  useEffect(() => {
    if (focusAction) {
        if (focusAction === 'addItem' && addItemInputRef.current) addItemInputRef.current.focus();
        else if (focusAction === 'search' && searchInputRef.current) searchInputRef.current.focus();
        onActionHandled?.();
    }
  }, [focusAction, onActionHandled]);

  const pantryItems: PantryItem[] | undefined = useLiveQuery(() => db.pantry.orderBy(sortOrder).toArray(), [sortOrder]);

  const filteredItems = useMemo(() => {
    if (!pantryItems) return [];
    let items = pantryItems;
    if (expiryFilter !== 'all') {
      items = items.filter(item => getExpiryStatus(item.expiryDate) === expiryFilter);
    }
    if (debouncedSearchTerm) {
      const lowerCaseSearch = debouncedSearchTerm.toLowerCase();
      items = items.filter(item => item.name.toLowerCase().includes(lowerCaseSearch));
    }
    if (sortOrder === 'expiryDate') {
        return items.sort((a, b) => {
            if (!a.expiryDate) return 1;
            if (!b.expiryDate) return -1;
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        });
    }
    if (sortOrder === 'createdAt') {
        return items.sort((a, b) => b.createdAt - a.createdAt);
    }
    return items;
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

  const parseQuickAddItem = (input: string): Omit<PantryItem, 'id' | 'createdAt'> => {
    const defaultItem = { name: input.trim(), quantity: 1, unit: 'Stück' };
    if (!input.trim()) return defaultItem;

    const regex = /^\s*(\d+[\.,]?\d*)\s*([a-zA-ZäöüÄÖÜß]+)?\s*(.+)\s*$/;
    const match = input.match(regex);

    if (match) {
        const [, quantityStr, unit, name] = match;
        return {
            quantity: parseFloat(quantityStr.replace(',', '.')) || 1,
            unit: unit || 'Stück',
            name: name.trim(),
        };
    }
    return defaultItem;
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddItem.trim()) return;

    const parsedItem = parseQuickAddItem(quickAddItem);
    
    try {
      const { status, item } = await addOrUpdatePantryItem(parsedItem);
      const message = status === 'added'
          ? `"${item.name.trim()}" hinzugefügt!`
          : `Vorrat für "${item.name.trim()}" aktualisiert!`;
      addToast(message);
      setQuickAddItem('');
    } catch (error) { 
        addToast('Hinzufügen fehlgeschlagen.', 'error'); 
        console.error(error);
    }
  };
  
  const handleStartEdit = useCallback((item: PantryItem) => { setIsSelectMode(false); setEditingItem({ ...item }); }, []);
  const handleCancelEdit = useCallback(() => setEditingItem(null), []);
  const handleSaveEdit = useCallback(async () => {
    if (!editingItem) return;
    try {
      await db.pantry.update(editingItem.id!, editingItem);
      addToast(`"${editingItem.name}" aktualisiert.`);
      setEditingItem(null);
    } catch (error) { addToast('Speichern fehlgeschlagen.', 'error'); }
  }, [editingItem, addToast]);
  const handleUpdateEditingItem = useCallback((field: keyof PantryItem, value: any) => setEditingItem(prev => prev ? { ...prev, [field]: value } : null), []);
  
  const adjustQuantity = useCallback(async (item: PantryItem, amount: number) => {
    const newQuantity = item.quantity + amount;
    if (newQuantity <= 0) {
        if (window.confirm(`Soll "${item.name}" wirklich aus dem Vorrat entfernt werden?`)) {
            await db.pantry.delete(item.id!);
            addToast(`"${item.name}" entfernt.`);
        }
    }
    else await db.pantry.update(item.id!, { quantity: newQuantity });
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

  const renderItems = (itemsToRender: PantryItem[]) => {
      return itemsToRender.map(item => (
          <PantryListItem
              key={item.id}
              item={item}
              isEditing={editingItem?.id === item.id}
              editingItem={editingItem}
              isSelectMode={isSelectMode}
              isSelected={selectedItems.includes(item.id!)}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onUpdateEditingItem={handleUpdateEditingItem}
              onAdjustQuantity={adjustQuantity}
              onToggleSelect={toggleSelectItem}
          />
      ));
  };


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Meine Vorratskammer</h2>
        <p className="text-zinc-400 mt-1">Verwalte deine Zutaten für intelligentere Rezeptvorschläge.</p>
      </div>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 sm:p-6 space-y-4">
        <h3 className="text-lg font-semibold">Schnelleingabe</h3>
        <form onSubmit={handleAddItem} className="flex gap-4">
            <input 
                id="quickAddItem" 
                type="text" 
                value={quickAddItem} 
                ref={addItemInputRef} 
                onChange={e => setQuickAddItem(e.target.value)} 
                placeholder="z.B. 500g Mehl, 1 Bund Petersilie, Eier..." 
                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500" 
                required 
            />
            <button type="submit" className="flex-shrink-0 flex items-center justify-center gap-2 bg-amber-500 text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400 transition-colors"><PlusCircle size={18} /> Hinzufügen</button>
        </form>
        <datalist id="common-units"><option value="Stück" /><option value="g" /><option value="kg" /><option value="ml" /><option value="l" /><option value="TL" /><option value="EL" /><option value="Dose" /><option value="Bund" /></datalist>
        <datalist id="common-categories"><option value="Frischeprodukte"/><option value="Milchprodukte"/><option value="Backwaren"/><option value="Fleisch & Fisch"/><option value="Trockenwaren"/><option value="Konserven"/><option value="Gewürze"/><option value="Öle & Essige"/></datalist>
      </div>
      
      <div className="space-y-4">
         <h3 className="text-lg font-semibold">Aktueller Vorrat</h3>
         <div className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-grow"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} /><input type="text" placeholder="Vorratskammer durchsuchen..." value={searchTerm} ref={searchInputRef} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 pl-10 focus:ring-2 focus:ring-amber-500" /></div>
            <div className="flex items-center gap-2 flex-shrink-0">
               <div className="relative"><select value={expiryFilter} onChange={e => setExpiryFilter(e.target.value as any)} className="appearance-none w-full md:w-auto bg-zinc-800 border-zinc-700 rounded-md py-2 pl-3 pr-8 focus:ring-2 focus:ring-amber-500"><option value="all">Alle</option><option value="nearing">Läuft bald ab</option><option value="expired">Abgelaufen</option></select><Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16}/></div>
               <div className="relative"><select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="appearance-none w-full md:w-auto bg-zinc-800 border-zinc-700 rounded-md py-2 pl-3 pr-8 focus:ring-2 focus:ring-amber-500"><option value="name">Name (A-Z)</option><option value="expiryDate">Ablaufdatum</option><option value="createdAt">Hinzugefügt</option></select><ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16}/></div>
               <button onClick={() => setIsGrouped(!isGrouped)} className={`p-2 rounded-md transition-colors ${isGrouped ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`} title="Nach Kategorie gruppieren"><ListTree size={20} /></button>
               <button onClick={toggleSelectMode} className={`p-2 rounded-md transition-colors ${isSelectMode ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`} title="Auswählen"><CheckSquare size={20} /></button>
            </div>
          </div>

         <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg overflow-hidden">
             {isGrouped && groupedItems ? (
                Object.entries(groupedItems).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]) => (
                    <div key={category}>
                        <h4 className="font-bold text-amber-400 bg-zinc-900 px-4 py-2 border-b border-t border-zinc-800">{category}</h4>
                        <ul className="divide-y divide-zinc-800">{renderItems(items)}</ul>
                    </div>
                ))
             ) : (
                <ul className="divide-y divide-zinc-800">
                {filteredItems && filteredItems.length > 0 ? renderItems(filteredItems)
                  : (<li className="p-12 text-center text-zinc-500 space-y-2"><Edit3 size={32} className="mx-auto text-zinc-600"/><h4 className="font-semibold text-zinc-400">{pantryItems?.length ? "Keine Artikel entsprechen deinen Filtern." : "Deine Vorratskammer ist leer."}</h4><p className="text-sm">{pantryItems?.length ? "Versuche, die Filter zu ändern." : "Füge oben deinen ersten Artikel hinzu!"}</p></li>)}
               </ul>
             )}
         </div>
         {isSelectMode && (
          <div className="sticky bottom-4 z-10 bg-zinc-800/80 backdrop-blur-md border border-zinc-700 rounded-lg p-3 flex justify-between items-center max-w-lg mx-auto shadow-xl page-fade-in">
              <span className="font-medium text-zinc-200">{selectedItems.length} Artikel ausgewählt</span>
              <button onClick={handleDeleteSelected} disabled={selectedItems.length === 0} className="flex items-center gap-2 bg-red-800/80 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed">
                  <Trash2 size={18}/> Löschen
              </button>
          </div>
         )}
      </div>
    </div>
  );
};

export default PantryManager;