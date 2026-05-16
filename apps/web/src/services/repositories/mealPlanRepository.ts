import { db } from '../dbInstance';
import { retry } from '../retryUtils';
import { MealPlanItem, PantryItem } from '../../types';
import { scaleIngredientQuantity } from '../utils';

export const addRecipeToMealPlan = async (
    meal: Omit<MealPlanItem, 'id' | 'isCooked' | 'cookedDate'>,
): Promise<number> => {
    return retry(() => db.transaction('rw', db.mealPlan, async () => db.mealPlan.add({
        ...meal,
        isCooked: false,
    })), 3, 500);
};

export const removeRecipeFromMealPlan = async (mealId: number): Promise<void> => {
    await retry(() => db.transaction('rw', db.mealPlan, () => db.mealPlan.delete(mealId)), 3, 500);
};

export const markMealAsCooked = async (mealId: number): Promise<{ success: boolean; changes: { updated: PantryItem[]; deleted: PantryItem[] } }> => {
    const meal = await retry(() => db.mealPlan.get(mealId), 3, 500);
    if (!meal) {
        return { success: false, changes: { updated: [], deleted: [] } };
    }

    const cookedDate = new Date().toISOString();
    const recipeId = meal.recipeId;
    if (!recipeId) {
        await retry(() => db.transaction('rw', db.mealPlan, () => db.mealPlan.update(mealId, { isCooked: true, cookedDate })), 3, 500);
        return { success: true, changes: { updated: [], deleted: [] } };
    }

    const recipe = await retry(() => db.recipes.get(recipeId), 3, 500);
    if (!recipe) {
        await retry(() => db.transaction('rw', db.mealPlan, () => db.mealPlan.update(mealId, { isCooked: true, cookedDate })), 3, 500);
        return { success: true, changes: { updated: [], deleted: [] } };
    }

    const recipeServings = parseInt(recipe.servings, 10) || 1;
    const mealServings = meal.servings || recipeServings;
    const scaleFactor = mealServings > 0 && recipeServings > 0 ? mealServings / recipeServings : 1;
    const ingredients = recipe.ingredients.flatMap((group) => group.items);

    const updated: PantryItem[] = [];
    const deleted: PantryItem[] = [];

    await retry(() => db.transaction('rw', db.pantry, db.mealPlan, async () => {
        for (const ingredient of ingredients) {
            const requiredQtyStr = scaleIngredientQuantity(ingredient.quantity, scaleFactor);
            const requiredQty = parseFloat(requiredQtyStr.replace(',', '.')) || 0;
            if (requiredQty === 0) {
                continue;
            }

            const pantryItem = await db.pantry.where('name').equalsIgnoreCase(ingredient.name).first();
            if (!pantryItem) {
                continue;
            }

            const now = Date.now();
            const newQuantity = pantryItem.quantity - requiredQty;
            if (newQuantity <= 0) {
                await db.pantry.delete(pantryItem.id!);
                deleted.push(pantryItem);
            } else {
                await db.pantry.update(pantryItem.id!, { quantity: newQuantity, updatedAt: now });
                updated.push({ ...pantryItem, quantity: newQuantity, updatedAt: now });
            }
        }

        await db.mealPlan.update(mealId, { isCooked: true, cookedDate });
    }), 3, 500);

    return { success: true, changes: { updated, deleted } };
};