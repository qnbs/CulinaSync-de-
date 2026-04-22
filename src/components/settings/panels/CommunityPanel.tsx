import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../../../services/db';
import { shareRecipeToIpfs, shareRecipeToNostr } from '../../../services/communityShareService';

export const CommunityPanel = () => {
  const { t } = useTranslation();
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
      const recipe = recipes.find(r => r.id === Number(selectedRecipeId));
      if (!recipe) return;
      let url = '';
      if (backend === 'ipfs') {
        url = await shareRecipeToIpfs(recipe);
      } else {
        url = await shareRecipeToNostr(recipe);
      }
      setShareUrl(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : t('settings.community.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">{t('settings.community.title')}</h2>
      <div>
        <label className="block mb-1">{t('settings.community.recipeLabel')}</label>
        <select value={selectedRecipeId} onChange={e => setSelectedRecipeId(e.target.value)} className="w-full p-2 rounded">
          <option value="">–</option>
          {recipes && recipes.map(r => (
            <option key={r.id} value={r.id}>{r.recipeTitle}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">{t('settings.community.backendLabel')}</label>
        <select value={backend} onChange={e => setBackend(e.target.value as 'ipfs' | 'nostr')} className="w-full p-2 rounded">
          <option value="ipfs">{t('settings.community.backends.ipfs')}</option>
          <option value="nostr">{t('settings.community.backends.nostr')}</option>
        </select>
      </div>
      <button onClick={handleShare} className="bg-[var(--color-accent-500)] text-white px-4 py-2 rounded" disabled={loading || !selectedRecipeId}>
        {loading ? t('settings.community.sharing') : t('settings.community.share')}
      </button>
      {shareUrl && (
        <div className="break-all text-xs bg-zinc-800 p-2 rounded">{t('settings.community.shared')} <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="underline">{shareUrl}</a></div>
      )}
      {error && <div className="text-red-500 text-xs">{error}</div>}
      <p className="text-xs text-zinc-400">{t('settings.community.helper')}</p>
    </div>
  );
};
