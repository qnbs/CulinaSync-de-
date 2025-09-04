import Dexie, { type Table, Transaction } from 'dexie';
import { PantryItem, Recipe, MealPlanItem, ShoppingListItem } from '@/types';
import { seedRecipes } from '@/data/seedData';
import { scaleIngredientQuantity, getCategoryForItem } from './utils';

/**
 * @summary Defines the database structure using Dexie.js.
 * @description Each property represents a table (object store) in the IndexedDB.
 * The schema defines table names, primary keys, and indexed properties for efficient querying.
 */
class CulinaSyncDB extends Dexie {
    pantry!: Table<PantryItem, number>;
    recipes!: Table<Recipe, number>;
    mealPlan!: Table<MealPlanItem, number>;
    shoppingList!: Table<ShoppingListItem, number>;

    constructor() {
        super('CulinaSyncDB');
        // FIX: Cast `this` to `any` to resolve TypeScript error where Dexie methods are not found on the subclass type.
        (this as any).version(8).stores({
            pantry: '++id, name, expiryDate, createdAt, category, updatedAt',
            recipes: '++id, recipeTitle, isFavorite, *tags.course, *tags.cuisine, *tags.mainIngredient, updatedAt',
            mealPlan: '++id, date, recipeId, isCooked',
            shoppingList: '++id, name, isChecked, category, sortOrder, [category+sortOrder]',
        }).upgrade((tx: Transaction) => {
             // Upgrade logic for adding updatedAt field to pantry and recipes
            tx.table('pantry').toCollection().modify(item => {
                if (item.updatedAt === undefined) item.updatedAt = item.createdAt;
            });
            tx.table('recipes').toCollection().modify(item => {
                if (item.updatedAt === undefined) item.updatedAt = Date.now();
            });
        });

        // FIX: Cast `this` to `any` to resolve TypeScript error where Dexie methods are not found on the subclass type.
        (this as any).on('populate', async () => {
            console.log("Populating database for the first time...");
            try {
                const now = Date.now();
                const expiringSoon = new Date();
                expiringSoon.setDate(new Date().getDate() + 2);
                const expired = new Date();
                expired.setDate(new Date().getDate() - 2);

                await this.pantry.bulkAdd([
                    { name: 'Tomatenmark', quantity: 1, unit: 'Dose', category: 'Konserven', createdAt: now - 200000, updatedAt: now - 200000, expiryDate: new Date(2025, 1, 1).toISOString().split('T')[0] },
                    { name: 'Knoblauch', quantity: 3, unit: 'Zehen', category: 'Frischeprodukte', createdAt: now - 100000, updatedAt: now - 100000 },
                    { name: 'Zwiebel', quantity: 1, unit: 'Stück', category: 'Frischeprodukte', createdAt: now, updatedAt: now, minQuantity: 2 },
                    { name: 'Spaghetti', quantity: 500, unit: 'g', category: 'Trockenwaren', createdAt: now - 300000, updatedAt: now - 300000 },
                    { name: 'Olivenöl', quantity: 250, unit: 'ml', category: 'Öle & Essige', createdAt: now - 400000, updatedAt: now - 400000, minQuantity: 100 },
                    { name: 'Milch', quantity: 1, unit: 'l', category: 'Milchprodukte', createdAt: now - 50000, updatedAt: now - 50000, expiryDate: expiringSoon.toISOString().split('T')[0] },
                    { name: 'Joghurt', quantity: 500, unit: 'g', category: 'Milchprodukte', createdAt: now - 60000, updatedAt: now - 60000, expiryDate: expired.toISOString().split('T')[0] },
                ]);
                console.log("Default pantry items added.");

                if (seedRecipes.length > 0) {
                    await this.recipes.bulkAdd(seedRecipes.map(r => ({ ...r, isFavorite: false, updatedAt: now })));
                    console.log(`${seedRecipes.length} seed recipes added during initial population.`);
                }
            } catch (error) {
                console.error("Failed during initial database population:", error);
            }
        });
    }
}

export const db = new CulinaSyncDB();


