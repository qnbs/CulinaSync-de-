import Dexie, { type Transaction } from 'dexie';
import type { IngredientGroup, PantryItem, Recipe } from '../types';

type MigrationTableMap = Record<string, string | null>;
type MigrationDefinition = {
  version: number;
  description: string;
  stores: MigrationTableMap;
  upgrade?: (tx: Transaction) => Promise<unknown> | unknown;
};

type PantryMigrationRecord = Partial<PantryItem> & Pick<PantryItem, 'createdAt'>;
type RecipeMigrationRecord = Partial<Recipe> & Pick<Recipe, 'ingredients'>;

const baseStores: MigrationTableMap = {
  pantry: '++id, name, expiryDate, createdAt, category, updatedAt',
  recipes: '++id, recipeTitle, isFavorite, *tags.course, *tags.cuisine, *tags.mainIngredient, updatedAt',
  mealPlan: '++id, date, recipeId, isCooked',
  shoppingList: '++id, name, isChecked, category, sortOrder, [category+sortOrder]',
};

const version9Stores: MigrationTableMap = {
  ...baseStores,
  recipes: '++id, recipeTitle, isFavorite, *tags.course, *tags.cuisine, *tags.mainIngredient, updatedAt, pantryMatchPercentage',
};

const version11Stores: MigrationTableMap = {
  ...version9Stores,
  appLogs: '++id, level, source, createdAt, synced',
};

const version12Stores: MigrationTableMap = {
  pantry: '++id, name, expiryDate, createdAt, category, updatedAt, [category+expiryDate], [expiryDate+category]',
  recipes: '++id, recipeTitle, isFavorite, *tags.course, *tags.cuisine, *tags.mainIngredient, updatedAt, pantryMatchPercentage',
  mealPlan: '++id, date, recipeId, isCooked',
  shoppingList: '++id, name, isChecked, category, sortOrder, [category+sortOrder]',
  appLogs: '++id, level, source, createdAt, synced',
};

export const DB_MIGRATION_HISTORY: MigrationDefinition[] = [
  {
    version: 8,
    description: 'Fuegt updatedAt-Felder fuer Vorrat und Rezepte ein.',
    stores: baseStores,
    upgrade: (tx) => Promise.all([
      tx.table('pantry').toCollection().modify((item) => {
        const pantryItem = item as PantryMigrationRecord;
        if (pantryItem.updatedAt === undefined) {
          pantryItem.updatedAt = pantryItem.createdAt;
        }
      }),
      tx.table('recipes').toCollection().modify((item) => {
        const recipe = item as Partial<Recipe>;
        if (recipe.updatedAt === undefined) {
          recipe.updatedAt = Date.now();
        }
      }),
    ]),
  },
  {
    version: 9,
    description: 'Ergaenzt Pantry-Match-Metadaten fuer Rezepte.',
    stores: version9Stores,
    upgrade: (tx) => tx.table('recipes').toCollection().modify((item) => {
      const recipe = item as RecipeMigrationRecord;
      if (recipe.pantryMatchPercentage === undefined) {
        recipe.pantryMatchPercentage = 0;
      }
      if (recipe.ingredientCount === undefined) {
        recipe.ingredientCount = recipe.ingredients.flatMap((group: IngredientGroup) => group.items).length;
      }
    }),
  },
  {
    version: 10,
    description: 'Normalisiert Rezeptbilder in bestehenden Datensaetzen.',
    stores: version9Stores,
    upgrade: (tx) => tx.table('recipes').toCollection().modify((item) => {
      const recipe = item as Partial<Recipe>;
      if (recipe.imageUrl === undefined) {
        recipe.imageUrl = undefined;
      }
    }),
  },
  {
    version: 11,
    description: 'Fuegt persistentes App-Fehlerlogging hinzu.',
    stores: version11Stores,
  },
  {
    version: 12,
    description: 'Ergaenzt Compound-Indizes fuer Vorratslisten nach Kategorie und Ablaufdatum.',
    stores: version12Stores,
  },
];

export const PRIMARY_DB_NAME = 'CulinaSyncDB';
export const PRIMARY_DATA_STORES = ['pantry', 'recipes', 'mealPlan', 'shoppingList'] as const;
export const LATEST_DB_VERSION = DB_MIGRATION_HISTORY[DB_MIGRATION_HISTORY.length - 1].version;

