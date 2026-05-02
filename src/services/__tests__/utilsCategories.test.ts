import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18next from 'i18next';
import { getCategoryForItem } from '../utils';
import { loadSettings } from '../settingsService';

vi.mock('../settingsService', () => ({
  loadSettings: vi.fn(),
}));

describe('getCategoryForItem', () => {
  beforeEach(() => {
    vi.mocked(loadSettings).mockReturnValue({
      shoppingList: { groupCheckedAtBottom: false, defaultSort: 'category', autoCategorize: true },
    } as ReturnType<typeof loadSettings>);
    vi.spyOn(i18next, 't').mockImplementation(
      ((key: string | string[]) => (Array.isArray(key) ? key[0] : key)) as typeof i18next.t,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns translated misc key when autoCategorize is off', () => {
    vi.mocked(loadSettings).mockReturnValue({
      shoppingList: { groupCheckedAtBottom: false, defaultSort: 'category', autoCategorize: false },
    } as ReturnType<typeof loadSettings>);
    expect(getCategoryForItem('Zucker')).toBe('shoppingList.categories.misc');
  });

  it('uses dairy category key for milk-like items', () => {
    expect(getCategoryForItem('Vollmilch')).toBe('shoppingList.categories.dairy');
  });

  it('uses produce key for vegetable-like items', () => {
    expect(getCategoryForItem('Tomate')).toBe('shoppingList.categories.produce');
  });
});
