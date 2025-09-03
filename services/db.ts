import Dexie, { type Table } from 'dexie';
import { PantryItem, Recipe, MealPlanItem, ShoppingListItem } from '@/types';
import { seedRecipes } from '@/data/seedData';
import { scaleIngredientQuantity, getCategoryForItem } from '@/services/utils';

/**
 * @summary Defines the database structure using Dexie.js.
 * @description Each property represents a table (object store) in the IndexedDB.
 * The schema defines table names, primary keys, and indexed properties for efficient querying.
 */
// FIX: Switched to the standard Dexie subclassing pattern for robust typing.
// This resolves issues where Dexie methods (like .version, .on, .transaction) were not found on the db instance type.
class CulinaSyncDB extends Dexie {
    pantry!: Table<PantryItem, number>;
    recipes!: Table<Recipe, number>;
    mealPlan!: Table<MealPlanItem, number>;
    shoppingList!: Table<ShoppingListItem, number>;

    constructor() {
        super('CulinaSyncDB');
        this.version(5).stores({
            pantry: '++id, name, expiryDate, createdAt, category',
            recipes: '++id, recipeTitle, isFavorite, *tags.course, *tags.cuisine, *tags.mainIngredient',
            mealPlan: '++id, date, recipeId, isCooked',
            shoppingList: '++id, name, isChecked',
        });

        /**
         * @summary Handles the initial population of the database with default data.
         * @description This event fires only once when the database is first created with this version schema.
         * It pre-fills the pantry with some example items and adds all recipes from the seed data.
         */
        this.on('populate', async () => {
            console.log("Populating database for the first time...");
            try {
                const today = new Date();
                const expiringSoon = new Date();
                expiringSoon.setDate(today.getDate() + 2);
                const expired = new Date();
                expired.setDate(today.getDate() - 2);

                await this.pantry.bulkAdd([
                    { name: 'Tomatenmark', quantity: 1, unit: 'Dose', category: 'Konserven', createdAt: Date.now() - 200000, expiryDate: new Date(2025, 1, 1).toISOString().split('T')[0] },
                    { name: 'Knoblauch', quantity: 3, unit: 'Zehen', category: 'Frischeprodukte', createdAt: Date.now() - 100000 },
                    { name: 'Zwiebel', quantity: 1, unit: 'Stück', category: 'Frischeprodukte', createdAt: Date.now(), minQuantity: 2 },
                    { name: 'Spaghetti', quantity: 500, unit: 'g', category: 'Trockenwaren', createdAt: Date.now() - 300000 },
                    { name: 'Olivenöl', quantity: 250, unit: 'ml', category: 'Öle & Essige', createdAt: Date.now() - 400000, minQuantity: 100 },
                    { name: 'Milch', quantity: 1, unit: 'l', category: 'Milchprodukte', createdAt: Date.now() - 50000, expiryDate: expiringSoon.toISOString().split('T')[0] },
                    { name: 'Joghurt', quantity: 500, unit: 'g', category: 'Milchprodukte', createdAt: Date.now() - 60000, expiryDate: expired.toISOString().split('T')[0] },
                ]);
                console.log("Default pantry items added.");

                if (seedRecipes.length > 0) {
                    await this.recipes.bulkAdd(seedRecipes.map(r => ({ ...r, isFavorite: false })));
                    console.log(`${seedRecipes.length} seed recipes added during initial population.`);
                }
            } catch (error) {
                console.error("Failed during initial database population:", error);
            }
        });
    }
}

export const db = new CulinaSyncDB();


/**
 * @summary Synchronizes the recipe database with the static seed data file.
 * @description This checks for any recipes in `seedData.ts` that are not yet in the database
 * (by comparing `recipeTitle`) and adds them. This prevents duplicates on subsequent app loads
 * and allows for easy addition of new recipes to the app via the seed file.
 */
