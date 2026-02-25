import Dexie, { type Table } from 'dexie';
import { PantryItem, Recipe, MealPlanItem, ShoppingListItem, IngredientGroup } from '../types';

export class CulinaSyncDB extends Dexie {
    pantry!: Table<PantryItem, number>;
    recipes!: Table<Recipe, number>;
    mealPlan!: Table<MealPlanItem, number>;
    shoppingList!: Table<ShoppingListItem, number>;

    constructor() {
        super('CulinaSyncDB');
        (this as any).version(8).stores({
            pantry: '++id, name, expiryDate, createdAt, category, updatedAt',
            recipes: '++id, recipeTitle, isFavorite, *tags.course, *tags.cuisine, *tags.mainIngredient, updatedAt',
            mealPlan: '++id, date, recipeId, isCooked',
            shoppingList: '++id, name, isChecked, category, sortOrder, [category+sortOrder]',
        }).upgrade((tx: any) => {
             return Promise.all([
                tx.table('pantry').toCollection().modify((item: any) => {
                    if (item.updatedAt === undefined) item.updatedAt = item.createdAt;
                }),
                tx.table('recipes').toCollection().modify((item: any) => {
                    if (item.updatedAt === undefined) item.updatedAt = Date.now();
                })
            ]);
        });

        (this as any).version(9).stores({
            recipes: '++id, recipeTitle, isFavorite, *tags.course, *tags.cuisine, *tags.mainIngredient, updatedAt, pantryMatchPercentage',
        }).upgrade((tx: any) => {
            return tx.table('recipes').toCollection().modify((item: any) => {
                item.pantryMatchPercentage = 0;
                item.ingredientCount = item.ingredients.flatMap((g: IngredientGroup) => g.items).length;
            });
        });
        
        (this as any).version(10).stores({
            recipes: '++id, recipeTitle, isFavorite, *tags.course, *tags.cuisine, *tags.mainIngredient, updatedAt, pantryMatchPercentage',
        }).upgrade((tx: any) => {
            return tx.table('recipes').toCollection().modify((item: any) => {
                if (item.imageUrl === undefined) item.imageUrl = undefined;
            });
        });
    }
}

export const db = new CulinaSyncDB();