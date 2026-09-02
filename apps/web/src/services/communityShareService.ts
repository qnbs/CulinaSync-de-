// Community-Features: Rezept-Sharing via IPFS oder Nostr (opt-in, privacy-first)
import { assertAllowedEndpoint } from '../config/networkEndpointPolicy';
import { Recipe } from '../types';

export type ShareBackend = 'ipfs' | 'nostr';

export interface ShareOptions {
  backend: ShareBackend;
  recipe: Recipe;
  nostrRelays?: string[];
}

// --- IPFS ---
export const shareRecipeToIpfs = async (recipe: Recipe): Promise<string> => {
  const endpoint = 'https://ipfs.infura.io:5001/api/v0/add';
  assertAllowedEndpoint(endpoint, 'community_share');
  const formData = new FormData();
  formData.append('file', new Blob([JSON.stringify(recipe, null, 2)], { type: 'application/json' }), `${recipe.recipeTitle}.json`);
  const res = await fetch(endpoint, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('IPFS-Upload fehlgeschlagen');
  const data = await res.json();
  return `https://ipfs.io/ipfs/${data.Hash}`;
};

// --- Nostr ---
export const shareRecipeToNostr = async (recipe: Recipe, relays: string[] = ['wss://relay.nostr.band']): Promise<string> => {
  void recipe;
  void relays;
  // Hinweis: Für echtes Signieren braucht es User-Interaktion (z.B. NIP-07 Extension)
  // Hier nur Demo-Link:
  return 'nostr:share (Demo, siehe README)';
};
