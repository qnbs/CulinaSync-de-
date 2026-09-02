import { describe, expect, it, beforeAll } from 'vitest';
import i18next from 'i18next';
import type { TFunction } from 'i18next';
import translationEN from '@/locales/en';
import { foodDatabase } from '@/data/foodDatabase';
import {
  findFoodEntryByName,
  formatFoodAllergens,
  getFoodDisplayName,
  pantryCategoryLabelForFood,
} from '../foodDatabaseLabels';

describe('foodDatabaseLabels', () => {
  const t = i18next.t.bind(i18next) as TFunction;

  beforeAll(() => {
    i18next.addResourceBundle('en', 'translation', translationEN, true, true);
  });

  it('getFoodDisplayName nutzt i18n oder id als Fallback', () => {
    expect(getFoodDisplayName('apple', t)).toBeTruthy();
    expect(getFoodDisplayName('unknown_food_id', t)).toBe('unknown_food_id');
  });

  it('formatFoodAllergens behandelt undefined und formatiert Codes', () => {
    expect(formatFoodAllergens(undefined, t)).toBe('');
    const formatted = formatFoodAllergens(['egg', 'milk'], t);
    expect(formatted).toContain(',');
  });

  it('findFoodEntryByName ignoriert leere Eingaben', () => {
    expect(findFoodEntryByName('', t)).toBeUndefined();
    expect(findFoodEntryByName('   ', t)).toBeUndefined();
  });

  it('findFoodEntryByName matcht aktuelle, deutsche und englische Namen', () => {
    expect(findFoodEntryByName('Apfel', t)?.id).toBe('apple');
    expect(findFoodEntryByName('Apple', t)?.id).toBe('apple');
    expect(findFoodEntryByName('Apf', t)?.id).toBe('apple');
    expect(findFoodEntryByName('App', t)?.id).toBe('apple');
  });

  it('pantryCategoryLabelForFood liefert Kategorie-Label', () => {
    const apple = foodDatabase.find((entry) => entry.id === 'apple');
    expect(apple).toBeDefined();
    expect(pantryCategoryLabelForFood(apple!, t)).toBeTruthy();
  });
});
