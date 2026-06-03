import type { TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';
import { isPantryCategoryId, resolvePantryCategoryLabel } from '../categoryLabels';

describe('categoryLabels', () => {
  const t = vi.fn((key: string, opts?: { lng?: string }) => {
    if (opts?.lng === 'de' && key === 'pantry.categories.dairy') return 'Milchprodukte';
    if (opts?.lng === 'de' && key === 'shoppingList.categories.produce') return 'Obst & Gemuese';
    if (key === 'shoppingList.categories.misc') return 'Sonstiges';
    if (key === 'pantry.categories.dairy') return 'Dairy';
    if (key === 'shoppingList.categories.produce') return 'Produce';
    return key;
  }) as unknown as TFunction;

  it('isPantryCategoryId validates known ids', () => {
    expect(isPantryCategoryId('dairy')).toBe(true);
    expect(isPantryCategoryId('unknown')).toBe(false);
  });

  it('resolvePantryCategoryLabel handles empty category', () => {
    expect(resolvePantryCategoryLabel(undefined, t)).toBe('Sonstiges');
  });

  it('resolvePantryCategoryLabel maps pantry keys', () => {
    expect(resolvePantryCategoryLabel('dairy', t)).toBe('Dairy');
  });

  it('resolvePantryCategoryLabel passes through i18n keys', () => {
    expect(resolvePantryCategoryLabel('shoppingList.categories.produce', t)).toBe('Produce');
  });

  it('resolvePantryCategoryLabel maps legacy German pantry labels', () => {
    expect(resolvePantryCategoryLabel('Milchprodukte', t)).toBe('Dairy');
  });

  it('resolvePantryCategoryLabel maps legacy shopping labels', () => {
    expect(resolvePantryCategoryLabel('Obst & Gemuese', t)).toBe('Produce');
    expect(resolvePantryCategoryLabel('Produce', t)).toBe('Produce');
  });

  it('resolvePantryCategoryLabel returns raw unknown labels', () => {
    expect(resolvePantryCategoryLabel('Custom Shelf', t)).toBe('Custom Shelf');
  });
});
