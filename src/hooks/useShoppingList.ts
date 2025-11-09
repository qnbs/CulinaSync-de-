import { useState, useMemo, useRef, useCallback, FormEvent, DragEvent, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { ShoppingListItem, Recipe, PantryItem } from '../types';
import { exportShoppingListToCsv, exportShoppingListToPdf, exportShoppingListToMarkdown, exportShoppingListToTxt, exportShoppingListToJson } from '../services/exportService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setVoiceAction, addToast as addToastAction, setFocusAction } from '../store/slices/uiSlice';
import { 
    setAiModalOpen,
    setBulkAddModalOpen,
    setEditingItem,
    setEditingCategory,
    setExportOpen,
    toggleCategoryCollapse,
    collapseAll,
    expandAll,
    toggleItemCheckedAsync,
    clearListAsync,
    generateFromPlanAsync,
    addItemAsync,
    addItemsAsync,
    renameCategoryAsync,
    updateItemOrderAsync,
    updateItemAsync,
    deleteItemAsync,
    moveToPantryAsync,
    toggleCompletedVisible,
} from '../store/slices/shoppingListSlice';

export const useShoppingList = () => {
  const dispatch = useAppDispatch();
  const { voiceAction, focusAction } = useAppSelector(state => state.ui);
  const shoppingListState = useAppSelector(state => state.shoppingList);

  const shoppingList: ShoppingListItem[] = useLiveQuery(() => db.shoppingList.orderBy(['category', 'sortOrder']).toArray(), []) ?? [];
  const pantryItems: PantryItem[] = useLiveQuery(() => db.pantry.toArray(), []) ?? [];
  const recipes: Recipe[] = useLiveQuery(() => db.recipes.toArray(), []) ?? [];

  const [quickAddItem, setQuickAddItem] = useState('');
  const [draggedItem, setDraggedItem] = useState<ShoppingListItem | null>(null);
  const [dropTargetInfo, setDropTargetInfo] = useState<{ itemId?: number; category: string } | null>(null);

  const addItemInputRef = useRef<HTMLInputElement>(null);
  const recipesById = useMemo(() => new Map<number, Recipe>((recipes || []).map(r => [r.id!, r])), [recipes]);
  
  const triggerCheckItem = voiceAction?.type === 'CHECK_SHOPING_ITEM' ? voiceAction.payload : undefined;

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    dispatch(addToastAction({ message, type }));
  };

  const handleToggle = useCallback((item: ShoppingListItem) => {
    dispatch(toggleItemCheckedAsync(item));
  }, [dispatch]);

  const handleClearList = useCallback(async () => {
    if (window.confirm('Möchtest du die Einkaufsliste wirklich komplett leeren?')) {
        const result = await dispatch(clearListAsync());
        if(result.payload > 0) addToast('Liste geleert.');
    }
  }, [dispatch, addToast]);

  const handleGenerateFromPlan = useCallback(async () => {
      const resultAction = await dispatch(generateFromPlanAsync());
      if (generateFromPlanAsync.fulfilled.match(resultAction)) {
          const { added, existing } = resultAction.payload;
          if(added === 0 && existing === 0) addToast("Keine fehlenden Zutaten im Essensplan gefunden.", "info");
          else addToast(`${added} neue(r) Artikel hinzugefügt, ${existing} bereits auf der Liste.`, 'success');
      }
  }, [dispatch, addToast]);
  
  useEffect(() => {
    if (focusAction) {
        if(focusAction === 'addItem' && addItemInputRef.current) addItemInputRef.current.focus();
        if(focusAction === 'generate') handleGenerateFromPlan();
        if(focusAction === 'clear') handleClearList();
        dispatch(setFocusAction(null));
    }
  }, [focusAction, dispatch, handleGenerateFromPlan, handleClearList]);


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
        dispatch(setVoiceAction(null));
    }
  }, [triggerCheckItem, shoppingList, handleToggle, addToast, dispatch]);


  const handleQuickAdd = useCallback(async (e: FormEvent) => {
      e.preventDefault();
      if(!quickAddItem.trim()) return;
      const resultAction = await dispatch(addItemAsync(quickAddItem));
      if (addItemAsync.fulfilled.match(resultAction)) {
        if(resultAction.payload.status === 'updated') {
            addToast(`Menge für "${resultAction.payload.name}" aktualisiert.`);
        }
      }
      setQuickAddItem('');
  }, [quickAddItem, dispatch, addToast]);

  const handleAiAdd = useCallback(async (items: Omit<ShoppingListItem, 'id' | 'isChecked' | 'sortOrder' | 'category'>[]) => {
      const resultAction = await dispatch(addItemsAsync(items));
      if(addItemsAsync.fulfilled.match(resultAction)){
          const { added, updated } = resultAction.payload;
          addToast(`${added} Artikel von KI hinzugefügt, ${updated} aktualisiert.`, 'success');
      }
  }, [dispatch, addToast]);

  const handleBulkAdd = useCallback(async (items: Omit<ShoppingListItem, 'id'|'isChecked'|'sortOrder'|'category'>[]) => {
    const resultAction = await dispatch(addItemsAsync(items));
      if(addItemsAsync.fulfilled.match(resultAction)){
          const { added, updated } = resultAction.payload;
          addToast(`${added} Artikel hinzugefügt, ${updated} aktualisiert.`, 'success');
      }
  }, [dispatch, addToast]);
  

  const handleRenameCategory = useCallback(async () => {
    if (!shoppingListState.editingCategory || !shoppingListState.editingCategory.newName.trim() || shoppingListState.editingCategory.newName === shoppingListState.editingCategory.oldName) {
        dispatch(setEditingCategory(null));
        return;
    }
    await dispatch(renameCategoryAsync(shoppingListState.editingCategory));
    addToast(`Kategorie umbenannt in "${shoppingListState.editingCategory.newName.trim()}".`);
    dispatch(setEditingCategory(null));
  }, [shoppingListState.editingCategory, dispatch, addToast]);

  const handleToggleCategoryCollapse = useCallback((category: string) => {
    dispatch(toggleCategoryCollapse(category));
  }, [dispatch]);
  
  const collapseAll = useCallback(() => {
    if(!shoppingList) return;
    const allCategories = Array.from(new Set(shoppingList.map(i => i.category)));
    dispatch(collapseAll(allCategories));
  }, [shoppingList, dispatch]);
  
  const expandAll = useCallback(() => dispatch(expandAll()), [dispatch]);

  const handleDragStart = useCallback((e: DragEvent, item: ShoppingListItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id!.toString());
  }, []);
  
   const handleDragOver = useCallback((e: DragEvent, item: ShoppingListItem) => {
    e.preventDefault();
    if (draggedItem?.id !== item.id) {
        setDropTargetInfo({ itemId: item.id, category: item.category });
    }
   }, [draggedItem]);

  const handleDrop = useCallback(async (e: DragEvent, targetItem: ShoppingListItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;
    
    const itemsInCategory = shoppingList?.filter(i => i.category === targetItem.category && i.id !== draggedItem.id).sort((a,b) => a.sortOrder - b.sortOrder) || [];
    const targetIdx = itemsInCategory.findIndex(i => i.id === targetItem.id);
    const prevItem = itemsInCategory[targetIdx -1];
    const newSortOrder = ((prevItem ? prevItem.sortOrder : 0) + targetItem.sortOrder) / 2;
    
    dispatch(updateItemOrderAsync({ ...draggedItem, category: targetItem.category, sortOrder: newSortOrder }));
  }, [draggedItem, shoppingList, dispatch]);

  const onCategoryDrop = useCallback(async (category: string) => {
    if (!draggedItem || draggedItem.category === category) return;
    
    const itemsInCategory = shoppingList?.filter(i => i.category === category).sort((a,b) => a.sortOrder - b.sortOrder) || [];
    const lastItem = itemsInCategory[itemsInCategory.length - 1];
    const newSortOrder = (lastItem ? lastItem.sortOrder : 0) + 1000;
    
    dispatch(updateItemOrderAsync({ ...draggedItem, category, newSortOrder }));
  }, [draggedItem, shoppingList, dispatch]);

  const onDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDropTargetInfo(null);
  }, []);

  const handleExport = (format: 'pdf' | 'csv' | 'json' | 'md' | 'txt') => {
    dispatch(setExportOpen(false));
    if (!shoppingList?.length) return;
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

  // FIX: Wrap event handler in useCallback to ensure stable function reference and fix potential type inference issues.
  const handleMoveToPantry = useCallback(async () => {
      if (completedItems.length > 0 && window.confirm(`${completedItems.length} gekaufte(r) Artikel in den Vorrat verschieben?`)) {
        const resultAction = await dispatch(moveToPantryAsync());
        if(moveToPantryAsync.fulfilled.match(resultAction) && resultAction.payload > 0) {
            addToast(`${resultAction.payload} Artikel in den Vorrat verschoben.`, 'success');
        }
      }
  }, [completedItems, dispatch, addToast]);

  return {
    shoppingList, pantryItems, recipes, quickAddItem, ...shoppingListState,
    draggedItem, dropTargetInfo, addItemInputRef, recipesById,
    activeItems, completedItems, groupedList,

    setQuickAddItem,
    setAiModalOpen: (isOpen: boolean) => dispatch(setAiModalOpen(isOpen)),
    setBulkAddModalOpen: (isOpen: boolean) => dispatch(setBulkAddModalOpen(isOpen)),
    setEditingItem: (item: ShoppingListItem | null) => dispatch(setEditingItem(item)),
    setEditingCategory: (cat: { oldName: string, newName: string } | null) => dispatch(setEditingCategory(cat)),
    setIsCompletedVisible: () => dispatch(toggleCompletedVisible()),
    setExportOpen: (isOpen: boolean) => dispatch(setExportOpen(isOpen)),
    setDropTargetInfo,

    handleToggle, handleQuickAdd, handleAiAdd, handleBulkAdd, handleGenerateFromPlan,
    handleRenameCategory, handleToggleCategoryCollapse, collapseAll, expandAll,
    handleDragStart, handleDragOver, handleDrop, onCategoryDrop, onDragEnd,
    handleClearList, handleExport, handleMoveToPantry,
    updateItem: (item: ShoppingListItem) => dispatch(updateItemAsync(item)),
    deleteItem: (id: number) => { 
        if(window.confirm("Artikel löschen?")) dispatch(deleteItemAsync(id)); 
    },
  };
};
