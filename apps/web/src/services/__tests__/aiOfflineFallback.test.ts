import { describe, expect, it } from 'vitest';
import {
  buildLocalRecipe,
  buildLocalRecipeIdeas,
  buildLocalShoppingList,
  shouldUseOfflineFallback,
} from '../aiOfflineFallback';
import type { PantryItem, RecipeIdea } from '../../types';
import { getDefaultSettings } from '../settingsMerge';

const pantry: PantryItem[] = [
  {
    id: 1,
    name: 'Tomaten',
    quantity: 3,
    unit: 'Stk',
    category: 'Gemüse',
    createdAt: 1,
    updatedAt: 1,
  },
];

describe('aiOfflineFallback', () => {
  it('shouldUseOfflineFallback erkennt Offline und typische Fehler', () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'onLine');
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    expect(shouldUseOfflineFallback(new Error('irrelevant'))).toBe(true);
    Object.defineProperty(navigator, 'onLine', original ?? { configurable: true, value: true });

    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true });
    expect(shouldUseOfflineFallback(new Error('network failed'))).toBe(true);
    expect(shouldUseOfflineFallback(new Error('429 rate'))).toBe(true);
    expect(shouldUseOfflineFallback(new Error('other'))).toBe(false);
  });

  it('baut Ideen, Rezept und Einkaufsliste lokal', () => {
    const prefs = getDefaultSettings().aiPreferences;
    const prompt = {
      craving: 'Pasta',
      includeIngredients: ['Basilikum'],
      excludeIngredients: [],
      modifiers: [],
    };
    const ideas = buildLocalRecipeIdeas(prompt, pantry, prefs);
    expect(ideas.length).toBeGreaterThan(0);

    const idea: RecipeIdea = ideas[0];
    const recipe = buildLocalRecipe(prompt, pantry, idea);
    expect(recipe.recipeTitle).toBeTruthy();
    expect(recipe.ingredients.length).toBeGreaterThan(0);

    const list = buildLocalShoppingList('grill abend', pantry, []);
    expect(Array.isArray(list)).toBe(true);
  });
});