export const syncSeedRecipes = async () => {
    try {
        const existingTitles = new Set((await db.recipes.toArray()).map(r => r.recipeTitle));
        const newRecipes = seedRecipes.filter(seedRecipe => !existingTitles.has(seedRecipe.recipeTitle));

        if (newRecipes.length > 0) {
            console.log(`Syncing database: Found ${newRecipes.length} new recipes to add.`);
            await db.recipes.bulkAdd(newRecipes.map(r => ({ ...r, isFavorite: false })));
            console.log("Database sync complete.");
        } else {
            console.log("Database sync: No new recipes to add.");
        }
    } catch (error) {
        console.error("Failed to sync seed recipes:", error);
    }
};

// Open the database to ensure it's ready and sync recipes on app initialization.
// This makes the db instance available and seeded for any module that imports it.
db.open().then(syncSeedRecipes).catch(err => {
    console.error(`Failed to open and initialize database: ${err.stack || err}`);
});


// =======================================================================
// DATA MANAGEMENT FUNCTIONS
// =======================================================================

/**
 * @summary Imports data from a JSON object, overwriting all existing data.
 * @description This function uses a transaction to ensure atomicity: either all data is imported successfully, or no changes are made.
 * @param {any} data The data object to import, must contain properties for each table.
 * @returns {Promise<void>} A promise that resolves when the import is complete.
 * @throws {Error} Throws an error if the data structure is invalid.
 */
export const importData = async (data: any): Promise<void> => {
    try {
        if (!data.pantry || !data.recipes || !data.mealPlan || !data.shoppingList) {
            throw new Error("Invalid data structure for import. Required tables are missing.");
        }
        await db.transaction('rw', db.pantry, db.recipes, db.mealPlan, db.shoppingList, async () => {
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
        throw error; // Re-throw to be caught by the UI
    }
};

// =======================================================================
// PANTRY FUNCTIONS
// =======================================================================

/**
 * @summary Adds a new item to the pantry or updates the quantity if an item with the same name already exists.
 * @description If the item has an ID, it's treated as an update. Otherwise, it checks for an existing item by name (case-insensitive). If found, quantities are merged; if not, a new item is created.
 * @param {Omit<PantryItem, 'createdAt'> & { id?: number }} item The item to add or update.
 * @returns {Promise<{ status: 'added' | 'updated'; item: PantryItem }>} The status of the operation and the final item state.
 */
export const addOrUpdatePantryItem = async (
    item: Omit<PantryItem, 'createdAt'> & { id?: number }
): Promise<{ status: 'added' | 'updated'; item: PantryItem }> => {
    try {
        if (item.id) {
            await db.pantry.update(item.id, item);
            return { status: 'updated', item: item as PantryItem };
        }
        const existingItem = await db.pantry.where('name').equalsIgnoreCase(item.name.trim()).first();
        if (existingItem?.id) {
            const newQuantity = existingItem.quantity + item.quantity;
            await db.pantry.update(existingItem.id, { quantity: newQuantity });
            const updatedItem = { ...existingItem, quantity: newQuantity };
            return { status: 'updated', item: updatedItem };
        } else {
            const newItem: PantryItem = { ...item, name: item.name.trim(), createdAt: Date.now() };
            const id = await db.pantry.add(newItem);
            return { status: 'added', item: { ...newItem, id: Number(id) } };
        }
    } catch (error) {
        console.error("Failed to add or update pantry item:", item, error);
        throw error;
    }
};

/**
 * @summary Removes an item from the pantry by its name (case-insensitive).
 * @param {string} itemName The name of the item to remove.
 * @returns {Promise<boolean>} A promise that resolves to true if an item was found and removed, otherwise false.
 */
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
        throw error;
    }
};

// =======================================================================
// RECIPE FUNCTIONS
// =======================================================================

/**
 * @summary Adds a new recipe to the database, preventing duplicates by title.
 * @param {Recipe} recipe The recipe object to add.
 * @returns {Promise<number | undefined>} The ID of the newly added recipe, or the ID of the existing recipe if a duplicate was found.
 */
