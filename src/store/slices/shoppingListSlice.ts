import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ShoppingListItem } from '../../types';
import { 
    db, 
    updateShoppingListItem, 
    clearShoppingList, 
    addShoppingListItem, 
    moveCheckedToPantry, 
    renameShoppingListCategory, 
    batchAddShoppingListItems, 
    generateListFromMealPlan 
} from '../../services/db';
import { RootState } from '..';
import { parseShoppingItemString } from '../../services/utils';

interface ShoppingListState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    isAiModalOpen: boolean;
    isBulkAddModalOpen: boolean;
    editingItem: ShoppingListItem | null;
    editingCategory: { oldName: string; newName: string } | null;
    isCompletedVisible: boolean;
    isExportOpen: boolean;
    isShoppingMode: boolean;
    collapsedCategories: string[]; // Storing as array for serializability
    isGenerating: boolean;
    error: string | null;
}

const initialState: ShoppingListState = {
    status: 'idle',
    isAiModalOpen: false,
    isBulkAddModalOpen: false,
    editingItem: null,
    editingCategory: null,
    isCompletedVisible: true,
    isExportOpen: false,
    isShoppingMode: false,
    collapsedCategories: [],
    isGenerating: false,
    error: null,
};

// Async Thunks
export const toggleItemCheckedAsync = createAsyncThunk('shoppingList/toggleItem', async (item: ShoppingListItem) => {
    await updateShoppingListItem({ ...item, isChecked: !item.isChecked });
    return item.id;
});

export const clearListAsync = createAsyncThunk('shoppingList/clearList', async () => {
    const count = await clearShoppingList();
    return count;
});

export const generateFromPlanAsync = createAsyncThunk('shoppingList/generateFromPlan', async () => {
    const result = await generateListFromMealPlan();
    return result;
});

export const addItemAsync = createAsyncThunk('shoppingList/addItem', async (itemString: string) => {
    const parsed = parseShoppingItemString(itemString);
    const result = await addShoppingListItem({ ...parsed, isChecked: false });
    return { status: result.status, name: parsed.name };
});

export const addItemsAsync = createAsyncThunk('shoppingList/addItems', async (items: Omit<ShoppingListItem, 'id' | 'isChecked' | 'sortOrder' | 'category'>[]) => {
    const result = await batchAddShoppingListItems(items);
    return result;
});

export const renameCategoryAsync = createAsyncThunk('shoppingList/renameCategory', async ({ oldName, newName }: { oldName: string, newName: string }) => {
    await renameShoppingListCategory(oldName, newName);
    return { oldName, newName };
});

export const updateItemOrderAsync = createAsyncThunk('shoppingList/updateItemOrder', async (item: ShoppingListItem) => {
    await updateShoppingListItem(item);
    return item;
});

export const updateItemAsync = createAsyncThunk('shoppingList/updateItem', async (item: ShoppingListItem) => {
    await updateShoppingListItem(item);
    return item;
});

export const deleteItemAsync = createAsyncThunk('shoppingList/deleteItem', async (id: number) => {
    await db.shoppingList.delete(id);
    return id;
});

export const moveToPantryAsync = createAsyncThunk('shoppingList/moveToPantry', async () => {
    const count = await moveCheckedToPantry();
    return count;
});


const shoppingListSlice = createSlice({
    name: 'shoppingList',
    initialState,
    reducers: {
        setAiModalOpen: (state, action: PayloadAction<boolean>) => { state.isAiModalOpen = action.payload; },
        setBulkAddModalOpen: (state, action: PayloadAction<boolean>) => { state.isBulkAddModalOpen = action.payload; },
        setEditingItem: (state, action: PayloadAction<ShoppingListItem | null>) => { state.editingItem = action.payload; },
        setEditingCategory: (state, action: PayloadAction<{ oldName: string; newName: string } | null>) => { state.editingCategory = action.payload; },
        toggleCompletedVisible: (state) => { state.isCompletedVisible = !state.isCompletedVisible; },
        setExportOpen: (state, action: PayloadAction<boolean>) => { state.isExportOpen = action.payload; },
        setShoppingMode: (state, action: PayloadAction<boolean>) => { state.isShoppingMode = action.payload; },
        toggleCategoryCollapse: (state, action: PayloadAction<string>) => {
            const category = action.payload;
            const index = state.collapsedCategories.indexOf(category);
            if (index > -1) {
                state.collapsedCategories.splice(index, 1);
            } else {
                state.collapsedCategories.push(category);
            }
        },
        collapseAll: (state, action: PayloadAction<string[]>) => {
            state.collapsedCategories = Array.from(new Set([...state.collapsedCategories, ...action.payload]));
        },
        expandAll: (state) => {
            state.collapsedCategories = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateFromPlanAsync.pending, (state) => { state.isGenerating = true; })
            .addCase(generateFromPlanAsync.fulfilled, (state) => { state.isGenerating = false; })
            .addCase(generateFromPlanAsync.rejected, (state) => { state.isGenerating = false; })
            .addCase(renameCategoryAsync.fulfilled, (state, action) => {
                const { oldName, newName } = action.payload;
                const index = state.collapsedCategories.indexOf(oldName);
                if (index > -1) {
                    state.collapsedCategories[index] = newName;
                }
            });
    }
});

export const {
    setAiModalOpen,
    setBulkAddModalOpen,
    setEditingItem,
    setEditingCategory,
    toggleCompletedVisible,
    setExportOpen,
    setShoppingMode,
    toggleCategoryCollapse,
    collapseAll,
    expandAll
} = shoppingListSlice.actions;

export default shoppingListSlice.reducer;