export const syncSeedRecipes = async () => {
    try {
        const existingTitles = new Set((await db.recipes.toArray()).map(r => r.recipeTitle));
        const newRecipes = seedRecipes.filter(seedRecipe => !existingTitles.has(seedRecipe.recipeTitle));

        if (newRecipes.length > 0) {
            console.log(`Syncing database: Found ${newRecipes.length} new recipes to add.`);
            await db.recipes.bulkAdd(newRecipes.map(r => ({ ...r, isFavorite: false, updatedAt: Date.now() })));
            console.log("Database sync complete.");
        } else {
            console.log("Database sync: No new recipes to add.");
        }
    } catch (error) {
        console.error("Failed to sync seed recipes:", error);
    }
};

// FIX: Cast `db` to `any` to resolve TypeScript error where Dexie methods are not found on the subclass type.
(db as any).open().then(syncSeedRecipes).catch(err => {
    console.error(`Failed to open and initialize database: ${err.stack || err}`);
});


// =======================================================================
// DATA MANAGEMENT FUNCTIONS
// =======================================================================

export const importData = async (data: any): Promise<void> => {
    try {
        if (!data.pantry || !data.recipes || !data.mealPlan || !data.shoppingList) {
            throw new Error("Invalid data structure for import. Required tables are missing.");
        }
        // FIX: Cast `db` to `any` to resolve TypeScript error where Dexie methods are not found on the subclass type.
        await (db as any).transaction('rw', db.pantry, db.recipes, db.mealPlan, db.shoppingList, async () => {
            console.log("Starting data import, clearing existing data...");
            await Promise.all([
                db.pantry.clear(),
                db.recipes.clear(),
                db.mealPlan.clear(),
                db.shoppingList.clear(),
            ]);
            console.log("Bulk adding new data...");
            await Promise.all([
                db.pantry.bulkAdd(data.pantry),
                db.recipes.bulkAdd(data.recipes),
                db.mealPlan.bulkAdd(data.mealPlan),
                db.shoppingList.bulkAdd(data.shoppingList),
            ]);
        });
        console.log("Data import successful.");
    } catch (error) {
        console.error("Data import failed:", error);
        throw new Error(`Datenimport fehlgeschlagen: ${error instanceof Error ? error.message : String(error)}`);
    }
};

// =======================================================================
// PANTRY FUNCTIONS
// =======================================================================

export const addOrUpdatePantryItem = async (
    item: Omit<PantryItem, 'createdAt' | 'updatedAt'> & { id?: number }
): Promise<{ status: 'added' | 'updated'; item: PantryItem }> => {
    const now = Date.now();
    try {
        const trimmedName = item.name.trim();
        const existingItem = await db.pantry.where('name').equalsIgnoreCase(trimmedName).first();
        
        if (existingItem?.id) {
            const newQuantity = (existingItem.quantity || 0) + (item.quantity || 0);
            await db.pantry.update(existingItem.id, { quantity: newQuantity, updatedAt: now });
            const updatedItem = { ...existingItem, quantity: newQuantity, updatedAt: now };
            return { status: 'updated', item: updatedItem };
        } else {
            const newItem: PantryItem = { ...item, name: trimmedName, createdAt: now, updatedAt: now };
            const id = await db.pantry.add(newItem);
            return { status: 'added', item: { ...newItem, id: Number(id) } };
        }
    } catch (error) {
        console.error("Failed to add or update pantry item:", item, error);
        throw new Error(`Fehler beim Hinzufügen/Aktualisieren des Vorratsartikels: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const removeItemFromPantry = async (itemName: string): Promise<boolean> => {
    try {
        const item = await db.pantry.where('name').equalsIgnoreCase(itemName).first();
        if (item?.id) {
            await db.pantry.delete(item.id);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Failed to remove pantry item "${itemName}":`, error);
        throw new Error(`Fehler beim Entfernen des Vorratsartikels "${itemName}": ${error instanceof Error ? error.message : String(error)}`);
    }
};

// =======================================================================
// RECIPE FUNCTIONS
// =======================================================================

