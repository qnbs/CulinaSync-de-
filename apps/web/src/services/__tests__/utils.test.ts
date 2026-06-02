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

describe('utils (services)', () => {
  beforeEach(() => {
    vi.mocked(loadSettings).mockReturnValue(getDefaultSettings());
  });

  it('getCategoryForItem mappt Molkerei-Keywords', () => {
    expect(getCategoryForItem('Vollmilch 3,5%')).toContain('shoppingList.categories.dairy');
  });

  it('getCategoryForItem liefert misc wenn autoCategorize aus', () => {
    const s = getDefaultSettings();
    vi.mocked(loadSettings).mockReturnValue({
      ...s,
      shoppingList: { ...s.shoppingList, autoCategorize: false },
    });
    expect(getCategoryForItem('irgendwas')).toContain('shoppingList.categories.misc');
  });

  it('scaleIngredientQuantity skaliert Zahl und Bruch', () => {
    expect(scaleIngredientQuantity('2', 2)).toBe('4');
    expect(scaleIngredientQuantity('1/2', 2)).toBe('1');
    expect(scaleIngredientQuantity('2-3', 2)).toMatch(/4-6/);
    expect(scaleIngredientQuantity('n/a', 2)).toBe('n/a');
  });

  it('parseShoppingItemString erkennt Menge zuerst', () => {
    const a = parseShoppingItemString('2 kg Mehl');
    expect(a).toMatchObject({ name: 'Mehl', quantity: 2, unit: 'kg' });
  });

  it('parseShoppingItemString erkennt Menge am Ende', () => {
    const b = parseShoppingItemString('Mehl 1/2 kg');
    expect(b.name.toLowerCase()).toContain('mehl');
    expect(b.quantity).toBeCloseTo(0.5);
  });

  it('getCategoryForItem mappt weitere Lebensmittel-Gruppen', () => {
    expect(getCategoryForItem('Lachsfilet')).toContain('shoppingList.categories.meat');
    expect(getCategoryForItem('Vollkornbrot')).toContain('shoppingList.categories.bakery');
    expect(getCategoryForItem('Olivenöl extra')).toContain('shoppingList.categories.oils');
    expect(getCategoryForItem('Passata')).toContain('shoppingList.categories.canned');
    expect(getCategoryForItem('Currypulver')).toContain('shoppingList.categories.spices');
    expect(getCategoryForItem('Basilikum frisch')).toContain('shoppingList.categories.produce');
  });

  it('scaleIngredientQuantity behandelt leere Menge und Faktor 1', () => {
    expect(scaleIngredientQuantity('', 2)).toBe('');
    expect(scaleIngredientQuantity('3', 1)).toBe('3');
    expect(scaleIngredientQuantity('1/4', 4)).toBe('1');
    expect(scaleIngredientQuantity('0.25', 4)).toBe('1');
  });

  it('parseShoppingItemString liefert Defaults bei leerem Input', () => {
    expect(parseShoppingItemString('   ')).toEqual({ name: '', quantity: 1, unit: 'pantryUnits.pieceAbbr' });
  });
});
