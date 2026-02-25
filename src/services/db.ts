import { db } from './dbInstance';
import { debouncedUpdateAllPantryMatches, updatePantryMatches } from './pantryMatcherService';
import { syncSeedRecipes } from './repositories/recipeRepository';
import { allSeedRecipes as seedRecipes } from '../data/recipes/index';

// --- Initialization Logic ---
const populateDB = async () => {
    console.log("Populating database for the first time...");
    try {
        const now = Date.now();
        await db.pantry.bulkAdd([
            { name: 'Tomatenmark', quantity: 1, unit: 'Dose', category: 'Konserven', createdAt: now - 200000, updatedAt: now - 200000, expiryDate: new Date(2025, 1, 1).toISOString().split('T')[0] },
            { name: 'Knoblauch', quantity: 3, unit: 'Zehen', category: 'Frischeprodukte', createdAt: now - 100000, updatedAt: now - 100000 },
            { name: 'Zwiebel', quantity: 1, unit: 'Stück', category: 'Frischeprodukte', createdAt: now, updatedAt: now, minQuantity: 2 },
            { name: 'Spaghetti', quantity: 500, unit: 'g', category: 'Trockenwaren', createdAt: now - 300000, updatedAt: now - 300000 },
            { name: 'Olivenöl', quantity: 250, unit: 'ml', category: 'Öle & Essige', createdAt: now - 400000, updatedAt: now - 400000, minQuantity: 100 },
        ]);
        console.log("Default pantry items added.");

        if (seedRecipes.length > 0) {
            await db.recipes.bulkAdd(seedRecipes.map(r => ({ ...r, isFavorite: false, updatedAt: now })));
            console.log(`${seedRecipes.length} seed recipes added during initial population.`);
        }
        // After populating, calculate all matches
        await updatePantryMatches();
    } catch (error) {
        console.error("Failed during initial database population:", error);
    }
};

// Setup hooks outside the class constructor to avoid circular dependencies in class definition file
(db as any).on('populate', populateDB);

// When pantry changes, recalculate for all recipes (debounced)
db.pantry.hook('creating', debouncedUpdateAllPantryMatches);
db.pantry.hook('updating', debouncedUpdateAllPantryMatches);
db.pantry.hook('deleting', debouncedUpdateAllPantryMatches);

// When a recipe is created or updated, calculate for just that recipe
db.recipes.hook('creating', (primKey, _obj, trans) => {
    (trans as any).on('complete', () => updatePantryMatches([primKey as number]));
});
db.recipes.hook('updating', (_modifications, primKey, _obj, trans) => {
    (trans as any).on('complete', () => updatePantryMatches([primKey as number]));
});

// Open DB and sync
(db as any).open().then(syncSeedRecipes).catch((err: Error) => {
    console.error(`Failed to open and initialize database: ${(err as Error).stack || err}`);
});

// --- Exports ---
// Export the db instance
export { db } from './dbInstance';

// Re-export all repository functions to maintain API compatibility
export * from './repositories/recipeRepository';
export * from './repositories/pantryRepository';
export * from './repositories/shoppingListRepository';
export * from './repositories/mealPlanRepository';
export * from './repositories/dataRepository';