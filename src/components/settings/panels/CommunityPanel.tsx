import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../services/db';
import { shareRecipeToIpfs, shareRecipeToNostr } from '../../../services/communityShareService';

export const CommunityPanel = () => {
  const recipes = useLiveQuery(() => db.recipes.toArray(), []);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [backend, setBackend] = useState<'ipfs' | 'nostr'>('ipfs');
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleShare = async () => {
    setError('');
    setShareUrl('');
    setLoading(true);
    try {
      if (!recipes) return;
      const recipe = recipes.find(r => r.id === selectedRecipeId);
      if (!recipe) return;
      let url = '';
      if (backend === 'ipfs') {
        url = await shareRecipeToIpfs(recipe);
      } else {
        url = await shareRecipeToNostr(recipe);
      }
      setShareUrl(url);
    } catch (e: any) {
      setError(e.message || 'Fehler beim Teilen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Community-Sharing (Opt-in)</h2>
      <div>
        <label className="block mb-1">Rezept wählen:</label>
        <select value={selectedRecipeId} onChange={e => setSelectedRecipeId(e.target.value)} className="w-full p-2 rounded">
          <option value="">–</option>
          {recipes && recipes.map(r => (
            <option key={r.id} value={r.id}>{r.recipeTitle}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Backend:</label>
        <select value={backend} onChange={e => setBackend(e.target.value as 'ipfs' | 'nostr')} className="w-full p-2 rounded">
          <option value="ipfs">IPFS (dezentral, anonymisiert)</option>
          <option value="nostr">Nostr (self-hosted, privacy-first)</option>
        </select>
      </div>
      <button onClick={handleShare} className="bg-[var(--color-accent-500)] text-white px-4 py-2 rounded" disabled={loading || !selectedRecipeId}>
        {loading ? 'Teilen…' : 'Rezept teilen'}
      </button>
      {shareUrl && (
        <div className="break-all text-xs bg-zinc-800 p-2 rounded">Geteilt: <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="underline">{shareUrl}</a></div>
      )}
      {error && <div className="text-red-500 text-xs">{error}</div>}
      <p className="text-xs text-zinc-400">Rezepte werden nur auf Wunsch geteilt. Keine automatische Veröffentlichung. IPFS ist öffentlich, Nostr kann self-hosted genutzt werden.</p>
    </div>
  );
};
