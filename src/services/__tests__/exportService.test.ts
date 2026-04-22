import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = vi.hoisted(() => ({
  pantry: { toArray: vi.fn() },
  recipes: { toArray: vi.fn() },
  mealPlan: { toArray: vi.fn() },
  shoppingList: { toArray: vi.fn() },
}));

vi.mock('../db', () => ({
  db: mockDb,
}));

vi.mock('../settingsService', () => ({
  loadSettings: vi.fn(() => ({})),
}));

vi.mock('papaparse', () => ({
  unparse: vi.fn((rows: Record<string, unknown>[]) => JSON.stringify(rows)),
}));

import { exportFullDataAsCsv, exportRecipeToCsv, sanitizeCsvCell } from '../exportService';
import type { Recipe } from '../../types';

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