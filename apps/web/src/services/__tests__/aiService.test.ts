import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSettings, PantryItem, RecipeIdea, ShoppingListItem } from '../../types';
import { getDefaultSettings } from '../settingsMerge';

const mockGenerateRecipeIdeas = vi.fn();
const mockLoadSettings = vi.fn();

vi.mock('../settingsService', () => ({
  loadSettings: () => mockLoadSettings(),
  getDefaultSettings: () => getDefaultSettings(),
}));
const mockGenerateRecipe = vi.fn();
const mockGenerateShoppingList = vi.fn();

vi.mock('../geminiService', () => ({
  generateRecipeIdeas: (...args: unknown[]) => mockGenerateRecipeIdeas(...args),
  generateRecipe: (...args: unknown[]) => mockGenerateRecipe(...args),
  generateShoppingList: (...args: unknown[]) => mockGenerateShoppingList(...args),
}));

const cloudFirstSettings = (): AppSettings => ({
  ...getDefaultSettings(),
  aiPreferences: {
    ...getDefaultSettings().aiPreferences,
    preferredCuisines: ['Italienisch'],
    creativityLevel: 0.5,
    routingMode: 'cloud-first',
  },
});

const localFirstSettings = (): AppSettings => ({
  ...getDefaultSettings(),
  aiPreferences: {
    ...getDefaultSettings().aiPreferences,
    preferredCuisines: ['Italienisch'],
    creativityLevel: 0.5,
    routingMode: 'local-first',
  },
});

const pantryItems: PantryItem[] = [
  {
    id: 1,
    name: 'Tomaten',
    quantity: 4,
    unit: 'Stk',
    category: 'Gemüse',
    createdAt: 1,
    updatedAt: 1,
  },
];

const aiPreferences = cloudFirstSettings().aiPreferences;

const prompt = {
  craving: 'Pasta',
  includeIngredients: ['Basilikum'],
  excludeIngredients: [],
  modifiers: [],
};

const chosenIdea: RecipeIdea = {
  recipeTitle: 'Tomaten-Pasta',
  shortDescription: 'Schnell und lecker',
};

describe('aiService offline fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadSettings.mockReturnValue(cloudFirstSettings());
  });

  it('generateRecipeIdeas nutzt lokalen Fallback bei fehlendem API-Key', async () => {
    mockGenerateRecipeIdeas.mockRejectedValueOnce(new Error('Kein API-Schluessel konfiguriert'));
    const { generateRecipeIdeas } = await import('../aiService');
    const ideas = await generateRecipeIdeas(prompt, pantryItems, aiPreferences);
    expect(ideas).toHaveLength(3);
    expect(ideas[0].recipeTitle).toMatch(/Tomaten|Pasta|Basilikum/i);
  });

  it('generateRecipeIdeas wirft bei nicht-offline Fehler', async () => {
    mockGenerateRecipeIdeas.mockRejectedValueOnce(new Error('Unexpected validation'));
    const { generateRecipeIdeas } = await import('../aiService');
    await expect(generateRecipeIdeas(prompt, pantryItems, aiPreferences)).rejects.toThrow('Unexpected');
  });

  it('generateRecipeIdeas nutzt lokalen Pfad bei local-first ohne Cloud-Aufruf', async () => {
    mockLoadSettings.mockReturnValue(localFirstSettings());
    const { generateRecipeIdeas } = await import('../aiService');
    const ideas = await generateRecipeIdeas(prompt, pantryItems, localFirstSettings().aiPreferences);
    expect(ideas).toHaveLength(3);
    expect(mockGenerateRecipeIdeas).not.toHaveBeenCalled();
  });

  it('generateRecipeIdeas delegiert an Gemini bei Erfolg', async () => {
    const cloudIdeas = [{ recipeTitle: 'Cloud', shortDescription: 'x' }];
    mockGenerateRecipeIdeas.mockResolvedValueOnce(cloudIdeas);
    const { generateRecipeIdeas } = await import('../aiService');
    const ideas = await generateRecipeIdeas(prompt, pantryItems, aiPreferences);
    expect(ideas).toEqual(cloudIdeas);
  });

  it('generateRecipe nutzt lokalen Offline-Rezept-Fallback', async () => {
    mockGenerateRecipe.mockRejectedValueOnce(new Error('network error'));
    const { generateRecipe } = await import('../aiService');
    const recipe = await generateRecipe(prompt, pantryItems, aiPreferences, chosenIdea);
    expect(recipe.recipeTitle).toContain('Offline-Modus');
    expect(recipe.ingredients.length).toBeGreaterThan(0);
  });

  it('generateShoppingList nutzt lokalen Fallback fuer Grill-Prompt', async () => {
    mockGenerateShoppingList.mockRejectedValueOnce(new Error('429 rate limit'));
    const { generateShoppingList } = await import('../aiService');
    const list = await generateShoppingList('grill party', pantryItems, []);
    expect(list.length).toBeGreaterThan(0);
    expect(list.some((item) => item.name.toLowerCase().includes('bratwurst') || item.name === 'Baguette')).toBe(true);
  });

  it('generateShoppingList filtert bereits vorhandene Artikel', async () => {
    mockGenerateShoppingList.mockRejectedValueOnce(new Error('fetch_error'));
    const current: ShoppingListItem[] = [
      {
        id: 1,
        name: 'Baguette',
        quantity: 1,
        unit: 'Stk',
        category: 'Backwaren',
        sortOrder: 1,
        isChecked: false,
      },
    ];
    const { generateShoppingList } = await import('../aiService');
    const list = await generateShoppingList('grill', pantryItems, current);
    expect(list.find((i) => i.name === 'Baguette')).toBeUndefined();
  });
});
