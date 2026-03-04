import { db } from '../dbInstance';
import { retry } from '../retryUtils';
import { FullBackupData } from '../../types';
import { updatePantryMatches } from '../pantryMatcherService';

    await retry(async () => {
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
    }, 3, 500);
    // After import completes, trigger a full recalculation
    await updatePantryMatches();
};