import Dexie, { type Table, Transaction } from 'dexie';
import { PantryItem, Recipe, MealPlanItem, ShoppingListItem, FullBackupData, IngredientGroup } from '../types';
import { seedRecipes } from '../data/seedData';
import { scaleIngredientQuantity, getCategoryForItem } from './utils';
import { updatePantryMatches, debouncedUpdateAllPantryMatches } from './pantryMatcherService';


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
        (this as Dexie).version(8).stores({
            pantry: '++id, name, expiryDate, createdAt, category, updatedAt',
            recipes: '++id, recipeTitle, isFavorite, *tags.course, *tags.cuisine, *tags.mainIngredient, updatedAt',
            mealPlan: '++id, date, recipeId, isCooked',
            shoppingList: '++id, name, isChecked, category, sortOrder, [category+sortOrder]',
        }).upgrade((tx: Transaction) => {
             return Promise.all([
                tx.table('pantry').toCollection().modify(item => {
                    if (item.updatedAt === undefined) item.updatedAt = item.createdAt;
                }),
                tx.table('recipes').toCollection().modify(item => {
                    if (item.updatedAt === undefined) item.updatedAt = Date.now();
                })
            ]);
        });

        (this as Dexie).version(9).stores({
            recipes: '++id, recipeTitle, isFavorite, *tags.course, *tags.cuisine, *tags.mainIngredient, updatedAt, pantryMatchPercentage',
        }).upgrade(tx => {
            return tx.table('recipes').toCollection().modify(item => {
                item.pantryMatchPercentage = 0;
                item.ingredientCount = item.ingredients.flatMap((g: IngredientGroup) => g.items).length;
            }).then(() => {
                // Trigger a full recalculation after the schema upgrade completes
                // This is deferred because the transaction needs to finish first
                // FIX: Wrap updatePantryMatches in an arrow function to avoid passing `undefined` from `then` as an argument.
                Promise.resolve().then(() => updatePantryMatches());
            });
        });

        (this as Dexie).on('populate', this.populateDB);
        this.setupHooks();
    }
    
    private populateDB = async () => {
      console.log("Populating database for the first time...");
      try {
          const now = Date.now();
          // ... (rest of the pantry item definitions)
          await this.pantry.bulkAdd([
              { name: 'Tomatenmark', quantity: 1, unit: 'Dose', category: 'Konserven', createdAt: now - 200000, updatedAt: now - 200000, expiryDate: new Date(2025, 1, 1).toISOString().split('T')[0] },
              { name: 'Knoblauch', quantity: 3, unit: 'Zehen', category: 'Frischeprodukte', createdAt: now - 100000, updatedAt: now - 100000 },
              { name: 'Zwiebel', quantity: 1, unit: 'Stück', category: 'Frischeprodukte', createdAt: now, updatedAt: now, minQuantity: 2 },
              { name: 'Spaghetti', quantity: 500, unit: 'g', category: 'Trockenwaren', createdAt: now - 300000, updatedAt: now - 300000 },
              { name: 'Olivenöl', quantity: 250, unit: 'ml', category: 'Öle & Essige', createdAt: now - 400000, updatedAt: now - 400000, minQuantity: 100 },
          ]);
          console.log("Default pantry items added.");

          if (seedRecipes.length > 0) {
              await this.recipes.bulkAdd(seedRecipes.map(r => ({ ...r, isFavorite: false, updatedAt: now })));
              console.log(`${seedRecipes.length} seed recipes added during initial population.`);
          }
          // After populating, calculate all matches
          await updatePantryMatches();
      } catch (error) {
          console.error("Failed during initial database population:", error);
      }
    }

    private setupHooks() {
        // When pantry changes, recalculate for all recipes (debounced)
        this.pantry.hook('creating', debouncedUpdateAllPantryMatches);
        this.pantry.hook('updating', debouncedUpdateAllPantryMatches);
        this.pantry.hook('deleting', debouncedUpdateAllPantryMatches);

        // When a recipe is created or updated, calculate for just that recipe
        this.recipes.hook('creating', (primKey, obj, trans) => {
            // Can't calculate before it exists, so do it after
            trans.on('complete', () => updatePantryMatches([primKey as number]));
        });
        this.recipes.hook('updating', (modifications, primKey, obj, trans) => {
            // Recalculate if ingredients changed. Since we don't have deep diffing, recalculate on any update.
            trans.on('complete', () => updatePantryMatches([primKey as number]));
        });
    }
}

