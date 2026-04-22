import { useState, useMemo, useRef, useCallback, useEffect, type FormEvent, type DragEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../services/dbInstance';
import { ShoppingListItem, Recipe, PantryItem } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setVoiceAction, addToast as addToastAction, setFocusAction } from '../store/slices/uiSlice';
import { 
    setAiModalOpen,
    setBulkAddModalOpen,
    setEditingItem,
    setEditingCategory,
    setExportOpen,
    setShoppingMode,
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

type PendingShoppingListAction =
  | { type: 'clear' }
  | { type: 'export'; format: 'pdf' | 'csv' | 'json' | 'md' | 'txt' }
  | { type: 'moveToPantry'; count: number }
  | { type: 'deleteItem'; id: number; itemName?: string };

export const useShoppingList = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { voiceAction, focusAction } = useAppSelector(state => state.ui);
  const shoppingListState = useAppSelector(state => state.shoppingList);

  const shoppingListResult = useLiveQuery(() => db.shoppingList.orderBy(['category', 'sortOrder']).toArray(), []);
  const pantryItemsResult = useLiveQuery(() => db.pantry.toArray(), []);
  const recipesResult = useLiveQuery(() => db.recipes.toArray(), []);

  const shoppingList: ShoppingListItem[] = useMemo(() => shoppingListResult ?? [], [shoppingListResult]);
  const pantryItems: PantryItem[] = useMemo(() => pantryItemsResult ?? [], [pantryItemsResult]);
  const recipes: Recipe[] = useMemo(() => recipesResult ?? [], [recipesResult]);

  const [quickAddItem, setQuickAddItem] = useState('');
  const [draggedItem, setDraggedItem] = useState<ShoppingListItem | null>(null);
  const [dropTargetInfo, setDropTargetInfo] = useState<{ itemId?: number; category: string } | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingShoppingListAction | null>(null);

  const addItemInputRef = useRef<HTMLInputElement>(null);
  const recipesById = useMemo(() => new Map<number, Recipe>(recipes.map(r => [r.id!, r])), [recipes]);
  
  const triggerCheckItem = voiceAction?.type === 'CHECK_SHOPPING_ITEM' ? voiceAction.payload : undefined;

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    dispatch(addToastAction({ message, type }));
  }, [dispatch]);

  const handleToggle = useCallback((item: ShoppingListItem) => {
    dispatch(toggleItemCheckedAsync(item));
  }, [dispatch]);

  const handleClearList = useCallback(async () => {
    if (shoppingList.length === 0) return;
    setPendingAction({ type: 'clear' });
  }, [shoppingList.length]);

  const handleGenerateFromPlan = useCallback(async () => {
      const resultAction = await dispatch(generateFromPlanAsync());
      if (generateFromPlanAsync.fulfilled.match(resultAction)) {
          const { added, existing } = resultAction.payload;
          if(added === 0 && existing === 0) addToast("Keine fehlenden Zutaten im Essensplan gefunden.", "info");
          else addToast(`${added} neue(r) Artikel hinzugefügt, ${existing} bereits auf der Liste.`, 'success');
      }
  }, [dispatch, addToast]);

  const effectivePendingAction = useMemo<PendingShoppingListAction | null>(() => {
    if (pendingAction) {
      return pendingAction;
    }

    if (focusAction === 'clear' && shoppingList.length > 0) {
      return { type: 'clear' };
    }

    return null;
  }, [pendingAction, focusAction, shoppingList.length]);
  
  useEffect(() => {
    if (focusAction) {
        if(focusAction === 'addItem' && addItemInputRef.current) addItemInputRef.current.focus();
        if(focusAction === 'generate') handleGenerateFromPlan();
        if(focusAction === 'clear') {
          if (shoppingList.length === 0) {
            dispatch(setFocusAction(null));
          }
          return;
        }
        dispatch(setFocusAction(null));
    }
  }, [focusAction, dispatch, handleGenerateFromPlan, shoppingList.length]);


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
  
  const handleCollapseAll = useCallback(() => {
    if(!shoppingList) return;
    const allCategories = Array.from(new Set(shoppingList.map(i => i.category)));
    dispatch(collapseAll(allCategories));
  }, [shoppingList, dispatch]);
  
  const handleExpandAll = useCallback(() => dispatch(expandAll()), [dispatch]);

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
    
    dispatch(updateItemOrderAsync({ ...draggedItem, category, sortOrder: newSortOrder }));
  }, [draggedItem, shoppingList, dispatch]);

  const onDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDropTargetInfo(null);
  }, []);

  const handleExport = async (format: 'pdf' | 'csv' | 'json' | 'md' | 'txt') => {
    dispatch(setExportOpen(false));
    if (!shoppingList?.length) return;
    setPendingAction({ type: 'export', format });
  };

  const activeItems = useMemo(() => shoppingList?.filter(item => !item.isChecked) || [], [shoppingList]);
  const completedItems = useMemo(() => shoppingList?.filter(item => item.isChecked) || [], [shoppingList]);

  const groupedList = useMemo(() => activeItems.reduce((acc, item) => {
    const category = item.category || 'Sonstiges';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>), [activeItems]);

  const handleMoveToPantry = useCallback(async () => {
      if (completedItems.length > 0) {
        setPendingAction({ type: 'moveToPantry', count: completedItems.length });
      }
  }, [completedItems.length]);

  const confirmPendingAction = useCallback(async () => {
    if (!effectivePendingAction) {
      return;
    }

    const actionToRun = effectivePendingAction;
    setPendingAction(null);

    if (actionToRun.type === 'clear') {
      const result = await dispatch(clearListAsync());
      dispatch(setFocusAction(null));
      if (clearListAsync.fulfilled.match(result) && result.payload > 0) {
        addToast('Liste geleert.');
      }
      return;
    }

    if (actionToRun.type === 'export') {
      const {
        exportShoppingListToPdf,
        exportShoppingListToCsv,
        exportShoppingListToJson,
        exportShoppingListToMarkdown,
        exportShoppingListToTxt,
      } = await import('../services/exportService');
      switch(actionToRun.format) {
          case 'pdf': await exportShoppingListToPdf(shoppingList); break;
          case 'csv': await exportShoppingListToCsv(shoppingList); break;
          case 'json': await exportShoppingListToJson(shoppingList); break;
          case 'md': await exportShoppingListToMarkdown(shoppingList); break;
          case 'txt': await exportShoppingListToTxt(shoppingList); break;
      }
      return;
    }

    if (actionToRun.type === 'moveToPantry') {
      const resultAction = await dispatch(moveToPantryAsync());
      if(moveToPantryAsync.fulfilled.match(resultAction) && resultAction.payload > 0) {
        addToast(`${resultAction.payload} Artikel in den Vorrat verschoben.`, 'success');
      }
      return;
    }

    dispatch(deleteItemAsync(actionToRun.id));
  }, [effectivePendingAction, dispatch, addToast, shoppingList]);

  const cancelPendingAction = useCallback(() => {
    setPendingAction(null);
    if (focusAction === 'clear') {
      dispatch(setFocusAction(null));
    }
  }, [focusAction, dispatch]);

  const confirmationDialog = useMemo(() => {
    if (!effectivePendingAction) {
      return null;
    }

    switch (effectivePendingAction.type) {
      case 'clear':
        return {
          title: t('shoppingList.confirm.clearTitle'),
          description: t('shoppingList.confirm.clearDescription'),
          actionLabel: t('shoppingList.confirm.clearAction'),
        };
      case 'export':
        return {
          title: t('shoppingList.confirm.exportTitle'),
          description: t('shoppingList.confirm.exportDescription', { format: effectivePendingAction.format.toUpperCase() }),
          actionLabel: t('shoppingList.confirm.exportAction'),
        };
      case 'moveToPantry':
        return {
          title: t('shoppingList.confirm.moveToPantryTitle'),
          description: t('shoppingList.confirm.moveToPantryDescription', { count: effectivePendingAction.count }),
          actionLabel: t('shoppingList.confirm.moveToPantryAction'),
        };
      case 'deleteItem':
        return {
          title: t('shoppingList.confirm.deleteItemTitle'),
          description: effectivePendingAction.itemName
            ? t('shoppingList.confirm.deleteItemDescriptionNamed', { itemName: effectivePendingAction.itemName })
            : t('shoppingList.confirm.deleteItemDescription'),
          actionLabel: t('common.delete'),
        };
    }
  }, [effectivePendingAction, t]);

  return {
    shoppingList, pantryItems, recipes, quickAddItem, ...shoppingListState,
    draggedItem, dropTargetInfo, addItemInputRef, recipesById,
    activeItems, completedItems, groupedList,
    pendingAction, confirmationDialog,

    setQuickAddItem,
    setAiModalOpen: (isOpen: boolean) => dispatch(setAiModalOpen(isOpen)),
    setBulkAddModalOpen: (isOpen: boolean) => dispatch(setBulkAddModalOpen(isOpen)),
    setEditingItem: (item: ShoppingListItem | null) => dispatch(setEditingItem(item)),
    setEditingCategory: (cat: { oldName: string, newName: string } | null) => dispatch(setEditingCategory(cat)),
    setIsCompletedVisible: () => dispatch(toggleCompletedVisible()),
    setExportOpen: (isOpen: boolean) => dispatch(setExportOpen(isOpen)),
    setShoppingMode: (isMode: boolean) => dispatch(setShoppingMode(isMode)),
    setDropTargetInfo,

    handleToggle, handleQuickAdd, handleAiAdd, handleBulkAdd, handleGenerateFromPlan,
    handleRenameCategory, handleToggleCategoryCollapse, 
    collapseAll: handleCollapseAll, 
    expandAll: handleExpandAll,
    handleDragStart, handleDragOver, handleDrop, onCategoryDrop, onDragEnd,
    handleClearList, handleExport, handleMoveToPantry,
    confirmPendingAction, cancelPendingAction,
    updateItem: (item: ShoppingListItem) => dispatch(updateItemAsync(item)),
    deleteItem: (id: number) => {
      const itemName = shoppingList.find((item) => item.id === id)?.name;
      setPendingAction({ type: 'deleteItem', id, itemName });
    },
  };
};