import Dexie, { type Table } from 'dexie';
import { AiEmbeddingRecord, PantryItem, Recipe, MealPlanItem, ShoppingListItem, AppLogEntry } from '../types';
import { applyDbMigrations, PRIMARY_DB_NAME } from './dbMigrations';

export class CulinaSyncDB extends Dexie {
    pantry!: Table<PantryItem, number>;
    recipes!: Table<Recipe, number>;
    mealPlan!: Table<MealPlanItem, number>;
    shoppingList!: Table<ShoppingListItem, number>;
    appLogs!: Table<AppLogEntry, number>;
    aiEmbeddings!: Table<AiEmbeddingRecord, number>;

    constructor() {
        super(PRIMARY_DB_NAME);
        applyDbMigrations(this);
    }
}

export const db = new CulinaSyncDB();