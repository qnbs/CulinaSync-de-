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
});
