import { db } from './db';
import { Recipe, PantryItem } from '../types';
// FIX: The `BulkUpdateChange` type is not exported from Dexie.
// Using an inline type definition that matches the expected structure for `bulkUpdate`.

// Debounce mechanism to prevent flooding updates on rapid pantry changes
let debounceTimeout: number | undefined;

const calculateMatch = (recipe: Recipe, pantryMap: Map<string, number>): { percentage: number; count: number } => {
    const allIngredients = recipe.ingredients.flatMap(g => g.items);
    const totalCount = allIngredients.length;
    if (totalCount === 0) return { percentage: 100, count: 0 };

    let haveCount = 0;
    for (const ingredient of allIngredients) {
        // Skip optional ingredients from match calculation for a more realistic "cookable" status
        if (ingredient.name.toLowerCase().includes('optional') || ingredient.name.toLowerCase().includes('nach geschmack')) {
            haveCount++;
            continue;
        }
        const requiredQty = parseFloat(ingredient.quantity.replace(',', '.')) || 0;
        const pantryQty = pantryMap.get(ingredient.name.toLowerCase()) || 0;
        if (pantryQty >= requiredQty) {
            haveCount++;
        }
    }
    const percentage = totalCount > 0 ? (haveCount / totalCount) * 100 : 100;
    return { percentage, count: totalCount };
};

export const updatePantryMatches = async (recipeIds?: number[]): Promise<void> => {
    console.log(`Updating pantry matches. Recipe IDs: ${recipeIds ? recipeIds.join(',') : 'All'}`);
    try {
        const pantryItems: PantryItem[] = await db.pantry.toArray();
        const pantryMap = new Map(pantryItems.map(item => [item.name.toLowerCase(), item.quantity]));

        const recipesToUpdate = recipeIds
            ? await db.recipes.where('id').anyOf(recipeIds).toArray()
            : await db.recipes.toArray();

        if (recipesToUpdate.length === 0) return;

        const updates: { key: number; changes: Partial<Recipe> }[] = [];
        
        for (const recipe of recipesToUpdate) {
            const { percentage, count } = calculateMatch(recipe, pantryMap);
            // Only update if there's a change to avoid unnecessary DB writes
            if (Math.round(percentage) !== recipe.pantryMatchPercentage || count !== recipe.ingredientCount) {
                updates.push({
                    key: recipe.id!,
                    changes: {
                        pantryMatchPercentage: Math.round(percentage),
                        ingredientCount: count
                    }
                });
            }
        }
        
        if (updates.length > 0) {
            await db.recipes.bulkUpdate(updates);
            console.log(`Successfully updated pantry match for ${updates.length} recipes.`);
        }
    } catch (error) {
        console.error("Failed to update pantry matches:", error);
    }
};

export const debouncedUpdateAllPantryMatches = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = window.setTimeout(() => {
        updatePantryMatches();
    }, 1500); // 1.5-second debounce
};