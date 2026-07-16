import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { importRecipeFromJsonString, importRecipeFromUrl } from '../recipeImportService';

const mockExtractRecipeFromWebContent = vi.fn();

vi.mock('../geminiService', () => ({
  extractRecipeFromWebContent: (...args: unknown[]) => mockExtractRecipeFromWebContent(...args),
}));

// QNBS-v3: Branch-Coverage JSON-LD/URL-Import | isoDuration, Graph, Proxy, Gemini-Fallback
describe('recipeImportService branch coverage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockExtractRecipeFromWebContent.mockResolvedValue({
      recipeTitle: 'Gemini',
      shortDescription: 'x',
      prepTime: '',
      cookTime: '',
      totalTime: '',
      servings: '2',
      difficulty: 'Einfach',
      ingredients: [{ sectionTitle: '', items: [{ quantity: '1', unit: '', name: 'X' }] }],
      instructions: ['Kochen'],
      nutritionPerServing: { calories: '', protein: '', fat: '', carbs: '' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      expertTips: [],
    });
  });

  it('isoDuration-Varianten und Instruction-Formen', () => {
    const recipe = importRecipeFromJsonString(
      JSON.stringify({
        '@type': 'Recipe',
        name: 'Test',
        prepTime: 'PT1H',
        cookTime: 'PT45M',
        totalTime: 'invalid',
        recipeYield: ['2', '4'],
        recipeIngredient: ['Salz', '200 g Mehl'],
        recipeInstructions: [
          'A',
          { text: 'B' },
          { name: 'C' },
          { junk: true },
          12,
        ],
        recipeCategory: 'Hauptgericht',
        recipeCuisine: 'Deutsch',
      }),
    );
    expect(recipe.prepTime).toBe('1 Std.');
    expect(recipe.cookTime).toBe('45 Min.');
    expect(recipe.servings).toBe('2');
    expect(recipe.instructions).toEqual(['A', 'B', 'C']);
    expect(recipe.ingredients[0].items.some((i) => i.name === 'Salz')).toBe(true);
    expect(recipe.tags.course.length + recipe.tags.cuisine.length).toBeGreaterThan(0);
  });

  it('findet Rezept in itemListElement', () => {
    const recipe = importRecipeFromJsonString(
      JSON.stringify({
        itemListElement: [
          {
            '@type': 'Recipe',
            name: 'Aus Liste',
            recipeIngredient: ['1 EL Öl'],
            recipeInstructions: ['X'],
          },
        ],
      }),
    );
    expect(recipe.recipeTitle).toBe('Aus Liste');
  });

  it('deckt isoDuration/Instructions/Graph-Miss-Zweige ab', () => {
    expect(() =>
      importRecipeFromJsonString(
        JSON.stringify({
          '@type': 'Recipe',
          name: 'Minuten',
          cookTime: 'PT20M',
          prepTime: 'PT0M',
          recipeIngredient: ['Mehl', '2 Eier'],
          recipeInstructions: 'nicht-array',
          recipeYield: [''],
        }),
      ),
    ).toThrow(/incomplete/i);

    expect(() =>
      importRecipeFromJsonString(
        JSON.stringify({
          '@graph': [{ '@type': 'WebPage', name: 'Nur Seite' }],
          itemListElement: [null, { '@type': 'Article' }],
        }),
      ),
    ).toThrow(/No supported recipe format/i);

    const typed = importRecipeFromJsonString(
      JSON.stringify({
        '@type': ['HowTo', 'Recipe'],
        name: 'Array-Type',
        recipeIngredient: ['1 EL Öl'],
        recipeInstructions: [{ text: '' }, { name: 'Schritt' }, { junk: true }],
      }),
    );
    expect(typed.recipeTitle).toBe('Array-Type');
    expect(typed.instructions).toEqual(['Schritt']);
  });

  it('URL-Import: Proxy-Fallback wenn Direktfetch fehlschlägt', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('fail', { status: 500 }))
      .mockResolvedValueOnce(
        new Response(
          `<html><script type="application/ld+json">${JSON.stringify({
            '@type': 'Recipe',
            name: 'Via Proxy',
            recipeIngredient: ['1 Tomate'],
            recipeInstructions: ['Step'],
          })}</script></html>`,
          { status: 200 },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);
    const recipe = await importRecipeFromUrl('https://example.com/proxy-recipe');
    expect(recipe.recipeTitle).toBe('Via Proxy');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });

  it('findet Rezept in @graph und PT1H30M', () => {
    const recipe = importRecipeFromJsonString(
      JSON.stringify({
        '@graph': [
          { '@type': 'WebPage', name: 'Seite' },
          {
            '@type': 'Recipe',
            name: 'Graph-Rezept',
            prepTime: 'PT1H30M',
            cookTime: 'PT15M',
            recipeYield: '4',
            recipeIngredient: ['200 g Mehl', 'Salz'],
            recipeInstructions: [{ '@type': 'HowToStep', text: 'Mischen' }],
          },
        ],
      }),
    );
    expect(recipe.recipeTitle).toBe('Graph-Rezept');
    expect(recipe.prepTime).toMatch(/1/);
    expect(recipe.cookTime).toMatch(/15/);
    expect(recipe.servings).toBe('4');
  });

  it('URL-Import: direkter Fetch ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          `<html><script type="application/ld+json">${JSON.stringify({
            '@type': 'Recipe',
            name: 'Fetched',
            recipeIngredient: ['1 Tomate'],
            recipeInstructions: ['Step'],
          })}</script></html>`,
          { status: 200 },
        ),
      ),
    );
    const recipe = await importRecipeFromUrl('https://example.com/recipe');
    expect(recipe.recipeTitle).toBe('Fetched');
    vi.unstubAllGlobals();
  });

  it('URL-Import: Fallback auf Gemini wenn kein JSON-LD', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<html><body>No schema</body></html>', { status: 200 })),
    );
    const recipe = await importRecipeFromUrl('https://example.com/plain');
    expect(recipe.recipeTitle).toBe('Gemini');
    expect(mockExtractRecipeFromWebContent).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
