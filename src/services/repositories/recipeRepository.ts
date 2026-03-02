import { db } from '../dbInstance';
import { Recipe } from '../../types';
import { updatePantryMatches } from '../pantryMatcherService';
import { addShoppingListItem } from './shoppingListRepository';

export const syncSeedRecipes = async () => {
    try {
        const { allSeedRecipes: seedRecipes } = await import('../../data/recipes/index');
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

export const addRecipe = async (recipe: Omit<Recipe, 'id'>): Promise<number> => {
    const now = Date.now();
    return db.recipes.add({ ...recipe, isFavorite: recipe.isFavorite ?? false, updatedAt: now });
};

export const updateRecipeImage = async (recipeId: number, imageUrl: string): Promise<void> => {
    await db.recipes.update(recipeId, { imageUrl, updatedAt: Date.now() });
};

export const deleteRecipe = async (recipeId: number): Promise<void> => {
    await (db as any).transaction('rw', db.recipes, db.mealPlan, db.shoppingList, async () => {
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

    await (db as any).transaction('rw', db.shoppingList, async () => {
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