export const addRecipe = async (recipe: Recipe): Promise<number | undefined> => {
    try {
        const existing = await db.recipes.where('recipeTitle').equals(recipe.recipeTitle).first();
        if (existing) {
            console.warn(`Recipe "${recipe.recipeTitle}" already exists.`);
            return existing.id;
        }
        return db.recipes.add({ ...recipe, isFavorite: recipe.isFavorite || false });
    } catch (error) {
        console.error("Failed to add recipe:", recipe, error);
        throw error;
    }
};

/**
 * @summary Deletes a recipe and any associated meal plan entries.
 * @description Ensures data integrity by removing planned meals that reference the deleted recipe.
 * @param {number} id The ID of the recipe to delete.
 * @returns {Promise<any>} A promise that resolves when deletion is complete.
 */
export const deleteRecipe = async (id: number): Promise<any> => {
    try {
        // Use a transaction to ensure both operations succeed or fail together
        return await db.transaction('rw', db.recipes, db.mealPlan, async () => {
            await db.mealPlan.where('recipeId').equals(id).delete();
            return await db.recipes.delete(id);
        });
    } catch (error) {
        console.error(`Failed to delete recipe with id ${id}:`, error);
        throw error;
    }
};

// =======================================================================
// MEAL PLAN FUNCTIONS
// =======================================================================

/**
 * @summary Adds an entry to the meal plan.
 * @param {MealPlanItem} item The meal plan item to add.
 * @returns {Promise<number>} The ID of the newly added meal plan item.
 */
export const addRecipeToMealPlan = async (item: MealPlanItem): Promise<number> => {
    try {
        return await db.mealPlan.add(item);
    } catch (error) {
        console.error("Failed to add item to meal plan:", item, error);
        throw error;
    }
};

/**
 * @summary Removes an entry from the meal plan by its ID.
 * @param {number} id The ID of the meal plan item to remove.
 * @returns {Promise<void>} A promise that resolves when the item is removed.
 */
export const removeRecipeFromMealPlan = async (id: number): Promise<void> => {
    try {
        return await db.mealPlan.delete(id);
    } catch (error) {
        console.error(`Failed to remove meal plan item with id ${id}:`, error);
        throw error;
    }
};

/**
 * @summary Marks a meal as cooked and deducts the required ingredients from the pantry.
 * @param {number} mealPlanItemId The ID of the meal plan item.
 * @returns {Promise<{ success: boolean; changes?: { updated: string[], deleted: string[] } }>} An object indicating success and detailing the pantry changes.
 */
export const markMealAsCooked = async (mealPlanItemId: number): Promise<{ success: boolean; changes?: { updated: string[], deleted: string[] } }> => {
    try {
        const meal = await db.mealPlan.get(mealPlanItemId);
        if (!meal?.recipeId || meal.isCooked) return { success: false };

        await db.mealPlan.update(mealPlanItemId, { isCooked: true, cookedDate: new Date().toISOString() });
        const changes = await deductIngredientsFromPantry(meal.recipeId);
        return { success: true, changes };
    } catch (error) {
        console.error(`Failed to mark meal ${mealPlanItemId} as cooked:`, error);
        throw error;
    }
};

/**
 * @summary Helper to deduct ingredients for a cooked meal from the pantry.
 * @description This is an internal function called by `markMealAsCooked`.
 * @private
 * @param {number} recipeId The ID of the recipe whose ingredients should be deducted.
 * @returns {Promise<{ updated: string[], deleted: string[] }>} An object detailing which pantry items were updated or deleted.
 */
