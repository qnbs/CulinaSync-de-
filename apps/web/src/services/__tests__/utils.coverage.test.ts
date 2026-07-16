import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDefaultSettings } from '../settingsMerge';

vi.mock('i18next', () => ({
  default: {
    t: (key: string) => key,
    language: 'de',
  },
}));

vi.mock('../settingsService', () => ({
  loadSettings: vi.fn(),
}));

import { loadSettings } from '../settingsService';
import { getCategoryForItem, parseShoppingItemString, scaleIngredientQuantity } from '../utils';

describe('utils category + quantity branches', () => {
  beforeEach(() => {
    vi.mocked(loadSettings).mockReturnValue(getDefaultSettings());
  });

  it('ohne autoCategorize → misc', () => {
    vi.mocked(loadSettings).mockReturnValue({
      ...getDefaultSettings(),
      shoppingList: { ...getDefaultSettings().shoppingList, autoCategorize: false },
    });
    expect(getCategoryForItem('Milch')).toContain('shoppingList.categories.misc');
  });

  it.each([
    ['Vollmilch', 'dairy'],
    ['Tomate', 'produce'],
    ['Huhn', 'meat'],
    ['Baguette', 'bakery'],
    ['Nudeln', 'dryGoods'],
    ['Olivenöl', 'oils'],
    ['Passata', 'canned'],
    ['Pfeffer', 'spices'],
    ['xyz-unknown', 'misc'],
  ] as const)('kategorisiert %s', (name, key) => {
    expect(getCategoryForItem(name)).toContain(`shoppingList.categories.${key}`);
  });

  it('skaliert Fraktionen und kleine Werte (scaleFactor ≠ 1)', () => {
    expect(scaleIngredientQuantity('1/8', 1)).toBe('1/8');
    expect(scaleIngredientQuantity('', 2)).toBe('');
    expect(scaleIngredientQuantity('0', 2)).toBe('0');
    expect(scaleIngredientQuantity('0.25', 2)).toBe('1/2');
    expect(scaleIngredientQuantity('0.5', 2)).toBe('1');
    expect(scaleIngredientQuantity('1/4', 3)).toBe('3/4');
    expect(scaleIngredientQuantity('1/3', 2)).toBe('2/3');
    expect(scaleIngredientQuantity('1/8', 2)).toBe('1/4');
    expect(scaleIngredientQuantity('1/16', 2)).toBe('1/8');
    expect(scaleIngredientQuantity('0.05', 2)).toBe('0.1');
    expect(scaleIngredientQuantity('1.5', 2)).toBe('3');
    expect(scaleIngredientQuantity('3', 2)).toBe('6');
    expect(scaleIngredientQuantity('12', 2)).toBe('24');
    expect(scaleIngredientQuantity('2-3', 2)).toBe('4-6');
    expect(scaleIngredientQuantity('ca.', 2)).toBe('ca.');
  });

  it('parseShoppingItemString deckt Start/Ende/Leer/Bruch ab', () => {
    expect(parseShoppingItemString('')).toEqual({
      name: '',
      quantity: 1,
      unit: 'pantryUnits.pieceAbbr',
    });
    expect(parseShoppingItemString('1/2 kg Mehl')).toMatchObject({
      name: 'Mehl',
      quantity: 0.5,
      unit: 'kg',
    });
    expect(parseShoppingItemString('Mehl 2 kg')).toMatchObject({
      name: 'Mehl',
      quantity: 2,
      unit: 'kg',
    });
    expect(parseShoppingItemString('Basilikum')).toMatchObject({
      name: 'Basilikum',
      quantity: 1,
    });
    expect(parseShoppingItemString('1/0 kg X').quantity).toBe(1);
    expect(parseShoppingItemString('2 Mehl')).toMatchObject({ name: 'Mehl', quantity: 2 });
    expect(parseShoppingItemString('Mehl 2')).toMatchObject({ name: 'Mehl', quantity: 2 });
  });
});