export const addRecipe = async (recipe: Recipe): Promise<number | undefined> => {
    try {
        const existing = await db.recipes.where('recipeTitle').equals(recipe.recipeTitle).first();
        if (existing) {
            console.warn(`Recipe "${recipe.recipeTitle}" already exists.`);
            return existing.id;
        }
        return db.recipes.add({ ...recipe, isFavorite: recipe.isFavorite || false, updatedAt: Date.now() });
    } catch (error) {
        console.error("Failed to add recipe:", recipe, error);
        throw new Error(`Fehler beim Hinzufügen des Rezepts: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const deleteRecipe = async (id: number): Promise<any> => {
    try {
        // FIX: Cast `db` to `any` to resolve TypeScript error where Dexie methods are not found on the subclass type.
        return await (db as any).transaction('rw', db.recipes, db.mealPlan, async () => {
            await db.mealPlan.where('recipeId').equals(id).delete();
            return await db.recipes.delete(id);
        });
    } catch (error) {
        console.error(`Failed to delete recipe with id ${id}:`, error);
        throw new Error(`Fehler beim Löschen des Rezepts mit ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
};

// =======================================================================
// MEAL PLAN FUNCTIONS
// =======================================================================

export const addRecipeToMealPlan = async (item: MealPlanItem): Promise<number> => {
    try {
        return await db.mealPlan.add(item);
    } catch (error) {
        console.error("Failed to add item to meal plan:", item, error);
        throw new Error(`Fehler beim Hinzufügen zum Essensplan: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const removeRecipeFromMealPlan = async (id: number): Promise<void> => {
    try {
        return await db.mealPlan.delete(id);
    } catch (error) {
        console.error(`Failed to remove meal plan item with id ${id}:`, error);
        throw new Error(`Fehler beim Entfernen vom Essensplan mit ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const markMealAsCooked = async (mealPlanItemId: number): Promise<{ success: boolean; changes?: { updated: string[], deleted: string[] } }> => {
    try {
        // FIX: Cast `db` to `any` to resolve TypeScript error where Dexie methods are not found on the subclass type.
        const result = await (db as any).transaction('rw', db.mealPlan, db.pantry, db.recipes, async () => {
            const meal = await db.mealPlan.get(mealPlanItemId);
            if (!meal?.recipeId || meal.isCooked) return { success: false };

            await db.mealPlan.update(mealPlanItemId, { isCooked: true, cookedDate: new Date().toISOString() });
            const changes = await deductIngredientsFromPantry(meal.recipeId);
            return { success: true, changes };
        });
        return result;
    } catch (error) {
        console.error(`Failed to mark meal ${mealPlanItemId} as cooked:`, error);
        throw new Error(`Fehler beim Markieren der Mahlzeit ${mealPlanItemId} als gekocht: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const deductIngredientsFromPantry = async (recipeId: number): Promise<{ updated: string[], deleted: string[] }> => {
    const recipe = await db.recipes.get(recipeId);
    if (!recipe) return { updated: [], deleted: [] };

    const allIngredients = recipe.ingredients.flatMap(g => g.items);
    const changes = { updated: [] as string[], deleted: [] as string[] };
    const now = Date.now();

    for (const ingredient of allIngredients) {
        const pantryItem = await db.pantry.where('name').equalsIgnoreCase(ingredient.name).first();
        if (pantryItem) {
            const requiredQty = parseFloat(ingredient.quantity);
            if (isNaN(requiredQty)) continue; // Skip if quantity is not a number
            
            const newQty = pantryItem.quantity - requiredQty;
            if (newQty <= 0) {
                await db.pantry.delete(pantryItem.id!);
                changes.deleted.push(pantryItem.name);
            } else {
                await db.pantry.update(pantryItem.id!, { quantity: newQty, updatedAt: now });
                changes.updated.push(`${pantryItem.name} (-${requiredQty.toFixed(1).replace(/\.0$/, '')} ${pantryItem.unit})`);
            }
        }
    }
    return changes;
};

// =======================================================================
// SHOPPING LIST FUNCTIONS
// =======================================================================

export const addShoppingListItem = async (item: Omit<ShoppingListItem, 'id' | 'sortOrder' | 'category' | 'isChecked'> & { isChecked: boolean }): Promise<{ status: 'added' | 'updated'; item: ShoppingListItem }> => {
    try {
        const trimmedName = item.name.trim();
        const existingItem = await db.shoppingList
            .where('name').equalsIgnoreCase(trimmedName)
            .and(i => i.unit === item.unit && i.isChecked === false)
            .first();
            
        if (existingItem) {
            const newQuantity = (existingItem.quantity || 0) + (item.quantity || 0);
            await db.shoppingList.update(existingItem.id!, { quantity: newQuantity });
            const updatedItem = { ...existingItem, quantity: newQuantity };
            return { status: 'updated', item: updatedItem };
        }

        const category = getCategoryForItem(trimmedName);
        const lastItemInCategory = await db.shoppingList.where({ category }).last();
        const sortOrder = lastItemInCategory ? lastItemInCategory.sortOrder + 1000 : 1000;
        
        const newItem: Omit<ShoppingListItem, 'id'> = {
            ...item,
            name: trimmedName,
            category,
            sortOrder,
        };
        const id = await db.shoppingList.add(newItem as ShoppingListItem);
        return { status: 'added', item: { ...newItem, id: Number(id) } };
    } catch (error) {
        console.error("Failed to add shopping list item:", item, error);
        throw new Error(`Fehler beim Hinzufügen zum Einkaufzettel: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const batchAddShoppingListItems = async (
    itemsToAdd: Omit<ShoppingListItem, 'id' | 'isChecked' | 'category' | 'sortOrder'>[]
): Promise<{ added: number; updated: number }> => {
    if (itemsToAdd.length === 0) return { added: 0, updated: 0 };

    try {
        return await (db as any).transaction('rw', db.shoppingList, async () => {
            const existingUncheckedItems = await db.shoppingList.where('isChecked').equals(0).toArray();
            // FIX: Explicitly type Map to ensure correct type inference for `existing`.
            const existingMap: Map<string, ShoppingListItem> = new Map(
                existingUncheckedItems.map((i: ShoppingListItem) => [`${i.name.toLowerCase()}_${i.unit.toLowerCase()}`, i])
            );

            const itemsToUpdate: ShoppingListItem[] = [];
            const newItems: Omit<ShoppingListItem, 'id'>[] = [];

            for (const item of itemsToAdd) {
                const key = `${item.name.toLowerCase()}_${item.unit.toLowerCase()}`;
                const existing = existingMap.get(key);

                if (existing) {
                    existing.quantity += item.quantity;
                    itemsToUpdate.push(existing);
                } else {
                    const newItem: Omit<ShoppingListItem, 'id' | 'sortOrder' | 'category' | 'isChecked'> = { ...item };
                    newItems.push({ ...newItem, isChecked: false, category: getCategoryForItem(item.name), sortOrder: 0 });
                    existingMap.set(key, { ...item, id: -1, isChecked: false, category: getCategoryForItem(item.name), sortOrder: 0 }); // Prevent duplicates in same batch
                }
            }
            
            const categories = [...new Set(newItems.map(i => (i as any).category))];
            const maxSortOrders = new Map<string, number>();

            for (const cat of categories) {
                const lastItem = await db.shoppingList.where({ category: cat }).last();
                maxSortOrders.set(cat, lastItem ? lastItem.sortOrder : 0);
            }
            
            const finalNewItems = newItems.map(item => {
                const typedItem = item as ShoppingListItem;
                const currentMax = maxSortOrders.get(typedItem.category)!;
                const newSortOrder = currentMax + 1000;
                maxSortOrders.set(typedItem.category, newSortOrder);
                return { ...typedItem, sortOrder: newSortOrder };
            });

            if (itemsToUpdate.length > 0) {
                await db.shoppingList.bulkPut(itemsToUpdate);
            }
            if (finalNewItems.length > 0) {
                await db.shoppingList.bulkAdd(finalNewItems as ShoppingListItem[]);
            }
            
            return { added: finalNewItems.length, updated: itemsToUpdate.length };
        });
    } catch (error) {
        console.error("Failed to batch add shopping list items:", error);
        throw new Error(`Fehler beim gebündelten Hinzufügen zum Einkaufzettel: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const updateShoppingListItem = async (item: ShoppingListItem): Promise<number> => {
    try {
        if (item.id) {
            return await db.shoppingList.update(item.id, item);
        }
        return 0;
    } catch (error) {
        console.error(`Failed to update shopping list item ${item.id}:`, item, error);
        throw new Error(`Fehler beim Aktualisieren des Einkaufsartikels ${item.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const batchUpdateShoppingList = async (items: ShoppingListItem[]): Promise<void> => {
    try {
        await db.shoppingList.bulkPut(items);
    } catch (error) {
        console.error("Failed to batch update shopping list:", error);
        throw new Error(`Fehler beim gebündelten Aktualisieren der Einkaufsliste: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const renameShoppingListCategory = async (oldName: string, newName: string): Promise<number> => {
    try {
        return await db.shoppingList.where('category').equals(oldName).modify({ category: newName });
    } catch (error) {
        console.error(`Failed to rename category from "${oldName}" to "${newName}":`, error);
        throw new Error(`Fehler beim Umbenennen der Kategorie von "${oldName}" zu "${newName}": ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const clearShoppingList = async (): Promise<number> => {
    try {
        const count = await db.shoppingList.count();
        await db.shoppingList.clear();
        return count;
    } catch (error) {
        console.error("Failed to clear shopping list:", error);
        throw new Error(`Fehler beim Leeren der Einkaufsliste: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const addPantryItemsToShoppingList = async (itemIds: number[]): Promise<number> => {
    try {
        if (itemIds.length === 0) return 0;
        const items = await db.pantry.bulkGet(itemIds);
        const shoppingList = await db.shoppingList.toArray();
        const shoppingListSet = new Set(shoppingList.map(i => i.name.toLowerCase()));
        
        const itemsToAdd: Omit<ShoppingListItem, 'id'|'isChecked'|'category'|'sortOrder'>[] = items
            .filter((item): item is PantryItem => !!item && !shoppingListSet.has(item.name.toLowerCase()))
            .map((item) => ({
                name: item.name,
                quantity: item.minQuantity || 1,
                unit: item.unit
            }));
            
        let addedCount = 0;
        if (itemsToAdd.length > 0) {
            for (const item of itemsToAdd) {
                await addShoppingListItem({ ...item, isChecked: false });
                addedCount++;
            }
        }
        return addedCount;
    } catch (error) {
        console.error("Failed to add pantry items to shopping list:", error);
        throw new Error(`Fehler beim Hinzufügen von Vorratsartikeln zur Einkaufsliste: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const addMissingIngredientsToShoppingList = async (recipeId: number): Promise<number> => {
    try {
        const recipe = await db.recipes.get(recipeId);
        if (!recipe) return 0;

        // FIX: Add explicit type to lambda parameter to fix type inference issues.
        // FIX: Explicitly type Map to ensure correct type inference for `pantryQty`.
        const pantryMap: Map<string, number> = new Map((await db.pantry.toArray()).map((p: PantryItem) => [p.name.toLowerCase(), p.quantity]));
        const shoppingListSet = new Set((await db.shoppingList.where({isChecked: 0}).toArray()).map(i => i.name.toLowerCase()));
        
        const itemsToAdd: Omit<ShoppingListItem, 'id'|'isChecked'|'category'|'sortOrder'>[] = [];
        for (const ingredient of recipe.ingredients.flatMap(g => g.items)) {
            const nameLower = ingredient.name.toLowerCase();
            const pantryQty = pantryMap.get(nameLower) || 0;
            const requiredQty = parseFloat(ingredient.quantity) || 0;
            if (pantryQty < requiredQty && !shoppingListSet.has(nameLower)) {
                itemsToAdd.push({
                    name: ingredient.name,
                    // FIX: Ensure pantryQty is treated as a number in arithmetic operation.
                    quantity: Math.max(1, requiredQty - Number(pantryQty)),
                    unit: ingredient.unit || 'Stk.',
                    recipeId: recipeId,
                });
                shoppingListSet.add(nameLower);
            }
        }
        if (itemsToAdd.length > 0) {
            for(const item of itemsToAdd) {
                await addShoppingListItem({ ...item, isChecked: false });
            }
        }
        return itemsToAdd.length;
    } catch (error) {
        console.error(`Failed to add missing ingredients for recipe ${recipeId}:`, error);
        throw new Error(`Fehler beim Hinzufügen fehlender Zutaten für Rezept ${recipeId}: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const addMissingIngredientsForMeals = async (mealPlanItemIds: number[]): Promise<{ added: number; existing: number; }> => {
    try {
        if (mealPlanItemIds.length === 0) return { added: 0, existing: 0 };
        const meals = (await db.mealPlan.bulkGet(mealPlanItemIds)).filter((m): m is MealPlanItem => !!m?.recipeId);
        const recipeIds = [...new Set(meals.map(m => m.recipeId!))];
        if (recipeIds.length === 0) return { added: 0, existing: 0 };
        
        const [recipes, pantryItems, shoppingListItems] = await Promise.all([
            db.recipes.bulkGet(recipeIds),
            db.pantry.toArray(),
            db.shoppingList.where({ isChecked: 0 }).toArray()
        ]);

        // FIX: Add explicit types to lambda parameters to fix type inference issues.
        // FIX: Explicitly type Map to ensure correct type inference.
        const pantryMap: Map<string, number> = new Map(pantryItems.map((p: PantryItem) => [p.name.toLowerCase(), p.quantity]));
        // FIX: Add explicit types to lambda parameters to fix type inference issues.
        // FIX: Explicitly type Map to ensure correct type inference.
        const shoppingListMap: Map<string, ShoppingListItem> = new Map(shoppingListItems.map((i: ShoppingListItem) => [i.name.toLowerCase(), i]));
        const requiredItems = new Map<string, { name: string; quantity: number; unit: string; recipeId: number; }>();

        meals.forEach(meal => {
            const recipe = recipes.find((r): r is Recipe => !!r && r.id === meal.recipeId);
            if (!recipe) return;
            const originalServings = parseInt(recipe.servings, 10) || 1;
            const scaleFactor = (meal.servings || originalServings) / originalServings;
            recipe.ingredients.flatMap(g => g.items).forEach(ingredient => {
                const requiredQty = parseFloat(scaleIngredientQuantity(ingredient.quantity, scaleFactor)) || 0;
                if (requiredQty === 0) return;
                const key = ingredient.name.toLowerCase();
                const existing = requiredItems.get(key);
                if (existing) {
                    existing.quantity += requiredQty;
                } else {
                    requiredItems.set(key, { name: ingredient.name, quantity: requiredQty, unit: ingredient.unit, recipeId: recipe.id! });
                }
            });
        });
        
        let addedCount = 0;
        let existingCount = 0;
        
        for (const [key, item] of requiredItems.entries()) {
            const neededQty = item.quantity - (pantryMap.get(key) || 0);
            if (neededQty > 0) {
                if (shoppingListMap.has(key)) {
                    const existingListItem = shoppingListMap.get(key)!;
                    const additionalQty = neededQty - existingListItem.quantity;
                    if(additionalQty > 0) {
                       await db.shoppingList.update(existingListItem.id!, { quantity: existingListItem.quantity + additionalQty });
                    }
                    existingCount++;
                } else {
                    await addShoppingListItem({ name: item.name, quantity: Math.ceil(neededQty * 10) / 10, unit: item.unit, recipeId: item.recipeId, isChecked: false });
                    addedCount++;
                }
            }
        }
        
        return { added: addedCount, existing: existingCount };
    } catch (error) {
        console.error("Failed to generate shopping list from meals:", error);
        throw new Error(`Fehler beim Generieren der Einkaufsliste aus Mahlzeiten: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const generateListFromMealPlan = async (): Promise<{ added: number; existing: number; }> => {
    try {
        const uncookedMeals = await db.mealPlan.where('isCooked').equals(0).toArray();
        if (uncookedMeals.length === 0) return { added: 0, existing: 0 };
        
        const uncookedMealIds = uncookedMeals.map(m => m.id!);
        return await addMissingIngredientsForMeals(uncookedMealIds);
    } catch (error) {
        console.error("Failed to generate shopping list from meal plan:", error);
        throw new Error(`Fehler beim Generieren der Einkaufsliste aus dem Essensplan: ${error instanceof Error ? error.message : String(error)}`);
    }
};


export const moveCheckedToPantry = async (): Promise<number> => {
    try {
        // FIX: Cast `db` to `any` to resolve TypeScript error where Dexie methods are not found on the subclass type.
        return await (db as any).transaction('rw', db.shoppingList, db.pantry, async () => {
            const checkedItems = await db.shoppingList.where('isChecked').equals(1).toArray();
            if (checkedItems.length === 0) return 0;
            
            for (const item of checkedItems) {
                await addOrUpdatePantryItem({
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    category: getCategoryForItem(item.name)
                });
            }
            
            await db.shoppingList.bulkDelete(checkedItems.map(item => item.id!));
            return checkedItems.length;
        });
    } catch (error) {
        console.error("Failed to move checked items to pantry:", error);
        throw new Error(`Fehler beim Verschieben der Artikel in den Vorrat: ${error instanceof Error ? error.message : String(error)}`);
    }
};