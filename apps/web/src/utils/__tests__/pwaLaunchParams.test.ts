import { describe, expect, it } from 'vitest';
import { getPageFromLocationSearch } from '../pwaLaunchParams';

describe('getPageFromLocationSearch', () => {
  it('mappt bekannte Manifest-Shortcut-Seiten', () => {
    expect(getPageFromLocationSearch('?page=pantry')).toBe('pantry');
    expect(getPageFromLocationSearch('?page=shopping-list')).toBe('shopping-list');
    expect(getPageFromLocationSearch('?page=chef')).toBe('chef');
  });

  it('gibt null für unbekannte oder fehlende Parameter zurück', () => {
    expect(getPageFromLocationSearch('')).toBeNull();
    expect(getPageFromLocationSearch('?page=unknown')).toBeNull();
  });
});
