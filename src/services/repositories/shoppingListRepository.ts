import { db } from '../dbInstance';
import { ShoppingListItem, Recipe } from '../../types';
import { getCategoryForItem, scaleIngredientQuantity } from '../utils';
import { addOrUpdatePantryItem } from './pantryRepository';

export const addShoppingListItem = async (
  item: Omit<ShoppingListItem, 'id' | 'sortOrder' | 'category'>
): Promise<{ status: 'added' | 'updated'; item: ShoppingListItem }> => {
  const existingItem = await db.shoppingList.where('name').equalsIgnoreCase(item.name).and(i => !i.isChecked).first();
  const category = getCategoryForItem(item.name);

  if (existingItem) {
    const newQuantity = existingItem.quantity + item.quantity;
    await db.shoppingList.update(existingItem.id!, { quantity: newQuantity });
    const updatedItem = { ...existingItem, quantity: newQuantity };
    return { status: 'updated', item: updatedItem };
  } else {
    const maxSortOrderItem = await db.shoppingList.where('category').equals(category).last();
    const sortOrder = maxSortOrderItem ? maxSortOrderItem.sortOrder + 100 : 100;
    const newItem: ShoppingListItem = {
      ...item,
      category,
      sortOrder,
    };
    const id = await db.shoppingList.add(newItem);
    return { status: 'added', item: { ...newItem, id } };
  }
};

export const updateShoppingListItem = async (item: ShoppingListItem): Promise<void> => {
    if (item.id === undefined) return;
    await db.shoppingList.update(item.id, item);
};

export const clearShoppingList = async (): Promise<number> => {
    const count = await db.shoppingList.count();
    if(count > 0) {
        await db.shoppingList.clear();
    }
    return count;
};

export const moveCheckedToPantry = async (): Promise<number> => {
    const checkedItems = await db.shoppingList.where('isChecked').equals(1).toArray();
    let movedCount = 0;
    if (checkedItems.length > 0) {
        await (db as any).transaction('rw', db.pantry, db.shoppingList, async () => {
            for (const item of checkedItems) {
                await addOrUpdatePantryItem({
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    category: item.category,
                });
                await db.shoppingList.delete(item.id!);
                movedCount++;
            }
        });
    }
    return movedCount;
};

export const renameShoppingListCategory = async (oldName: string, newName: string): Promise<void> => {
    await db.shoppingList.where('category').equals(oldName).modify({ category: newName });
};

export const batchAddShoppingListItems = async (items: Omit<ShoppingListItem, 'id'|'isChecked'|'sortOrder'|'category'>[]): Promise<{ added: number, updated: number }> => {
    let added = 0;
    let updated = 0;
    await (db as any).transaction('rw', db.shoppingList, async () => {
        for (const item of items) {
            const { status } = await addShoppingListItem({ ...item, isChecked: false });
            if (status === 'added') added++;
            else updated++;
        }
    });
    return { added, updated };
};

export const generateListFromMealPlan = async (): Promise<{ added: number, existing: number }> => {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = oneWeekFromNow.toISOString().split('T')[0];

    const upcomingMeals = await db.mealPlan.where('date').between(startDate, endDate, true, true).filter(meal => !meal.isCooked && !!meal.recipeId).toArray();
    const recipeIds = upcomingMeals.map(meal => meal.recipeId!);
    const recipes = await db.recipes.where('id').anyOf(recipeIds).toArray();
    const recipesById = new Map<number, Recipe>(recipes.map(r => [r.id!, r]));

    const neededIngredients = new Map<string, { quantity: number; unit: string; recipeId?: number; name: string }>();

    for (const meal of upcomingMeals) {
        const recipe = recipesById.get(meal.recipeId!);
        if (!recipe) continue;
        
        const recipeServings = parseInt(recipe.servings) || 1;
        const mealServings = meal.servings || recipeServings;
        const scaleFactor = mealServings / recipeServings;

        for (const group of recipe.ingredients) {
            for (const item of group.items) {
                const scaledQtyStr = scaleIngredientQuantity(item.quantity, scaleFactor);
                const qty = parseFloat(scaledQtyStr.replace(',', '.')) || 0;
                if (qty === 0) continue;

                const key = `${item.name.toLowerCase()}|${item.unit}`;
                if (neededIngredients.has(key)) {
                    neededIngredients.get(key)!.quantity += qty;
                } else {
                    neededIngredients.set(key, { quantity: qty, unit: item.unit, recipeId: recipe.id, name: item.name });
                }
            }
        }
    }

    const pantryItems = await db.pantry.toArray();
    const pantryMap = new Map<string, number>(pantryItems.map(p => [p.name.toLowerCase(), p.quantity]));

    const shoppingListItems = await db.shoppingList.where('isChecked').equals(0).toArray();
    const shoppingListNames = new Set(shoppingListItems.map(i => i.name.toLowerCase()));

    let added = 0;
    let existing = 0;

    await (db as any).transaction('rw', db.shoppingList, async () => {
        for (const [key, needed] of neededIngredients.entries()) {
            const [nameLower] = key.split('|');
            const pantryQty = pantryMap.get(nameLower) || 0;
            const required = needed.quantity - pantryQty;

            if (required > 0) {
                if (shoppingListNames.has(nameLower)) {
                    existing++;
                } else {
                    await addShoppingListItem({
                        name: needed.name,
                        quantity: Math.ceil(required), // Round up to be safe
                        unit: needed.unit,
                        recipeId: needed.recipeId,
                        isChecked: false,
                    });
                    added++;
                }
            }
        }
    });
    
    return { added, existing };
};