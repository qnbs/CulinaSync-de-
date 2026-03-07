import { db } from '../dbInstance';
import { retry } from '../retryUtils';
import { FullBackupData } from '../../types';
import { updatePantryMatches } from '../pantryMatcherService';

export const importData = async (data: FullBackupData): Promise<void> => {
    await retry(() => db.transaction('rw', db.pantry, db.recipes, db.mealPlan, db.shoppingList, async () => {
        await db.pantry.clear();
        if (data.pantry && data.pantry.length > 0) {
            await db.pantry.bulkAdd(data.pantry);
        }

        await db.recipes.clear();
        if (data.recipes && data.recipes.length > 0) {
            await db.recipes.bulkAdd(data.recipes);
        }

        await db.mealPlan.clear();
        if (data.mealPlan && data.mealPlan.length > 0) {
            await db.mealPlan.bulkAdd(data.mealPlan);
        }

        await db.shoppingList.clear();
        if (data.shoppingList && data.shoppingList.length > 0) {
            await db.shoppingList.bulkAdd(data.shoppingList);
        }
    }), 3, 500);

    await updatePantryMatches();
};