// FIX: Changed Dexie import to use the named export `{ Dexie }`.
// This resolves a module resolution issue where TypeScript fails to recognize
// prototype methods on the extended Dexie class, causing errors like "property 'version' does not exist".
import { Dexie, type Table } from 'dexie';
import { PantryItem, Recipe, MealPlanItem, ShoppingListItem } from '@/types';
import { seedRecipes } from '@/data/seedData';


export class CulinaSyncDB extends Dexie {
  pantry!: Table<PantryItem>;
  recipes!: Table<Recipe>;
  mealPlan!: Table<MealPlanItem>;
  shoppingList!: Table<ShoppingListItem>;

  constructor() {
    super('CulinaSyncDB');
    this.version(4).stores({
      pantry: '++id, name, expiryDate, createdAt, category',
      recipes: '++id, recipeTitle, isFavorite, *tags.course, *tags.cuisine, *tags.mainIngredient',
      mealPlan: '++id, date, recipeId, isCooked',
      shoppingList: '++id, name, isChecked',
    });
  }
}

export const db = new CulinaSyncDB();

const populateRecipes = async () => {
    const recipesCount = await db.recipes.count();
    if (recipesCount === 0 && seedRecipes.length > 0) {
        console.log("Populating database with seed recipes...");
        try {
            await db.recipes.bulkAdd(seedRecipes.map(r => ({...r, isFavorite: false})));
            console.log(`${seedRecipes.length} recipes added.`);
        } catch (error) {
            console.error("Failed to populate recipes:", error);
        }
    }
}


// Function to populate initial data for demonstration
export const populateInitialData = async () => {
    const pantryCount = await db.pantry.count();
    if (pantryCount === 0) {
        const today = new Date();
        const expiringSoon = new Date();
        expiringSoon.setDate(today.getDate() + 2);
        const expired = new Date();
        expired.setDate(today.getDate() - 2);

        await db.pantry.bulkAdd([
            { name: 'Tomatenmark', quantity: 1, unit: 'Dose', category: 'Konserven', createdAt: Date.now() - 200000, expiryDate: new Date(2025, 1, 1).toISOString().split('T')[0] },
            { name: 'Knoblauch', quantity: 3, unit: 'Zehen', category: 'Frischeprodukte', createdAt: Date.now() - 100000 },
            { name: 'Zwiebel', quantity: 1, unit: 'Stück', category: 'Frischeprodukte', createdAt: Date.now() },
            { name: 'Spaghetti', quantity: 500, unit: 'g', category: 'Trockenwaren', createdAt: Date.now() - 300000 },
            { name: 'Olivenöl', quantity: 250, unit: 'ml', category: 'Öle & Essige', createdAt: Date.now() - 400000 },
            { name: 'Milch', quantity: 1, unit: 'l', category: 'Milchprodukte', createdAt: Date.now() - 50000, expiryDate: expiringSoon.toISOString().split('T')[0] },
            { name: 'Joghurt', quantity: 500, unit: 'g', category: 'Milchprodukte', createdAt: Date.now() - 60000, expiryDate: expired.toISOString().split('T')[0] },
        ]);
    }
    await populateRecipes();
};

// Call populate on app load
populateInitialData().catch(console.error);

// Data Import Function
export const importData = async (data: any) => {
    // Basic validation
    if (!data.pantry || !data.recipes || !data.mealPlan || !data.shoppingList) {
        throw new Error("Invalid data structure for import.");
    }

    if (!window.confirm("Möchtest du wirklich die Daten importieren? Alle aktuellen Daten werden überschrieben.")) {
        return;
    }

    await db.transaction('rw', db.pantry, db.recipes, db.mealPlan, db.shoppingList, async () => {
        // Clear existing data
        await db.pantry.clear();
        await db.recipes.clear();
        await db.mealPlan.clear();
        await db.shoppingList.clear();

        // Import new data
        await db.pantry.bulkAdd(data.pantry);
        await db.recipes.bulkAdd(data.recipes);
        await db.mealPlan.bulkAdd(data.mealPlan);
        await db.shoppingList.bulkAdd(data.shoppingList);
    });
};

// Pantry Functions
export const addOrUpdatePantryItem = async (
    item: Omit<PantryItem, 'id' | 'createdAt'>
): Promise<{ status: 'added' | 'updated'; item: PantryItem }> => {
    const existingItem = await db.pantry
        .where('name').equalsIgnoreCase(item.name)
        .first();

    if (existingItem && existingItem.id) {
        const newQuantity = existingItem.quantity + item.quantity;
        await db.pantry.update(existingItem.id, { quantity: newQuantity });
        const updatedItem = { ...existingItem, quantity: newQuantity };
        return { status: 'updated', item: updatedItem };
    } else {
        const newItem: PantryItem = {
            ...item,
            createdAt: Date.now(),
        };
        const id = await db.pantry.add(newItem);
        return { status: 'added', item: { ...newItem, id: Number(id) } };
    }
};


