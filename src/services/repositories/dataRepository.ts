import { db } from '../dbInstance';
import { FullBackupData } from '../../types';
import { updatePantryMatches } from '../pantryMatcherService';

export const importData = async (data: FullBackupData): Promise<void> => {
    await (db as any).transaction('rw', db.pantry, db.recipes, db.mealPlan, db.shoppingList, async () => {
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