export const db = new CulinaSyncDB() as CulinaSyncDB & Dexie;


export const syncSeedRecipes = async () => {
    try {
        const existingRecipes = await db.recipes.toArray();
        const existingSeedIds = new Set(existingRecipes.map(r => r.seedId).filter(Boolean));

        const newRecipes = seedRecipes.filter(seedRecipe => seedRecipe.seedId && !existingSeedIds.has(seedRecipe.seedId));

        if (newRecipes.length > 0) {
            console.log(`Syncing database: Found ${newRecipes.length} new seed recipes to add.`);
            const newIds = await db.recipes.bulkAdd(newRecipes.map(r => ({ ...r, isFavorite: false, updatedAt: Date.now() })), { allKeys: true });
            console.log("Database sync complete.");
            // Update matches for the newly added recipes
            await updatePantryMatches(newIds as number[]);
        } else {
            console.log("Database sync: No new seed recipes to add.");
        }
    } catch (error) {
        console.error("Failed to sync seed recipes:", error);
    }
};

db.open().then(syncSeedRecipes).catch(err => {
    console.error(`Failed to open and initialize database: ${(err as Error).stack || err}`);
});


// =======================================================================
// DATA MANAGEMENT FUNCTIONS
// =======================================================================

// ... (rest of the db service functions remain the same)
export const addOrUpdatePantryItem = async (
  item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ status: 'added' | 'updated'; item: PantryItem }> => {
  const now = Date.now();
  const existingItem = await db.pantry.where('name').equalsIgnoreCase(item.name).first();

  if (existingItem) {
    const newQuantity = existingItem.quantity + item.quantity;
    await db.pantry.update(existingItem.id!, { quantity: newQuantity, updatedAt: now });
    const updatedItem = { ...existingItem, quantity: newQuantity, updatedAt: now };
    return { status: 'updated', item: updatedItem };
  } else {
    const newItem: PantryItem = {
      ...item,
      category: item.category || getCategoryForItem(item.name),
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.pantry.add(newItem);
    return { status: 'added', item: { ...newItem, id } };
  }
};

export const removeItemFromPantry = async (name: string): Promise<boolean> => {
    const itemsDeleted = await db.pantry.where('name').equalsIgnoreCase(name).delete();
    return itemsDeleted > 0;
};

export const addPantryItemsToShoppingList = async (itemIds: number[]): Promise<number> => {
    const itemsToAdd = await db.pantry.where('id').anyOf(itemIds).toArray();
    const currentShoppingList = await db.shoppingList.toArray();
    const shoppingListNames = new Set(currentShoppingList.map(i => i.name.toLowerCase()));
    
    let count = 0;
    await db.transaction('rw', db.shoppingList, async () => {
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
    });
    return count;
};

// Shopping List Management
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
        await db.transaction('rw', db.pantry, db.shoppingList, async () => {
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
    await db.transaction('rw', db.shoppingList, async () => {
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

    await db.transaction('rw', db.shoppingList, async () => {
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

// Meal Plan Management
export const addRecipeToMealPlan = async (
    meal: Omit<MealPlanItem, 'id' | 'isCooked' | 'cookedDate'>
): Promise<number> => {
    return await db.mealPlan.add({
        ...meal,
        isCooked: false,
    });
};

export const removeRecipeFromMealPlan = async (mealId: number): Promise<void> => {
    await db.mealPlan.delete(mealId);
};

export const markMealAsCooked = async (mealId: number): Promise<{ success: boolean; changes: { updated: PantryItem[]; deleted: PantryItem[] } }> => {
    const meal = await db.mealPlan.get(mealId);
    if (!meal) {
        return { success: false, changes: { updated: [], deleted: [] } };
    }
    
    if (!meal.recipeId) { // It's a note
        await db.mealPlan.update(mealId, { isCooked: true, cookedDate: new Date().toISOString() });
        return { success: true, changes: { updated: [], deleted: [] } };
    }

    const recipe = await db.recipes.get(meal.recipeId);
    if (!recipe) { // Orphaned recipe
        await db.mealPlan.update(mealId, { isCooked: true, cookedDate: new Date().toISOString() });
        return { success: true, changes: { updated: [], deleted: [] } };
    }

    const recipeServings = parseInt(recipe.servings) || 1;
    const mealServings = meal.servings || recipeServings;
    const scaleFactor = mealServings > 0 && recipeServings > 0 ? mealServings / recipeServings : 1;
    
    const ingredients = recipe.ingredients.flatMap(group => group.items);
    
    const updated: PantryItem[] = [];
    const deleted: PantryItem[] = [];

    await db.transaction('rw', db.pantry, db.mealPlan, async () => {
        for (const ingredient of ingredients) {
            const requiredQtyStr = scaleIngredientQuantity(ingredient.quantity, scaleFactor);
            const requiredQty = parseFloat(requiredQtyStr.replace(',', '.')) || 0;
            if (requiredQty === 0) continue;

            const pantryItem = await db.pantry.where('name').equalsIgnoreCase(ingredient.name).first();
            if (pantryItem) {
                const newQuantity = pantryItem.quantity - requiredQty;
                if (newQuantity <= 0) {
                    await db.pantry.delete(pantryItem.id!);
                    deleted.push(pantryItem);
                } else {
                    await db.pantry.update(pantryItem.id!, { quantity: newQuantity, updatedAt: Date.now() });
                    updated.push({ ...pantryItem, quantity: newQuantity });
                }
            }
        }
        await db.mealPlan.update(mealId, { isCooked: true, cookedDate: new Date().toISOString() });
    });
    
    return { success: true, changes: { updated, deleted } };
};


// Recipe Management
export const addRecipe = async (recipe: Omit<Recipe, 'id'>): Promise<number> => {
    const now = Date.now();
    return db.recipes.add({ ...recipe, isFavorite: recipe.isFavorite ?? false, updatedAt: now });
};

export const deleteRecipe = async (recipeId: number): Promise<void> => {
    await db.transaction('rw', db.recipes, db.mealPlan, db.shoppingList, async () => {
        await db.recipes.delete(recipeId);
        await db.mealPlan.where('recipeId').equals(recipeId).delete();
        await db.shoppingList.where('recipeId').equals(recipeId).modify({ recipeId: undefined });
    });
};

export const addMissingIngredientsToShoppingList = async (recipeId: number): Promise<number> => {
    const recipe = await db.recipes.get(recipeId);
    if (!recipe) return 0;

    const pantryItems = await db.pantry.toArray();
    const pantryMap = new Map<string, number>(pantryItems.map(item => [item.name.toLowerCase(), item.quantity]));

    const shoppingListItems = await db.shoppingList.where({isChecked: 0}).toArray();
    const shoppingListNames = new Set(shoppingListItems.map(item => item.name.toLowerCase()));

    const ingredients = recipe.ingredients.flatMap(g => g.items);
    let count = 0;

    await db.transaction('rw', db.shoppingList, async () => {
        for (const ing of ingredients) {
            const requiredQty = parseFloat(ing.quantity.replace(',', '.')) || 0;
            if (requiredQty === 0) continue;

            const nameLower = ing.name.toLowerCase();
            const pantryQty = pantryMap.get(nameLower) || 0;

            if (pantryQty < requiredQty && !shoppingListNames.has(nameLower)) {
                await addShoppingListItem({
                    name: ing.name,
                    quantity: Math.ceil(requiredQty - pantryQty),
                    unit: ing.unit,
                    isChecked: false,
                    recipeId: recipe.id,
                });
                count++;
            }
        }
    });

    return count;
};

// Data Import/Export
export const importData = async (data: FullBackupData): Promise<void> => {
    await db.transaction('rw', db.pantry, db.recipes, db.mealPlan, db.shoppingList, async () => {
        await db.pantry.clear();
        if (data.pantry) await db.pantry.bulkAdd(data.pantry);

        await db.recipes.clear();
        if (data.recipes) await db.recipes.bulkAdd(data.recipes);

        await db.mealPlan.clear();
        if (data.mealPlan) await db.mealPlan.bulkAdd(data.mealPlan);

        await db.shoppingList.clear();
        if (data.shoppingList) await db.shoppingList.bulkAdd(data.shoppingList);
    });
    // After import completes, trigger a full recalculation
    await updatePantryMatches();
};