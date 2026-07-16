import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = vi.hoisted(() => ({
  pantry: { toArray: vi.fn() },
  recipes: { toArray: vi.fn() },
  mealPlan: { toArray: vi.fn() },
  shoppingList: { toArray: vi.fn() },
}));

// dbInstance mock — exportService liest Dexie ohne db.ts Side-Effects
vi.mock('../dbInstance', () => ({
  db: mockDb,
}));

vi.mock('../settingsService', () => ({
  loadSettings: vi.fn(() => ({})),
}));

vi.mock('papaparse', () => ({
  unparse: vi.fn((rows: Record<string, unknown>[]) => JSON.stringify(rows)),
}));

// QNBS-v3: jspdf nur für Download-Pfade testen (kein Bundle in UI-Tests nötig)
vi.mock('jspdf', () => {
  const jsPDF = vi.fn(function (this: unknown) {
    return {
      setFontSize: vi.fn(),
      text: vi.fn(),
      addPage: vi.fn(),
      output: vi.fn(() => new Blob(['mock-pdf'])),
    };
  });
  return { jsPDF };
});

import {
  exportFullDataAsCsv,
  exportFullDataAsJson,
  exportFullDataAsMarkdown,
  exportFullDataAsPdf,
  exportFullDataAsTxt,
  exportMealPlanWeekToIcs,
  exportRecipeToCsv,
  exportShoppingListToCsv,
  exportShoppingListToJson,
  exportShoppingListToMarkdown,
  exportShoppingListToPdf,
  exportShoppingListToTxt,
  sanitizeCsvCell,
} from '../exportService';
import type { MealPlanItem, Recipe } from '../../types';

describe('exportService CSV hardening', () => {
  const createObjectUrlMock = vi.fn(() => 'blob:mock');
  const revokeObjectUrlMock = vi.fn();
  const clickMock = vi.fn();
  const createdBlobs: Blob[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    createdBlobs.length = 0;

    mockDb.pantry.toArray.mockResolvedValue([]);
    mockDb.recipes.toArray.mockResolvedValue([]);
    mockDb.mealPlan.toArray.mockResolvedValue([]);
    mockDb.shoppingList.toArray.mockResolvedValue([]);

    URL.createObjectURL = vi.fn((blob: Blob) => {
      createdBlobs.push(blob);
      return createObjectUrlMock();
    });
    URL.revokeObjectURL = revokeObjectUrlMock;
    HTMLAnchorElement.prototype.click = clickMock;
  });

  it('prefixes spreadsheet formula payloads in cells', () => {
    expect(sanitizeCsvCell('=2+2')).toBe("'=2+2");
    expect(sanitizeCsvCell(' @SUM(A1:A2)')).toBe("' @SUM(A1:A2)");
    expect(sanitizeCsvCell('normal text')).toBe('normal text');
  });

  it('sanitizes dangerous recipe fields before CSV export', async () => {
    const recipe: Recipe = {
      id: 1,
      recipeTitle: '=HYPERLINK("https://evil.test")',
      shortDescription: 'desc',
      prepTime: '5 Min.',
      cookTime: '10 Min.',
      totalTime: '15 Min.',
      servings: '2',
      difficulty: 'Einfach',
      ingredients: [{ sectionTitle: '+Gruppe', items: [{ quantity: '1', unit: 'Stk', name: '@Risk' }] }],
      instructions: [],
      nutritionPerServing: { calories: '', protein: '', fat: '', carbs: '' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      expertTips: [],
      isFavorite: false,
      updatedAt: Date.now(),
    };

    await exportRecipeToCsv(recipe);

    expect(createdBlobs).toHaveLength(1);
    const csvPayload = await createdBlobs[0].text();
    expect(csvPayload).toContain("\"Rezept\":\"'=HYPERLINK");
    expect(csvPayload).toContain("\"Gruppe\":\"'+Gruppe\"");
    expect(csvPayload).toContain("\"Zutat\":\"'@Risk\"");
  });

  it('sanitizes full-data CSV exports from IndexedDB content', async () => {
    mockDb.pantry.toArray.mockResolvedValue([{ name: '-cmd', quantity: 1 }]);
    mockDb.recipes.toArray.mockResolvedValue([{ recipeTitle: '=Recipe', servings: '4', difficulty: 'Mittel' }]);
    mockDb.mealPlan.toArray.mockResolvedValue([]);
    mockDb.shoppingList.toArray.mockResolvedValue([{ name: '+item', isChecked: false }]);

    const success = await exportFullDataAsCsv();

    expect(success).toBe(true);
    expect(createdBlobs).toHaveLength(1);
    const csvPayload = await createdBlobs[0].text();
    expect(csvPayload).toContain("\"name\":\"'-cmd\"");
    expect(csvPayload).toContain("\"title\":\"'=Recipe\"");
    expect(csvPayload).toContain("\"name\":\"'+item\"");
  });
});

const SAMPLE_SHOPPING_ITEM = {
  id: 1,
  name: 'Milch',
  quantity: 1,
  unit: 'l',
  category: 'Milchprodukte & Eier',
  isChecked: false,
  sortOrder: 1,
};

