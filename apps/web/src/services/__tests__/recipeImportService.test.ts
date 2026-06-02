import { beforeEach, describe, expect, it, vi } from 'vitest';
import { importRecipeFromJsonString, importRecipeFromUrl } from '../recipeImportService';

const mockExtractRecipeFromWebContent = vi.fn();

vi.mock('../geminiService', () => ({
  extractRecipeFromWebContent: (...args: unknown[]) => mockExtractRecipeFromWebContent(...args),
}));

const jsonLdRecipe = {
  '@type': 'Recipe',
  name: '  Linsensuppe  ',
  description: 'Wuerzig und cremig',
  prepTime: 'PT1H15M',
  cookTime: 'PT30M',
  totalTime: 'PT1H45M',
  recipeYield: '4 Portionen',
  recipeIngredient: ['200 g rote Linsen', 'Salz'],
  recipeInstructions: [
    'Linsen waschen',
    { '@type': 'HowToStep', text: 'Mit Wasser kochen' },
  ],
  recipeCategory: 'Suppe',
  recipeCuisine: 'Indisch',
};

describe('recipeImportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtractRecipeFromWebContent.mockResolvedValue({
      recipeTitle: 'Gemini Fallback',
      shortDescription: 'x',
      prepTime: '10 Min.',
      cookTime: '20 Min.',
      totalTime: '30 Min.',
      servings: '2',
      difficulty: 'Einfach',
      ingredients: [{ sectionTitle: '', items: [{ quantity: '1', unit: '', name: 'X' }] }],
      instructions: ['Kochen'],
      nutritionPerServing: { calories: '', protein: '', fat: '', carbs: '' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      expertTips: [],
    });
  });

  it('importRecipeFromJsonString normalisiert CulinaSync-Rezept-JSON', () => {
    const payload = {
      recipeTitle: 'Mein Rezept',
      shortDescription: 'Kurz',
      ingredients: [{ sectionTitle: 'Haupt', items: [{ quantity: '1', unit: 'kg', name: 'Mehl' }] }],
      instructions: ['Mischen'],
    };
    const recipe = importRecipeFromJsonString(JSON.stringify(payload));
    expect(recipe.recipeTitle).toBe('Mein Rezept');
    expect(recipe.instructions).toEqual(['Mischen']);
  });

  it('importRecipeFromJsonString parst Schema.org JSON-LD', () => {
    const recipe = importRecipeFromJsonString(JSON.stringify(jsonLdRecipe));
    expect(recipe.recipeTitle).toBe('Linsensuppe');
    expect(recipe.prepTime).toBe('1 Std. 15 Min.');
    expect(recipe.cookTime).toBe('30 Min.');
    expect(recipe.servings).toBe('4 Portionen');
    expect(recipe.ingredients[0].items[0]).toMatchObject({ name: 'rote Linsen', quantity: '200', unit: 'g' });
    expect(recipe.instructions).toHaveLength(2);
    expect(recipe.tags.course).toContain('Suppe');
  });

  it('importRecipeFromJsonString findet Rezept in @graph', () => {
    const wrapped = { '@graph': [jsonLdRecipe] };
    const recipe = importRecipeFromJsonString(JSON.stringify(wrapped));
    expect(recipe.recipeTitle).toBe('Linsensuppe');
  });

  it('importRecipeFromJsonString wirft bei unbekanntem Format', () => {
    expect(() => importRecipeFromJsonString(JSON.stringify({ foo: 'bar' }))).toThrow(
      /No supported recipe format/i,
    );
  });

  it('importRecipeFromJsonString wirft bei unvollstaendigem JSON-LD', () => {
    const incomplete = { ...jsonLdRecipe, recipeIngredient: [], recipeInstructions: [] };
    expect(() => importRecipeFromJsonString(JSON.stringify(incomplete))).toThrow(/incomplete/i);
  });

  it('importRecipeFromUrl laedt JSON direkt', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(jsonLdRecipe),
      headers: { get: () => 'application/json' },
    });
    vi.stubGlobal('fetch', fetchMock);

    const recipe = await importRecipeFromUrl('https://example.com/recipe.json');
    expect(recipe.recipeTitle).toBe('Linsensuppe');
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/recipe.json', { method: 'GET' });

    vi.unstubAllGlobals();
  });

  it('importRecipeFromUrl extrahiert JSON-LD aus HTML', async () => {
    const html = `<html><script type="application/ld+json">${JSON.stringify(jsonLdRecipe)}</script></html>`;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => html,
        headers: { get: () => 'text/html' },
      }),
    );

    const recipe = await importRecipeFromUrl('https://example.com/rezept');
    expect(recipe.recipeTitle).toBe('Linsensuppe');

    vi.unstubAllGlobals();
  });

  it('importRecipeFromUrl delegiert an Gemini wenn kein strukturiertes Rezept gefunden wird', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '<html><title>Rezept</title><p>Keine strukturierten Daten</p></html>',
        headers: { get: () => 'text/html' },
      }),
    );

    const recipe = await importRecipeFromUrl('https://example.com/leer');
    expect(mockExtractRecipeFromWebContent).toHaveBeenCalled();
    expect(recipe.recipeTitle).toBe('Gemini Fallback');

    vi.unstubAllGlobals();
  });

  it('importRecipeFromUrl wirft bei ungueltiger URL', async () => {
    await expect(importRecipeFromUrl('not-a-url')).rejects.toThrow(/Invalid URL/i);
  });

  it('importRecipeFromUrl wirft wenn Netzwerk und Proxy fehlschlagen', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(importRecipeFromUrl('https://example.com/x')).rejects.toThrow(/Could not load URL/i);
    vi.unstubAllGlobals();
  });
});