const deductIngredientsFromPantry = async (recipeId: number): Promise<{ updated: string[], deleted: string[] }> => {
    const recipe = await db.recipes.get(recipeId);
    if (!recipe) return { updated: [], deleted: [] };

    const allIngredients = recipe.ingredients.flatMap(g => g.items);
    const changes = { updated: [] as string[], deleted: [] as string[] };

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
                await db.pantry.update(pantryItem.id!, { quantity: newQty });
                changes.updated.push(`${pantryItem.name} (-${requiredQty.toFixed(1).replace(/\.0$/, '')} ${pantryItem.unit})`);
            }
        }
    }
    return changes;
};

// =======================================================================
// SHOPPING LIST FUNCTIONS
// =======================================================================

/**
 * @summary Adds a new item to the shopping list.
 * @param {Omit<ShoppingListItem, 'id'>} item The item to add.
 * @returns {Promise<number>} The ID of the newly added shopping list item.
 */
export const addShoppingListItem = async (item: Omit<ShoppingListItem, 'id'>): Promise<number> => {
    try {
        return await db.shoppingList.add(item as ShoppingListItem);
    } catch (error) {
        console.error("Failed to add shopping list item:", item, error);
        throw error;
    }
};

/**
 * @summary Updates an item on the shopping list, typically for checking/unchecking.
 * @param {ShoppingListItem} item The item with updated properties.
 * @returns {Promise<number>} A promise resolving to 1 if successful, 0 otherwise.
 */
export const updateShoppingListItem = async (item: ShoppingListItem): Promise<number> => {
    try {
        if (item.id) {
            return await db.shoppingList.update(item.id, { isChecked: item.isChecked });
        }
        return 0;
    } catch (error) {
        console.error(`Failed to update shopping list item ${item.id}:`, item, error);
        throw error;
    }
};

/**
 * @summary Clears all items from the shopping list after user confirmation.
 * @returns {Promise<number>} A promise resolving to the number of cleared items, or 0 if cancelled.
 */
export const clearShoppingList = async (): Promise<number> => {
    try {
        if (window.confirm('Möchtest du die Einkaufsliste wirklich komplett leeren?')) {
            const count = await db.shoppingList.count();
            await db.shoppingList.clear();
            return count;
        }
        return 0;
    } catch (error) {
        console.error("Failed to clear shopping list:", error);
        throw error;
    }
};

/**
 * @summary Adds selected pantry items to the shopping list if they aren't already on it.
 * @param {number[]} itemIds An array of pantry item IDs to add.
 * @returns {Promise<number>} The number of new items actually added to the list.
 */
export const addPantryItemsToShoppingList = async (itemIds: number[]): Promise<number> => {
    try {
        if (itemIds.length === 0) return 0;
        const items = await db.pantry.bulkGet(itemIds);
        const shoppingList = await db.shoppingList.toArray();
        const shoppingListSet = new Set(shoppingList.map(i => i.name.toLowerCase()));
        
        const itemsToAdd: Omit<ShoppingListItem, 'id'|'isChecked'>[] = items
            .filter((item): item is PantryItem => !!item && !shoppingListSet.has(item.name.toLowerCase()))
            .map(item => ({
                name: item.name,
                quantity: item.minQuantity || 1,
                unit: item.unit,
            }));
            
        if (itemsToAdd.length > 0) {
            await db.shoppingList.bulkAdd(itemsToAdd.map(item => ({ ...item, isChecked: false })) as ShoppingListItem[]);
        }
        return itemsToAdd.length;
    } catch (error) {
        console.error("Failed to add pantry items to shopping list:", error);
        throw error;
    }
};

/**
 * @summary Adds missing ingredients for a specific recipe to the shopping list.
 * @param {number} recipeId The ID of the recipe to check against the pantry.
 * @returns {Promise<number>} The number of new items added to the list.
 */
