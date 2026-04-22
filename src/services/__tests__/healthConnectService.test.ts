import { beforeEach, describe, expect, it, vi } from 'vitest';

import { exportNutritionToHealthCsv } from '../healthConnectService';

describe('healthConnectService CSV hardening', () => {
  const createObjectUrlMock = vi.fn(() => 'blob:health');
  const revokeObjectUrlMock = vi.fn();
  const clickMock = vi.fn();
  const createdBlobs: Blob[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    createdBlobs.length = 0;

    URL.createObjectURL = vi.fn((blob: Blob) => {
      createdBlobs.push(blob);
      return createObjectUrlMock();
    });
    URL.revokeObjectURL = revokeObjectUrlMock;
    HTMLAnchorElement.prototype.click = clickMock;
  });

  it('quotes and neutralizes dangerous meal names in health CSV exports', async () => {
    exportNutritionToHealthCsv({
      type: 'google',
      date: '2026-04-22',
      nutrition: {
        calories: 420,
        protein: 12,
        fat: 8,
        carbs: 64,
        allergens: [],
        matchedIngredients: 3,
        totalIngredients: 4,
      },
      mealName: '=CMD("calc"), "Snack"\nNext line',
    });

    expect(createdBlobs).toHaveLength(1);
    const csvPayload = await createdBlobs[0].text();
    expect(csvPayload).toContain('Date,Calories,Protein,Fat,Carbs,Meal');
    expect(csvPayload).toContain('"\'=CMD(""calc""), ""Snack""\nNext line"');
  });

  it('writes apple exports as quoted CSV rows for each nutrient', async () => {
    exportNutritionToHealthCsv({
      type: 'apple',
      date: '2026-04-22T10:00:00.000Z',
      nutrition: {
        calories: 510,
        protein: 22,
        fat: 18,
        carbs: 41,
        allergens: ['milk'],
        matchedIngredients: 5,
        totalIngredients: 6,
      },
      mealName: '@Breakfast',
    });

    expect(createdBlobs).toHaveLength(1);
    const csvPayload = await createdBlobs[0].text();
    expect(csvPayload).toContain('"DietaryEnergyConsumed","2026-04-22T10:00:00.000Z","2026-04-22T10:00:00.000Z","510","kcal","\'@Breakfast"');
    expect(csvPayload).toContain('"DietaryCarbohydrates","2026-04-22T10:00:00.000Z","2026-04-22T10:00:00.000Z","41","g","\'@Breakfast"');
  });
});