export const applyDbMigrations = (db: Dexie) => {
  for (const migration of DB_MIGRATION_HISTORY) {
    const versionBuilder = db.version(migration.version).stores(migration.stores);
    if (migration.upgrade) {
      versionBuilder.upgrade((tx) => Promise.resolve(migration.upgrade?.(tx)).then(() => undefined));
    }
  }
};

type MigrationBackupRecord = {
  id: string;
  sourceDbName: string;
  fromVersion: number;
  toVersion: number;
  createdAt: number;
  stores: string[];
  counts: Record<string, number>;
  payload: Record<string, unknown[]>;
};

const BACKUP_DB_NAME = 'CulinaSyncMigrationBackups';
const BACKUP_STORE_NAME = 'backups';

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const transactionDone = (transaction: IDBTransaction): Promise<void> => new Promise((resolve, reject) => {
  transaction.oncomplete = () => resolve();
  transaction.onerror = () => reject(transaction.error);
  transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
});

const openNativeDb = (name: string, version?: number): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = version ? window.indexedDB.open(name, version) : window.indexedDB.open(name);
  request.onerror = () => reject(request.error);
  request.onupgradeneeded = () => {
    if (name === BACKUP_DB_NAME) {
      const database = request.result;
      if (!database.objectStoreNames.contains(BACKUP_STORE_NAME)) {
        database.createObjectStore(BACKUP_STORE_NAME, { keyPath: 'id' });
      }
      return;
    }

    request.transaction?.abort();
    reject(new Error('Primary database unexpectedly entered upgrade mode while preparing a migration backup.'));
  };
  request.onsuccess = () => resolve(request.result);
});

const backupDbExists = async () => Dexie.exists(BACKUP_DB_NAME);

const getExistingDatabaseVersion = async (databaseName: string): Promise<number | null> => {
  const exists = await Dexie.exists(databaseName);
  if (!exists) {
    return null;
  }

  const database = await openNativeDb(databaseName);
  const version = database.version;
  database.close();
  return version;
};

const getStoreSnapshot = async (database: IDBDatabase, storeName: string): Promise<unknown[]> => {
  if (!database.objectStoreNames.contains(storeName)) {
    return [];
  }

  const transaction = database.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const values = await requestToPromise(store.getAll());
  await transactionDone(transaction);
  return values;
};

const saveMigrationBackup = async (record: MigrationBackupRecord): Promise<void> => {
  const database = await openNativeDb(BACKUP_DB_NAME, 1);
  const transaction = database.transaction(BACKUP_STORE_NAME, 'readwrite');
  transaction.objectStore(BACKUP_STORE_NAME).put(record);
  await transactionDone(transaction);
  database.close();
};

const hasBackupForStep = async (sourceDbName: string, fromVersion: number, toVersion: number): Promise<boolean> => {
  if (!(await backupDbExists())) {
    return false;
  }

  const database = await openNativeDb(BACKUP_DB_NAME);
  if (!database.objectStoreNames.contains(BACKUP_STORE_NAME)) {
    database.close();
    return false;
  }

  const transaction = database.transaction(BACKUP_STORE_NAME, 'readonly');
  const records = await requestToPromise(transaction.objectStore(BACKUP_STORE_NAME).getAll()) as MigrationBackupRecord[];
  await transactionDone(transaction);
  database.close();

  return records.some((record) => record.sourceDbName === sourceDbName && record.fromVersion === fromVersion && record.toVersion === toVersion);
};

export const ensureMigrationBackup = async (
  databaseName: string,
  targetVersion: number,
  storeNames: readonly string[],
): Promise<void> => {
  const currentVersion = await getExistingDatabaseVersion(databaseName);
  if (currentVersion === null || currentVersion >= targetVersion) {
    return;
  }

  if (await hasBackupForStep(databaseName, currentVersion, targetVersion)) {
    return;
  }

  const database = await openNativeDb(databaseName);
  const payloadEntries = await Promise.all(storeNames.map(async (storeName) => [storeName, await getStoreSnapshot(database, storeName)] as const));
  database.close();

  const payload = Object.fromEntries(payloadEntries);
  const counts = Object.fromEntries(payloadEntries.map(([storeName, items]) => [storeName, items.length]));

  await saveMigrationBackup({
    id: `${databaseName}:${currentVersion}->${targetVersion}:${Date.now()}`,
    sourceDbName: databaseName,
    fromVersion: currentVersion,
    toVersion: targetVersion,
    createdAt: Date.now(),
    stores: [...storeNames],
    counts,
    payload,
  });
};