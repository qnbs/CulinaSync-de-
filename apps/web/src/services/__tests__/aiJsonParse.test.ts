import { describe, expect, it } from 'vitest';
import {
  parseAiJsonWithSchema,
  recipeAiSchema,
  recipeIdeasResponseSchema,
  shoppingListGenerationSchema,
} from '../aiJsonParse';

describe('aiJsonParse', () => {
  it('parseAiJsonWithSchema akzeptiert gueltige Rezept-Ideen', () => {
    const parsed = parseAiJsonWithSchema(
      JSON.stringify({
        ideas: [{ recipeTitle: 'A', shortDescription: 'B' }],
      }),
      recipeIdeasResponseSchema,
    );
    expect(parsed.ideas).toHaveLength(1);
  });

  it('parseAiJsonWithSchema wirft bei ungueltigem JSON', () => {
    expect(() => parseAiJsonWithSchema('not-json', recipeIdeasResponseSchema)).toThrow('invalid JSON');
  });

  it('parseAiJsonWithSchema wirft bei falscher Struktur', () => {
    expect(() => parseAiJsonWithSchema(JSON.stringify({ ideas: [] }), recipeIdeasResponseSchema)).toThrow(
      'invalid structure',
    );
  });

  it('validiert Einkaufslisten-Schema', () => {
    const parsed = parseAiJsonWithSchema(
      JSON.stringify({
        items: [{ name: 'Brot', quantity: 1, unit: 'Stk' }],
      }),
      shoppingListGenerationSchema,
    );
    expect(parsed.items[0]?.name).toBe('Brot');
  });

  it('validiert vollstaendiges Rezept-Schema', () => {
    const parsed = parseAiJsonWithSchema(
      JSON.stringify({
        recipeTitle: 'T',
        shortDescription: 'S',
        prepTime: '5',
        cookTime: '10',
        totalTime: '15',
        servings: '2',
        difficulty: 'leicht',
        ingredients: [{ sectionTitle: 'H', items: [{ quantity: '1', unit: 'Stk', name: 'X' }] }],
        instructions: ['Schritt'],
        nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
        tags: {
          course: [],
          cuisine: [],
          occasion: [],
          mainIngredient: [],
          prepMethod: [],
          diet: [],
        },
        expertTips: [],
      }),
      recipeAiSchema,
    );
    expect(parsed.instructions).toHaveLength(1);
  });
});
