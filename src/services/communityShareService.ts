// Community-Features: Rezept-Sharing via IPFS oder Nostr (opt-in, privacy-first)
// Minimaler Einstieg: IPFS-HTTP-API und nostr-tools (optional, kein Zwangs-Upload)
import { Recipe } from '../types';

export type ShareBackend = 'ipfs' | 'nostr';

export interface ShareOptions {
  backend: ShareBackend;
  recipe: Recipe;
  nostrRelays?: string[];
}

// --- IPFS ---
export const shareRecipeToIpfs = async (recipe: Recipe): Promise<string> => {
  // IPFS HTTP API (public gateway, z.B. infura.io)
  const endpoint = 'https://ipfs.infura.io:5001/api/v0/add';
  const formData = new FormData();
  formData.append('file', new Blob([JSON.stringify(recipe, null, 2)], { type: 'application/json' }), `${recipe.recipeTitle}.json`);
  const res = await fetch(endpoint, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('IPFS-Upload fehlgeschlagen');
  const data = await res.json();
  return `https://ipfs.io/ipfs/${data.Hash}`;
};

// --- Nostr ---
export const shareRecipeToNostr = async (recipe: Recipe, relays: string[] = ['wss://relay.nostr.band']): Promise<string> => {
  // nostr-tools dynamisch laden
  const { relayInit, getEventHash, signEvent } = await import('nostr-tools');
  const event = {
    kind: 30023, // custom kind for recipe
    created_at: Math.floor(Date.now() / 1000),
    tags: [['app', 'CulinaSync']],
    content: JSON.stringify(recipe),
    pubkey: '', // User muss pubkey/signing bereitstellen
  };
  // Hinweis: Für echtes Signieren braucht es User-Interaktion (z.B. NIP-07 Extension)
  // Hier nur Demo-Link:
  return 'nostr:share (Demo, siehe README)';
};