export const removeItemFromPantry = async (itemName: string): Promise<boolean> => {
    const item = await db.pantry.where('name').equalsIgnoreCase(itemName).first();
    if (item && item.id) {
        await db.pantry.delete(item.id);
        return true;
    }
    return false;
};


// Recipe Functions
export const addRecipe = async (recipe: Recipe) => {
  // Prevent duplicates based on title
  const existing = await db.recipes.where('recipeTitle').equals(recipe.recipeTitle).first();
  if (existing) {
    console.log("Recipe with this title already exists.");
    return existing.id;
  }
  return db.recipes.add({...recipe, isFavorite: recipe.isFavorite || false});
};

export const deleteRecipe = async (id: number) => {
  // Also remove from meal plan
  await db.mealPlan.where('recipeId').equals(id).delete();
  return db.recipes.delete(id);
};

// Helper for ingredient deduction
const deductIngredientsFromPantry = async (recipeId: number): Promise<{ updated: string[], deleted: string[] }> => {
    const recipe = await db.recipes.get(recipeId);
    if (!recipe) return { updated: [], deleted: [] };

    const allIngredients = recipe.ingredients.flatMap(g => g.items);
    const changes = { updated: [] as string[], deleted: [] as string[] };

    for (const ingredient of allIngredients) {
        const pantryItem = await db.pantry
            .where('name')
            .equalsIgnoreCase(ingredient.name)
            .first();

        if (pantryItem) {
            const requiredQty = parseFloat(ingredient.quantity);
            if (isNaN(requiredQty)) continue; // Skip if quantity is not a number like "eine Prise"

            const newQty = pantryItem.quantity - requiredQty;

            if (newQty <= 0) {
                await db.pantry.delete(pantryItem.id!);
                changes.deleted.push(`${pantryItem.name}`);
            } else {
                await db.pantry.update(pantryItem.id!, { quantity: newQty });
                changes.updated.push(`${pantryItem.name} (-${requiredQty.toFixed(1).replace(/\.0$/, '')} ${pantryItem.unit})`);
            }
        }
    }
    return changes;
}

// Meal Plan Functions
export const addRecipeToMealPlan = async (item: MealPlanItem) => {
  return db.mealPlan.add(item);
};

export const removeRecipeFromMealPlan = async (id: number) => {
  return db.mealPlan.delete(id);
}

export const markMealAsCooked = async (mealPlanItemId: number): Promise<{ success: boolean; changes?: { updated: string[], deleted: string[] } }> => {
    const meal = await db.mealPlan.get(mealPlanItemId);
    if (meal && !meal.isCooked) {
        await db.mealPlan.update(mealPlanItemId, { 
            isCooked: true, 
            cookedDate: new Date().toISOString()
        });
        const changes = await deductIngredientsFromPantry(meal.recipeId);
        return { success: true, changes };
    }
    return { success: false };
};


// Shopping List Functions
export const getShoppingList = () => {
  return db.shoppingList.toArray();
};

export const updateShoppingListItem = async (item: ShoppingListItem) => {
  if (item.id) {
    return db.shoppingList.update(item.id, { isChecked: item.isChecked });
  }
};

export const clearShoppingList = async () => {
    if (window.confirm('Möchtest du die Einkaufsliste wirklich komplett leeren?')) {
      return db.shoppingList.clear();
    }
    return 0;
}

export const addShoppingListItem = async (item: Omit<ShoppingListItem, 'id'>) => {
  return db.shoppingList.add(item as ShoppingListItem);
}

export const addMissingIngredientsToShoppingList = async (recipeId: number): Promise<number> => {
    const recipe = await db.recipes.get(recipeId);
    if (!recipe) return 0;

    const pantryItems = await db.pantry.toArray();
    const shoppingListItems = await db.shoppingList.toArray();

    const pantryMap = new Map<string, number>();
    pantryItems.forEach(p => pantryMap.set(p.name.toLowerCase(), p.quantity));
    
    const shoppingListSet = new Set<string>(shoppingListItems.map(i => i.name.toLowerCase()));
    
    const allIngredients = recipe.ingredients.flatMap(g => g.items);
    const itemsToAdd: Omit<ShoppingListItem, 'id'|'isChecked'>[] = [];

    for (const ingredient of allIngredients) {
        const nameLower = ingredient.name.toLowerCase();
        const pantryQty = pantryMap.get(nameLower) || 0;
        
        if (pantryQty <= 0 && !shoppingListSet.has(nameLower)) {
            itemsToAdd.push({
                name: ingredient.name,
                quantity: parseFloat(ingredient.quantity) || 1,
                unit: ingredient.unit || 'Stk.',
                recipeId: recipeId,
            });
            shoppingListSet.add(nameLower);
        }
    }
    
    if (itemsToAdd.length > 0) {
        await db.shoppingList.bulkAdd(itemsToAdd.map(item => ({ ...item, isChecked: false })) as ShoppingListItem[]);
    }

    return itemsToAdd.length;
};