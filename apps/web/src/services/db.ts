/**
 * Datenbank-Einstieg für CulinaSync: Dexie-Instanz, Lifecycle-Hooks und Re-Export aller Repository-APIs.
 *
 * **Importieren Sie immer aus diesem Modul** (`@/services/db` oder `./services/db`), nicht direkt aus `dbInstance.ts`,
 * damit Seed-Population, Migration und Pantry-Matching-Hooks einmalig geladen werden.
 *
 * @module services/db
 */
import { db } from './dbInstance';
import {
  ensureMigrationBackup,
  LATEST_DB_VERSION,
  migrateLegacyPrimaryDatabaseIfNeeded,
  PRIMARY_DATA_STORES,
  PRIMARY_DB_NAME,
} from './dbMigrations';
import { debouncedUpdateAllPantryMatches, updatePantryMatches } from './pantryMatcherService';
import { loadSettings } from './settingsService';
import { syncSeedRecipes } from './repositories/recipeRepository';
import { logAppError } from './errorLoggingService';
import i18n from '../i18n';

// --- Initialization Logic ---
const populateDB = async () => {
    console.debug("Populating database for the first time...");
    try {
        const { allSeedRecipes: seedRecipes } = await import('../data/recipes/index');
        const now = Date.now();
        await db.transaction('rw', db.pantry, db.recipes, async () => {
            await db.pantry.bulkPut([
                { name: 'Tomatenmark', quantity: 1, unit: i18n.t('pantryUnits.can'), category: i18n.t('shoppingList.categories.canned'), createdAt: now - 200000, updatedAt: now - 200000, expiryDate: new Date(2025, 1, 1).toISOString().split('T')[0] },
                { name: 'Knoblauch', quantity: 3, unit: i18n.t('pantryUnits.clove'), category: i18n.t('shoppingList.categories.produce'), createdAt: now - 100000, updatedAt: now - 100000 },
                { name: 'Zwiebel', quantity: 1, unit: i18n.t('pantryUnits.piece'), category: i18n.t('shoppingList.categories.produce'), createdAt: now, updatedAt: now, minQuantity: 2 },
                { name: 'Spaghetti', quantity: 500, unit: i18n.t('pantryUnits.gram'), category: i18n.t('shoppingList.categories.dryGoods'), createdAt: now - 300000, updatedAt: now - 300000 },
                { name: 'Olivenöl', quantity: 250, unit: i18n.t('pantryUnits.milliliter'), category: i18n.t('shoppingList.categories.oils'), createdAt: now - 400000, updatedAt: now - 400000, minQuantity: 100 },
            ]);

            if (seedRecipes.length > 0) {
                await db.recipes.bulkPut(seedRecipes.map(r => ({ ...r, isFavorite: false, updatedAt: now })));
            }
        });
        console.debug("Default pantry items added.");
        if (seedRecipes.length > 0) {
            console.debug(`${seedRecipes.length} seed recipes added during initial population.`);
        }
        // After populating, calculate all matches
        await updatePantryMatches();
    } catch (error) {
        void logAppError(error, 'db.populate');
        if (import.meta.env.DEV) {
            console.error("Failed during initial database population:", error);
        }
    }
};

// Setup hooks outside the class constructor to avoid circular dependencies in class definition file
db.on('populate', populateDB);

// QNBS-v3: Lazy-Load der On-Device-AI-Embeddings-Schicht | hält localAiEmbeddingsService (+ vendor-ai) aus dem Eager-Graph → Initial-Load-Budget (script < 155 KB). Aufrufe bleiben fire-and-forget; Debounce-State lebt im einmalig gecachten Modul.
const loadEmbeddings = () => import('./localAiEmbeddingsService');

// QNBS-v3: geteilter Rejection-Handler | Lazy-import() kann (z. B. Chunk-Load-Fehler) rejecten — ohne .catch würde das zur Unhandled-Rejection und die Cleanup-Arbeit entfiele. Fehler laufen über logAppError.
const onEmbeddingError = (error: unknown) => {
  void logAppError(error, 'db.embeddingsMaintenance');
};

const scheduleEmbeddingMaintenance = () => {
  void loadEmbeddings().then((m) => m.debouncedReindexAllEmbeddings(loadSettings())).catch(onEmbeddingError);
};

// When pantry changes, recalculate for all recipes (debounced)
db.pantry.hook('creating', () => {
  debouncedUpdateAllPantryMatches();
  scheduleEmbeddingMaintenance();
});
db.pantry.hook('updating', () => {
  debouncedUpdateAllPantryMatches();
  scheduleEmbeddingMaintenance();
});
db.pantry.hook('deleting', (primKey) => {
  debouncedUpdateAllPantryMatches();
  if (typeof primKey === 'number') {
    void loadEmbeddings().then((m) => m.removeEmbeddingForSource('pantry', primKey)).catch(onEmbeddingError);
  }
});

// When a recipe is created or updated, calculate for just that recipe
db.recipes.hook('creating', (primKey, _obj, trans) => {
    trans.on('complete', () => {
      void updatePantryMatches([primKey as number]);
      scheduleEmbeddingMaintenance();
    });
});
db.recipes.hook('updating', (_modifications, primKey, _obj, trans) => {
    trans.on('complete', () => {
      void updatePantryMatches([primKey as number]);
      scheduleEmbeddingMaintenance();
    });
});
db.recipes.hook('deleting', (primKey) => {
  if (typeof primKey === 'number') {
    void loadEmbeddings().then((m) => m.removeEmbeddingForSource('recipe', primKey)).catch(onEmbeddingError);
  }
});

db.mealPlan.hook('creating', () => {
  scheduleEmbeddingMaintenance();
});
db.mealPlan.hook('updating', () => {
  scheduleEmbeddingMaintenance();
});
db.mealPlan.hook('deleting', (primKey) => {
  if (typeof primKey === 'number') {
    void loadEmbeddings().then((m) => m.removeEmbeddingForSource('mealPlan', primKey)).catch(onEmbeddingError);
  }
});

// Open DB and sync (Legacy-DB-Name → DataDB, dann Backup-Gate)
void migrateLegacyPrimaryDatabaseIfNeeded()
    .then(() => ensureMigrationBackup(PRIMARY_DB_NAME, LATEST_DB_VERSION, PRIMARY_DATA_STORES))
    .then(() => db.open())
    .then(syncSeedRecipes)
    .catch((err: Error) => {
        void logAppError(err, 'db.open');
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