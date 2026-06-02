import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Recipe } from '../../types';
import { shareRecipeToIpfs, shareRecipeToNostr } from '../communityShareService';

const sampleRecipe = (): Recipe => ({
  id: 1,
  recipeTitle: 'Test-Rezept',
  shortDescription: 'Kurz',
  prepTime: '10',
  cookTime: '20',
  totalTime: '30',
  servings: '2',
  difficulty: 'leicht',
  ingredients: [{ sectionTitle: 'Haupt', items: [{ quantity: '1', unit: 'kg', name: 'Mehl' }] }],
  instructions: ['Mischen'],
  nutritionPerServing: { calories: '0', protein: '0', carbs: '0', fat: '0' },
  tags: {
    course: [],
    cuisine: [],
    occasion: [],
    mainIngredient: [],
    prepMethod: [],
    diet: [],
  },
  expertTips: [],
});

describe('communityShareService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shareRecipeToIpfs liefert Gateway-URL bei Erfolg', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ Hash: 'QmTestHash' }),
      }),
    );

    const url = await shareRecipeToIpfs(sampleRecipe());
    expect(url).toBe('https://ipfs.io/ipfs/QmTestHash');

    vi.unstubAllGlobals();
  });

  it('shareRecipeToIpfs wirft bei HTTP-Fehler', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(shareRecipeToIpfs(sampleRecipe())).rejects.toThrow(/IPFS-Upload/i);
    vi.unstubAllGlobals();
  });

  it('shareRecipeToNostr liefert Demo-Link', async () => {
    const link = await shareRecipeToNostr(sampleRecipe());
    expect(link).toContain('nostr:share');
  });
});