export const addMissingIngredientsToShoppingList = async (recipeId: number): Promise<number> => {
    try {
        const recipe = await db.recipes.get(recipeId);
        if (!recipe) return 0;

        const pantryMap = new Map((await db.pantry.toArray()).map(p => [p.name.toLowerCase(), p.quantity]));
        const shoppingListSet = new Set((await db.shoppingList.toArray()).map(i => i.name.toLowerCase()));
        
        const itemsToAdd: Omit<ShoppingListItem, 'id'|'isChecked'>[] = [];
        for (const ingredient of recipe.ingredients.flatMap(g => g.items)) {
            const nameLower = ingredient.name.toLowerCase();
            const pantryQty = pantryMap.get(nameLower) || 0;
            const requiredQty = parseFloat(ingredient.quantity) || 0;
            if (pantryQty < requiredQty && !shoppingListSet.has(nameLower)) {
                itemsToAdd.push({
                    name: ingredient.name,
                    quantity: Math.max(1, requiredQty - pantryQty), // Add what's missing, at least 1
                    unit: ingredient.unit || 'Stk.',
                    recipeId: recipeId,
                });
                shoppingListSet.add(nameLower); // Avoid adding duplicates from the same recipe check
            }
        }
        if (itemsToAdd.length > 0) {
            await db.shoppingList.bulkAdd(itemsToAdd.map(item => ({ ...item, isChecked: false })) as ShoppingListItem[]);
        }
        return itemsToAdd.length;
    } catch (error) {
        console.error(`Failed to add missing ingredients for recipe ${recipeId}:`, error);
        throw error;
    }
};

/**
 * @summary Generates a shopping list for multiple planned meals, aggregating required ingredients and checking against the pantry.
 * @param {number[]} mealPlanItemIds An array of meal plan item IDs.
 * @returns {Promise<{ added: number; existing: number; }>} The count of newly added and already existing items.
 */
export const addMissingIngredientsForMeals = async (mealPlanItemIds: number[]): Promise<{ added: number; existing: number; }> => {
    try {
        if (mealPlanItemIds.length === 0) return { added: 0, existing: 0 };
        const meals = (await db.mealPlan.bulkGet(mealPlanItemIds)).filter((m): m is MealPlanItem => !!m?.recipeId);
        const recipeIds = [...new Set(meals.map(m => m.recipeId!))];
        if (recipeIds.length === 0) return { added: 0, existing: 0 };
        
        const [recipes, pantryItems, shoppingListItems] = await Promise.all([
            db.recipes.bulkGet(recipeIds),
            db.pantry.toArray(),
            db.shoppingList.toArray()
        ]);

        const pantryMap = new Map(pantryItems.map(p => [p.name.toLowerCase(), p.quantity]));
        const shoppingListSet = new Set(shoppingListItems.map(i => i.name.toLowerCase()));
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
        
        const itemsToAdd: Omit<ShoppingListItem, 'id'|'isChecked'>[] = [];
        let existingCount = 0;
        for (const [key, item] of requiredItems.entries()) {
            const neededQty = item.quantity - (pantryMap.get(key) || 0);
            if (neededQty > 0) {
                if (shoppingListSet.has(key)) { existingCount++; continue; }
                itemsToAdd.push({ name: item.name, quantity: Math.ceil(neededQty * 10) / 10, unit: item.unit, recipeId: item.recipeId });
                shoppingListSet.add(key);
            }
        }
        
        if (itemsToAdd.length > 0) {
            await db.shoppingList.bulkAdd(itemsToAdd.map(item => ({ ...item, isChecked: false })) as ShoppingListItem[]);
        }
        return { added: itemsToAdd.length, existing: existingCount };
    } catch (error) {
        console.error("Failed to generate shopping list from meals:", error);
        throw error;
    }
};

/**
 * @summary Moves all checked items from the shopping list to the pantry.
 * @description Items are added to the pantry using the `addOrUpdatePantryItem` logic, which merges quantities if items already exist. Successfully moved items are then deleted from the shopping list.
 * @returns {Promise<number>} The number of items moved.
 */
export const moveCheckedToPantry = async (): Promise<number> => {
    try {
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
    } catch (error) {
        console.error("Failed to move checked items to pantry:", error);
        throw error;
    }
};