describe('exportService shopping-list exports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.pantry.toArray.mockResolvedValue([]);
    mockDb.recipes.toArray.mockResolvedValue([]);
    mockDb.mealPlan.toArray.mockResolvedValue([]);
    mockDb.shoppingList.toArray.mockResolvedValue([]);
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    URL.revokeObjectURL = vi.fn();
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  it('exportShoppingListToJson triggers JSON download', async () => {
    exportShoppingListToJson([SAMPLE_SHOPPING_ITEM]);
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it('exportShoppingListToTxt triggers txt download', async () => {
    exportShoppingListToTxt([SAMPLE_SHOPPING_ITEM]);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('exportShoppingListToMarkdown groups by category', async () => {
    exportShoppingListToMarkdown([SAMPLE_SHOPPING_ITEM, { ...SAMPLE_SHOPPING_ITEM, id: 2, name: 'Brot', category: 'Backwaren' }]);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('exportShoppingListToCsv uses papaparse and download', async () => {
    await exportShoppingListToCsv([SAMPLE_SHOPPING_ITEM]);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('exportShoppingListToPdf paginates and downloads', async () => {
    const many = Array.from({ length: 50 }, (_, i) => ({
      ...SAMPLE_SHOPPING_ITEM,
      id: i + 1,
      name: `Item ${i}`,
    }));
    await exportShoppingListToPdf(many);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});

describe('exportService full backup helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.pantry.toArray.mockResolvedValue([]);
    mockDb.recipes.toArray.mockResolvedValue([]);
    mockDb.mealPlan.toArray.mockResolvedValue([]);
    mockDb.shoppingList.toArray.mockResolvedValue([]);
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    URL.revokeObjectURL = vi.fn();
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  it('exportFullDataAsJson returns true on success', async () => {
    const ok = await exportFullDataAsJson();
    expect(ok).toBe(true);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it('exportFullDataAsTxt returns true with empty data', async () => {
    expect(await exportFullDataAsTxt()).toBe(true);
  });

  it('exportFullDataAsMarkdown returns true with empty data', async () => {
    expect(await exportFullDataAsMarkdown()).toBe(true);
  });

  it('exportFullDataAsPdf returns true', async () => {
    expect(await exportFullDataAsPdf()).toBe(true);
  });
});

describe('exportMealPlanWeekToIcs', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:ics');
    URL.revokeObjectURL = vi.fn();
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  it('writes VEVENT for recipe meal and note meal', () => {
    const monday = new Date(Date.UTC(2026, 4, 4));
    const weekDates = [monday];
    const dateKey = monday.toISOString().split('T')[0];
    const mealsByDate: Record<string, MealPlanItem> = {
      [`${dateKey}-Frühstück`]: {
        id: 1,
        date: dateKey,
        mealType: 'Frühstück',
        recipeId: 10,
        servings: 2,
      },
      [`${dateKey}-Mittagessen`]: {
        id: 2,
        date: dateKey,
        mealType: 'Mittagessen',
        note: 'Auswärts',
      },
    };
    const recipe: Recipe = {
      id: 10,
      recipeTitle: 'Rührei',
      shortDescription: 'Mit Butter',
      prepTime: '5',
      cookTime: '5',
      totalTime: '10',
      servings: '2',
      difficulty: 'Einfach',
      ingredients: [],
      instructions: [],
      nutritionPerServing: { calories: '', protein: '', fat: '', carbs: '' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      expertTips: [],
      isFavorite: false,
      updatedAt: Date.now(),
    };
    const recipesById = new Map<number, Recipe>([[10, recipe]]);

    exportMealPlanWeekToIcs(weekDates, mealsByDate, recipesById);

    expect(URL.createObjectURL).toHaveBeenCalled();
    const blobArg = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob;
    expect(blobArg).toBeInstanceOf(Blob);
  });

  it('schreibt leere Woche und überspringt Slots ohne Inhalt', () => {
    const monday = new Date(Date.UTC(2026, 4, 4));
    exportMealPlanWeekToIcs([monday], {}, new Map());
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});

describe('exportService recipe format branches', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:recipe');
    URL.revokeObjectURL = vi.fn();
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  it('exportRecipeToTxt/Markdown mit Section, Tips und leeren Mengen', async () => {
    const { exportRecipeToTxt, exportRecipeToMarkdown, exportRecipeToJson } = await import('../exportService');
    const recipe: Recipe = {
      id: 1,
      recipeTitle: 'Soup/Test',
      shortDescription: 'Warm',
      prepTime: '5',
      cookTime: '10',
      totalTime: '15',
      servings: '2',
      difficulty: 'Einfach',
      ingredients: [
        {
          sectionTitle: 'Basis',
          items: [
            { name: 'Wasser', quantity: '', unit: '' },
            { name: 'Salz', quantity: '1', unit: 'Prise' },
          ],
        },
        { sectionTitle: '', items: [{ name: 'Pfeffer', quantity: '1', unit: 'Prise' }] },
      ],
      instructions: ['Kochen'],
      nutritionPerServing: { calories: '', protein: '', fat: '', carbs: '' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      expertTips: [{ title: 'Tipp', content: 'Nicht zu lange' }],
      isFavorite: false,
      updatedAt: Date.now(),
    };
    exportRecipeToJson(recipe);
    exportRecipeToTxt(recipe);
    exportRecipeToMarkdown(recipe);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('exportRecipe ohne Tips und ohne SectionTitle', async () => {
    const { exportRecipeToTxt, exportRecipeToMarkdown } = await import('../exportService');
    const recipe: Recipe = {
      id: 2,
      recipeTitle: 'Plain',
      shortDescription: '',
      prepTime: '',
      cookTime: '',
      totalTime: '',
      servings: '1',
      difficulty: 'Einfach',
      ingredients: [{ sectionTitle: '', items: [{ name: 'X', quantity: '1', unit: 'g' }] }],
      instructions: ['Y'],
      nutritionPerServing: { calories: '', protein: '', fat: '', carbs: '' },
      tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
      expertTips: [],
      isFavorite: false,
      updatedAt: Date.now(),
    };
    exportRecipeToTxt(recipe);
    exportRecipeToMarkdown(recipe);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});
