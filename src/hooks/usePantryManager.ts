import { useState, useMemo, useRef, useEffect, useCallback, type SetStateAction } from 'react';
import { db } from '../services/dbInstance';
import { addOrUpdatePantryItem, addPantryItemsToShoppingList } from '../services/repositories/pantryRepository';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { PantryItem, AppSettings } from '../types';
import { useDebounce } from './useDebounce';
import { getExpiryStatus } from '../components/PantryListItem';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setVoiceAction, addToast as addToastAction, setFocusAction, clearInitialSelectedId } from '../store/slices/uiSlice';
import { setPantryGrouping, setPantrySort } from '../store/slices/settingsSlice';
import { parseShoppingItemString, getCategoryForItem } from '../services/utils';

type PendingPantryAction =
  | { type: 'removeItem'; item: PantryItem }
  | { type: 'deleteSelected'; count: number; itemIds: number[] };

export const usePantryManager = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { voiceAction, focusAction, initialSelectedId } = useAppSelector(state => state.ui);
  const { pantry: pantrySettings } = useAppSelector(state => state.settings);
  const { defaultSort: sortOrder, isGrouped } = pantrySettings;
  
  const closedModalState = useMemo<{ isOpen: boolean; item?: PantryItem | null }>(() => ({ isOpen: false, item: null }), []);
  const [searchTerm, setSearchTerm] = useState('');
  const [userModalState, setUserModalState] = useState<{ isOpen: boolean; item?: PantryItem | null }>(closedModalState);
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'nearing' | 'expired'>('all');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingPantryAction | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pantryItems = useLiveQuery<PantryItem[]>(() => {
    switch (sortOrder) {
      case 'expiryDate':
        return db.pantry.orderBy('expiryDate').toArray();
      case 'updatedAt':
        return db.pantry.orderBy('updatedAt').reverse().toArray();
      case 'createdAt':
        return db.pantry.orderBy('createdAt').reverse().toArray();
      case 'name':
      default:
        return db.pantry.orderBy('name').toArray();
    }
  }, [sortOrder]);

  const initialSearchTerm = voiceAction?.type === 'SEARCH' ? voiceAction.payload : undefined;
  const voiceSearchTerm = useMemo(() => initialSearchTerm?.split('#')[0] ?? '', [initialSearchTerm]);
  const effectiveSearchTerm = voiceSearchTerm || searchTerm;
  const debouncedSearchTerm = useDebounce(effectiveSearchTerm, 300);
  const autoEditItem = useMemo(
    () => initialSelectedId && pantryItems?.length ? pantryItems.find(item => item.id === initialSelectedId) ?? null : null,
    [initialSelectedId, pantryItems],
  );
  const modalState = useMemo(() => {
    if (userModalState.isOpen) {
      return userModalState;
    }
    if (autoEditItem) {
      return { isOpen: true, item: autoEditItem };
    }
    if (focusAction === 'addItem') {
      return { isOpen: true, item: null };
    }
    return closedModalState;
  }, [autoEditItem, closedModalState, focusAction, userModalState]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    dispatch(addToastAction({ message, type }));
  }, [dispatch]);

  const handleSearchTermChange = useCallback((value: string) => {
    if (initialSearchTerm) {
      dispatch(setVoiceAction(null));
    }
    setSearchTerm(value);
  }, [dispatch, initialSearchTerm]);

  const setModalState = useCallback((nextState: SetStateAction<{ isOpen: boolean; item?: PantryItem | null }>) => {
    const resolvedState = typeof nextState === 'function' ? nextState(modalState) : nextState;
    setUserModalState(resolvedState);
    if (!resolvedState.isOpen) {
      if (focusAction === 'addItem') {
        dispatch(setFocusAction(null));
      }
      if (initialSelectedId) {
        dispatch(clearInitialSelectedId());
      }
    }
  }, [dispatch, focusAction, initialSelectedId, modalState]);

  const setSortOrder = (order: string) => {
    dispatch(setPantrySort(order as AppSettings['pantry']['defaultSort']));
  };

  const setIsGrouped = (grouped: boolean) => {
    dispatch(setPantryGrouping(grouped));
  };
  useEffect(() => {
    if (focusAction) {
        if (focusAction === 'search' && searchInputRef.current) {
          searchInputRef.current.focus();
        }
        dispatch(setFocusAction(null));
    }
  }, [focusAction, dispatch]);

  const filteredItems = useMemo(() => {
    let items = pantryItems || [];
    if (expiryFilter !== 'all') {
      items = items.filter(item => getExpiryStatus(item.expiryDate) === expiryFilter);
    }
    if (debouncedSearchTerm) {
      const lowerCaseSearch = debouncedSearchTerm.toLowerCase();
      items = items.filter(item => item.name.toLowerCase().includes(lowerCaseSearch) || item.category?.toLowerCase().includes(lowerCaseSearch));
    }
    return items;
  }, [pantryItems, debouncedSearchTerm, expiryFilter]);

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
        setModalState(closedModalState);
    } catch (error) {
        addToast('Speichern fehlgeschlagen.', 'error');
        console.error(error);
    }
      }, [addToast, closedModalState, setModalState]);

  // New Quick Add Function
  const handleQuickAdd = useCallback(async (input: string) => {
      const parsed = parseShoppingItemString(input);
      const category = getCategoryForItem(parsed.name);
      try {
        const { status, item } = await addOrUpdatePantryItem({
            ...parsed,
            category,
        });
        const message = status === 'added'
            ? `"${item.name}" hinzugefügt (${item.quantity} ${item.unit}).`
            : `"${item.name}" aktualisiert.`;
        addToast(message, 'success');
        } catch {
          addToast('Fehler beim Hinzufügen.', 'error');
      }
  }, [addToast]);
  
  const adjustQuantity = useCallback(async (item: PantryItem, amount: number) => {
    const newQuantity = item.quantity + amount;
    if (newQuantity < 0) return;
    if (newQuantity === 0) {
        setPendingAction({ type: 'removeItem', item });
    }
    else {
      await db.transaction('rw', db.pantry, async () => {
        await db.pantry.update(item.id!, { quantity: newQuantity, updatedAt: Date.now() });
      });
    }
  }, []);

  const toggleSelectItem = useCallback((id: number) => setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]), []);
  
  const toggleSelectMode = useCallback(() => { 
    setIsSelectMode(prev => !prev); 
    setSelectedItems([]); 
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedItems.length > 0) {
      setPendingAction({ type: 'deleteSelected', count: selectedItems.length, itemIds: selectedItems });
    }
  }, [selectedItems]);

  const confirmPendingAction = useCallback(async () => {
    if (!pendingAction) {
      return;
    }

    const actionToRun = pendingAction;
    setPendingAction(null);

    if (actionToRun.type === 'removeItem') {
      await db.transaction('rw', db.pantry, async () => {
        await db.pantry.delete(actionToRun.item.id!);
      });
      addToast(`"${actionToRun.item.name}" entfernt.`);
      return;
    }

    await db.transaction('rw', db.pantry, async () => {
      await db.pantry.bulkDelete(actionToRun.itemIds);
    });
    addToast(`${actionToRun.count} Artikel gelöscht.`);
    setIsSelectMode(false);
    setSelectedItems([]);
  }, [pendingAction, addToast]);

  const cancelPendingAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  const confirmationDialog = useMemo(() => {
    if (!pendingAction) {
      return null;
    }

    if (pendingAction.type === 'removeItem') {
      return {
        title: t('pantry.confirm.removeItemTitle'),
        description: t('pantry.confirm.removeItemDescription', { itemName: pendingAction.item.name }),
        actionLabel: t('common.delete'),
      };
    }

    return {
      title: t('pantry.confirm.deleteSelectedTitle'),
      description: t('pantry.confirm.deleteSelectedDescription', { count: pendingAction.count }),
      actionLabel: t('common.delete'),
    };
  }, [pendingAction, t]);
  
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
    searchTerm: effectiveSearchTerm, setSearchTerm: handleSearchTermChange, sortOrder, setSortOrder, isGrouped, setIsGrouped,
    expiryFilter, setExpiryFilter, modalState, setModalState, isSelectMode,
    selectedItems, pantryItems, filteredItems, groupedItems, searchInputRef,
    pendingAction, confirmationDialog, confirmPendingAction, cancelPendingAction,
    adjustQuantity, toggleSelectItem, toggleSelectMode, handleDeleteSelected,
    handleAddSelectedToShoppingList, handleSaveItem, handleAddToShoppingList, handleQuickAdd
  };
};