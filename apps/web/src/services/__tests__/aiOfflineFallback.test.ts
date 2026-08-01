import { beforeEach, describe, expect, it, vi } from 'vitest';

const tMock = vi.fn();

vi.mock('i18next', () => ({
  default: {
    t: (...args: unknown[]) => tMock(...args),
    language: 'de',
  },
}));

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
  beforeEach(() => {
    tMock.mockReset();
    tMock.mockImplementation((key: unknown, opts?: { returnObjects?: boolean }) => {
      const k = Array.isArray(key) ? String(key[0]) : String(key);
      if (opts?.returnObjects) {
        if (k === 'aiOffline.recipeTemplates') {
          return { a: 'Pfanne', b: 'Ofen', c: 'Topf' };
        }
        if (k === 'aiOffline.shoppingCatalog') {
          return { breakfast: ['Brot', 'Milch', 'Eier'], grill: ['Kohle'] };
        }
        return {};
      }
      return k;
    });
  });

  it('shouldUseOfflineFallback erkennt Offline und typische Fehler', () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'onLine');
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    expect(shouldUseOfflineFallback(new Error('irrelevant'))).toBe(true);
    Object.defineProperty(navigator, 'onLine', original ?? { configurable: true, value: true });

    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true });
    expect(shouldUseOfflineFallback(new Error('network failed'))).toBe(true);
    expect(shouldUseOfflineFallback(new Error('429 rate'))).toBe(true);
    expect(shouldUseOfflineFallback('fetch_error')).toBe(true);
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

  it('degradiert bei nicht-objekt i18n und leerem Pantry/Prompt', () => {
    tMock.mockImplementation((key: unknown, opts?: { returnObjects?: boolean }) => {
      if (opts?.returnObjects) return 'broken';
      return Array.isArray(key) ? String(key[0]) : String(key);
    });
    const prefs = { ...getDefaultSettings().aiPreferences, preferredCuisines: [] as string[] };
    const emptyPrompt = {
      craving: '',
      includeIngredients: [] as string[],
      excludeIngredients: [] as string[],
      modifiers: [] as string[],
    };
    expect(buildLocalRecipeIdeas(emptyPrompt, [], prefs)).toEqual([]);
    const recipe = buildLocalRecipe(emptyPrompt, [], {
      recipeTitle: 'X',
      shortDescription: 'Y',
    });
    expect(recipe.ingredients[0].items.length).toBeGreaterThan(0);
    expect(buildLocalShoppingList('ab', pantry, [])).toEqual([]);
  });
});
