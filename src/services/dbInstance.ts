import Dexie, { type Table } from 'dexie';
import { PantryItem, Recipe, MealPlanItem, ShoppingListItem, AppLogEntry } from '../types';
import { applyDbMigrations } from './dbMigrations';

export class CulinaSyncDB extends Dexie {
    pantry!: Table<PantryItem, number>;
    recipes!: Table<Recipe, number>;
    mealPlan!: Table<MealPlanItem, number>;
    shoppingList!: Table<ShoppingListItem, number>;
    appLogs!: Table<AppLogEntry, number>;

    constructor() {
        super('CulinaSyncDB');
        applyDbMigrations(this);
    }
}

export const db = new CulinaSyncDB();