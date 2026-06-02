import { describe, expect, it, vi } from 'vitest';
import { DEEPLINK_EVENT, handleDeepLink, parseDeepLink } from '../deepLinking';

describe('deepLinking', () => {
  it('parst Rezept- und Einkaufslisten-Links', () => {
    expect(parseDeepLink('culinasync://recipe/42')).toEqual({ type: 'recipe', id: '42' });
    expect(parseDeepLink('culinasync://shoppinglist')).toEqual({ type: 'shoppinglist' });
  });

  it('ignoriert ungültige URLs', () => {
    expect(parseDeepLink('https://example.com')).toBeNull();
    expect(parseDeepLink('culinasync://recipe/')).toBeNull();
    expect(parseDeepLink('not-a-url')).toBeNull();
  });

  it('dispatcht CustomEvent für handleDeepLink', () => {
    const handler = vi.fn();
    window.addEventListener(DEEPLINK_EVENT, handler);
    handleDeepLink('culinasync://recipe/7');
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(DEEPLINK_EVENT, handler);
  });
});
