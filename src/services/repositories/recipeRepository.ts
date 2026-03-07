import { db } from '../dbInstance';
import { retry } from '../retryUtils';
import { Recipe } from '../../types';
import { updatePantryMatches } from '../pantryMatcherService';
import { addShoppingListItem } from './shoppingListRepository';

export const syncSeedRecipes = async (): Promise<void> => {
    try {
        const { allSeedRecipes: seedRecipes } = await import('../../data/recipes/index');

        await retry(async () => {
            const newIds = await db.transaction('rw', db.recipes, async () => {
                const existingRecipes = await db.recipes.toArray();
                const existingSeedIds = new Set(existingRecipes.map((recipe) => recipe.seedId).filter(Boolean));
                const newRecipes = seedRecipes.filter((seedRecipe) => seedRecipe.seedId && !existingSeedIds.has(seedRecipe.seedId));

                if (newRecipes.length === 0) {
                    if (import.meta.env.DEV) {
                        console.log('Database sync: No new seed recipes to add.');
                    }
                    return [] as number[];
                }

                if (import.meta.env.DEV) {
                    console.log(`Syncing database: Found ${newRecipes.length} new seed recipes to add.`);
                }

                return db.recipes.bulkAdd(
                    newRecipes.map((recipe) => ({ ...recipe, isFavorite: false, updatedAt: Date.now() })),
                    { allKeys: true },
                ) as Promise<number[]>;
            });

            if (newIds.length > 0) {
                await updatePantryMatches(newIds);
            }
        }, 3, 500);
    } catch (error) {
        console.error('Failed to sync seed recipes:', error);
    }
};

export const addRecipe = async (recipe: Omit<Recipe, 'id'>): Promise<number> => {
    return retry(() => db.transaction('rw', db.recipes, async () => {
        const now = Date.now();
        return db.recipes.add({ ...recipe, isFavorite: recipe.isFavorite ?? false, updatedAt: now });
    }), 3, 500);
};

export const updateRecipeImage = async (recipeId: number, imageUrl: string): Promise<void> => {
    await retry(() => db.transaction('rw', db.recipes, () => db.recipes.update(recipeId, { imageUrl, updatedAt: Date.now() })), 3, 500);
};

export const setRecipeFavorite = async (recipeId: number, isFavorite: boolean): Promise<void> => {
    await retry(() => db.transaction('rw', db.recipes, () => db.recipes.update(recipeId, { isFavorite, updatedAt: Date.now() })), 3, 500);
};

export const deleteRecipe = async (recipeId: number): Promise<void> => {
    await retry(() => db.transaction('rw', db.recipes, db.mealPlan, db.shoppingList, async () => {
        await db.recipes.delete(recipeId);
        await db.mealPlan.where('recipeId').equals(recipeId).delete();
        await db.shoppingList.where('recipeId').equals(recipeId).modify({ recipeId: undefined });
    }), 3, 500);
};

export const addMissingIngredientsToShoppingList = async (recipeId: number): Promise<number> => {
    const recipe = await db.recipes.get(recipeId);
    if (!recipe) {
        return 0;
    }

    return retry(() => db.transaction('rw', db.pantry, db.shoppingList, async () => {
        const pantryItems = await db.pantry.toArray();
        const pantryMap = new Map<string, number>(pantryItems.map((item) => [item.name.toLowerCase(), item.quantity]));
        const shoppingListItems = await db.shoppingList.where({ isChecked: 0 }).toArray();
        const shoppingListNames = new Set(shoppingListItems.map((item) => item.name.toLowerCase()));

        let count = 0;
        for (const ingredient of recipe.ingredients.flatMap((group) => group.items)) {
            const requiredQty = parseFloat(ingredient.quantity.replace(',', '.')) || 0;
            if (requiredQty === 0) {
                continue;
            }

            const nameLower = ingredient.name.toLowerCase();
            const pantryQty = pantryMap.get(nameLower) || 0;
            if (pantryQty < requiredQty && !shoppingListNames.has(nameLower)) {
                await addShoppingListItem({
                    name: ingredient.name,
                    quantity: Math.ceil(requiredQty - pantryQty),
                    unit: ingredient.unit,
                    isChecked: false,
                    recipeId: recipe.id,
                });
                shoppingListNames.add(nameLower);
                count += 1;
            }
        }

        return count;
    }), 3, 500);
};