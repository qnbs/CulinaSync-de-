import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Recipe } from '../../types';

const pantryToArray = vi.fn();
const recipesToArray = vi.fn();
const recipesAnyOfToArray = vi.fn();
const bulkUpdate = vi.fn().mockResolvedValue(undefined);

vi.mock('../dbInstance', () => ({
  db: {
    pantry: { toArray: pantryToArray },
    recipes: {
      toArray: recipesToArray,
      bulkUpdate,
      where: vi.fn(() => ({
        anyOf: vi.fn(() => ({ toArray: recipesAnyOfToArray })),
      })),
    },
  },
}));

const sampleRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  id: 1,
  recipeTitle: 'Test',
  shortDescription: '',
  prepTime: '10',
  cookTime: '20',
  totalTime: '30',
  servings: '2',
  difficulty: 'leicht',
  ingredients: [
    {
      sectionTitle: 'Haupt',
      items: [
        { name: 'Tomate', quantity: '2', unit: 'Stk' },
        { name: 'Salz', quantity: '1', unit: 'Prise' },
      ],
    },
  ],
  instructions: [],
  nutritionPerServing: { calories: '0', protein: '0', carbs: '0', fat: '0' },
  tags: {
    course: [],
    cuisine: [],
    occasion: [],
    mainIngredient: [],
    prepMethod: [],
    diet: [],
  },
  expertTips: [],
  pantryMatchPercentage: 0,
  ingredientCount: 0,
  ...overrides,
});

describe('pantryMatcherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pantryToArray.mockResolvedValue([
      { id: 1, name: 'Tomate', quantity: 5, unit: 'Stk', category: 'Gemüse', createdAt: 1, updatedAt: 1 },
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updatePantryMatches berechnet Prozent und ruft bulkUpdate auf', async () => {
    recipesToArray.mockResolvedValueOnce([sampleRecipe()]);
    const { updatePantryMatches } = await import('../pantryMatcherService');
    await updatePantryMatches();
    expect(bulkUpdate).toHaveBeenCalledWith([
      expect.objectContaining({
        key: 1,
        changes: expect.objectContaining({
          pantryMatchPercentage: 50,
          ingredientCount: 2,
        }),
      }),
    ]);
  });

  it('updatePantryMatches ueberspringt bulkUpdate wenn keine Aenderung', async () => {
    recipesToArray.mockResolvedValueOnce([
      sampleRecipe({ pantryMatchPercentage: 50, ingredientCount: 2 }),
    ]);
    const { updatePantryMatches } = await import('../pantryMatcherService');
    await updatePantryMatches();
    expect(bulkUpdate).not.toHaveBeenCalled();
  });

  it('updatePantryMatches filtert optional-Zutaten als vorhanden', async () => {
    recipesToArray.mockResolvedValueOnce([
      sampleRecipe({
        ingredients: [
          {
            sectionTitle: 'Haupt',
            items: [
              { name: 'optional Petersilie', quantity: '1', unit: 'Bund' },
              { name: 'Mehl', quantity: '500', unit: 'g' },
            ],
          },
        ],
      }),
    ]);
    pantryToArray.mockResolvedValueOnce([]);
    const { updatePantryMatches } = await import('../pantryMatcherService');
    await updatePantryMatches();
    expect(bulkUpdate).toHaveBeenCalledWith([
      expect.objectContaining({
        changes: expect.objectContaining({ pantryMatchPercentage: 50 }),
      }),
    ]);
  });

  it('debouncedUpdateAllPantryMatches plant updatePantryMatches verzoegert', async () => {
    vi.useFakeTimers();
    recipesToArray.mockResolvedValue([]);
    const { debouncedUpdateAllPantryMatches } = await import('../pantryMatcherService');
    debouncedUpdateAllPantryMatches();
    expect(bulkUpdate).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1500);
    expect(recipesToArray).toHaveBeenCalled();
  });
});
