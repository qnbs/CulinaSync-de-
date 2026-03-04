import { db } from '../dbInstance';
import { retry } from '../retryUtils';
import { Recipe } from '../../types';
import { updatePantryMatches } from '../pantryMatcherService';
import { addShoppingListItem } from './shoppingListRepository';

    try {
        const { allSeedRecipes: seedRecipes } = await import('../../data/recipes/index');
        const existingRecipes = await db.recipes.toArray();
        const existingSeedIds = new Set(existingRecipes.map(r => r.seedId).filter(Boolean));

        const newRecipes = seedRecipes.filter(seedRecipe => seedRecipe.seedId && !existingSeedIds.has(seedRecipe.seedId));

        if (newRecipes.length > 0) {
            if (import.meta.env.DEV) {
                console.log(`Syncing database: Found ${newRecipes.length} new seed recipes to add.`);
            }
            const newIds = await retry(() => db.recipes.bulkAdd(newRecipes.map(r => ({ ...r, isFavorite: false, updatedAt: Date.now() })), { allKeys: true }), 3, 500);
            if (import.meta.env.DEV) {
                console.log("Database sync complete.");
            }
            // Update matches for the newly added recipes
            await updatePantryMatches(newIds as number[]);
        } else {
            if (import.meta.env.DEV) {
                console.log("Database sync: No new seed recipes to add.");
            }
        }
    } catch (error) {
        console.error("Failed to sync seed recipes:", error);
    }
};

    const now = Date.now();
    return retry(() => db.recipes.add({ ...recipe, isFavorite: recipe.isFavorite ?? false, updatedAt: now }), 3, 500);
};

    await retry(() => db.recipes.update(recipeId, { imageUrl, updatedAt: Date.now() }), 3, 500);
};

    await retry(async () => {
        await (db as any).transaction('rw', db.recipes, db.mealPlan, db.shoppingList, async () => {
            await db.recipes.delete(recipeId);
            await db.mealPlan.where('recipeId').equals(recipeId).delete();
            await db.shoppingList.where('recipeId').equals(recipeId).modify({ recipeId: undefined });
        });
    }, 3, 500);
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