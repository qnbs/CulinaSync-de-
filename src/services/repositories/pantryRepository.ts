import { db } from '../dbInstance';
import { retry } from '../retryUtils';
import { PantryItem } from '../../types';
import { getCategoryForItem } from '../utils';
import { addShoppingListItem } from './shoppingListRepository';

export const addOrUpdatePantryItem = async (
  item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ status: 'added' | 'updated'; item: PantryItem }> => {
  return retry(() => db.transaction('rw', db.pantry, async () => {
    const now = Date.now();
    const existingItem = await db.pantry.where('name').equalsIgnoreCase(item.name).first();

    if (existingItem) {
      const newQuantity = existingItem.quantity + item.quantity;
      await db.pantry.update(existingItem.id!, { quantity: newQuantity, updatedAt: now });
      return {
        status: 'updated' as const,
        item: { ...existingItem, quantity: newQuantity, updatedAt: now },
      };
    }

    const newItem: PantryItem = {
      ...item,
      category: item.category || getCategoryForItem(item.name),
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.pantry.add(newItem);
    return { status: 'added' as const, item: { ...newItem, id } };
  }), 3, 500);
};

export const removeItemFromPantry = async (name: string): Promise<boolean> => {
    const itemsDeleted = await retry(() => db.transaction('rw', db.pantry, () => db.pantry.where('name').equalsIgnoreCase(name).delete()), 3, 500);
    return itemsDeleted > 0;
};

export const addPantryItemsToShoppingList = async (itemIds: number[]): Promise<number> => {
    let count = 0;
    await retry(() => db.transaction('rw', db.pantry, db.shoppingList, async () => {
        const itemsToAdd = await db.pantry.where('id').anyOf(itemIds).toArray();
        const currentShoppingList = await db.shoppingList.toArray();
        const shoppingListNames = new Set(currentShoppingList.map(i => i.name.toLowerCase()));

        for (const item of itemsToAdd) {
            if (!shoppingListNames.has(item.name.toLowerCase())) {
                const quantityToAdd = (item.minQuantity && item.minQuantity > item.quantity) ? item.minQuantity : 1;
                await addShoppingListItem({
                    name: item.name,
                    quantity: quantityToAdd,
                    unit: item.unit,
                    isChecked: false,
                });
                count++;
            }
        }
          }), 3, 500);
    return count;
};