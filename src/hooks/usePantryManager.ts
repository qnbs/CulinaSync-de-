import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { db, addOrUpdatePantryItem, addPantryItemsToShoppingList } from '../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { PantryItem, AppSettings } from '../types';
import { useDebounce } from './useDebounce';
import { getExpiryStatus } from '../components/PantryListItem';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setVoiceAction, addToast as addToastAction, setFocusAction, clearInitialSelectedId } from '../store/slices/uiSlice';
import { setPantryGrouping, setPantrySort } from '../store/slices/settingsSlice';


export const usePantryManager = () => {
  const dispatch = useAppDispatch();
  const { voiceAction, focusAction, initialSelectedId } = useAppSelector(state => state.ui);
  const { pantry: pantrySettings } = useAppSelector(state => state.settings);
  const { defaultSort: sortOrder, isGrouped } = pantrySettings;
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'nearing' | 'expired'>('all');
  const [modalState, setModalState] = useState<{ isOpen: boolean; item?: PantryItem | null }>({ isOpen: false, item: null });
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // FIX: The version of useLiveQuery seems to expect only 2 arguments. Removed the third 'defaultValue' argument.
  // This means `pantryItems` can be `undefined`.
  const pantryItems = useLiveQuery<PantryItem[]>(() => db.pantry.orderBy('name').toArray(), []);

  const initialSearchTerm = voiceAction?.type === 'SEARCH' ? voiceAction.payload : undefined;

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    dispatch(addToastAction({ message, type }));
  }, [dispatch]);

  const setSortOrder = (order: string) => {
    dispatch(setPantrySort(order as AppSettings['pantry']['defaultSort']));
  };

  const setIsGrouped = (grouped: boolean) => {
    dispatch(setPantryGrouping(grouped));
  };


  useEffect(() => {
    if (initialSearchTerm) {
        setSearchTerm(initialSearchTerm.split('#')[0]);
        dispatch(setVoiceAction(null));
    }
  }, [initialSearchTerm, dispatch]);
  
  useEffect(() => {
    if (focusAction) {
        if(focusAction === 'addItem') setModalState({ isOpen: true, item: null });
        else if (focusAction === 'search' && searchInputRef.current) searchInputRef.current.focus();
        dispatch(setFocusAction(null));
    }
  }, [focusAction, dispatch]);

  useEffect(() => {
    // FIX: Add check for pantryItems being defined before using it.
    if (initialSelectedId && pantryItems && pantryItems.length > 0) {
        // FIX: pantryItems is now correctly typed, so .find can be used.
        const itemToEdit = pantryItems.find(item => item.id === initialSelectedId);
        if (itemToEdit) {
            setModalState({ isOpen: true, item: itemToEdit });
            dispatch(clearInitialSelectedId());
        }
    }
  }, [initialSelectedId, pantryItems, dispatch]);

  const filteredItems = useMemo(() => {
    // FIX: Handle potentially undefined `pantryItems` by providing a fallback empty array.
    let items = pantryItems || [];
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
    if (!isGrouped) return null;
    return filteredItems.reduce((acc, item) => {
        const category = item.category?.trim() || 'Unkategorisiert';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, PantryItem[]>);
  }, [isGrouped, filteredItems]);

  const handleSaveItem = useCallback(async (itemToSave: PantryItem) => {
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
  }, [addToast]);
  
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
  
  const toggleSelectMode = useCallback(() => { 
    setIsSelectMode(prev => !prev); 
    setSelectedItems([]); 
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedItems.length > 0 && window.confirm(`${selectedItems.length} Artikel wirklich löschen?`)) {
      await db.pantry.bulkDelete(selectedItems);
      addToast(`${selectedItems.length} Artikel gelöscht.`);
      setIsSelectMode(false); 
      setSelectedItems([]);
    }
  }, [selectedItems, addToast]);
  
  const handleAddSelectedToShoppingList = useCallback(async () => {
    if (selectedItems.length > 0) {
        const count = await addPantryItemsToShoppingList(selectedItems);
        if (count > 0) {
            addToast(`${count} Artikel zur Einkaufsliste hinzugefügt.`);
        } else {
            addToast("Alle ausgewählten Artikel sind bereits auf der Einkaufsliste.", "info");
        }
        setIsSelectMode(false); 
        setSelectedItems([]);
    }
  }, [selectedItems, addToast]);
  
  const handleAddToShoppingList = useCallback(async (item: PantryItem) => {
    const count = await addPantryItemsToShoppingList([item.id!]);
    if (count > 0) addToast(`"${item.name}" zur Einkaufsliste hinzugefügt.`, 'success');
    else addToast(`"${item.name}" ist bereits auf der Liste.`, 'info');
  }, [addToast]);

  return {
    searchTerm, setSearchTerm, sortOrder, setSortOrder, isGrouped, setIsGrouped,
    expiryFilter, setExpiryFilter, modalState, setModalState, isSelectMode,
    selectedItems, pantryItems, filteredItems, groupedItems, searchInputRef,
    adjustQuantity, toggleSelectItem, toggleSelectMode, handleDeleteSelected,
    handleAddSelectedToShoppingList, handleSaveItem, handleAddToShoppingList
  };
};