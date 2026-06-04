import React, { useState } from 'react';
import { FlaskConical, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  isGitHubPagesHost,
  loadDemoPantrySeed,
  PAGES_DEMO_BANNER_DISMISSED_KEY,
} from '../services/demoSeedService';
import { useAppDispatch } from '../store/hooks';
import { addToast } from '../store/slices/uiSlice';

/** R-011: Optional CTA for GitHub Pages visitors (first session). */
export const DemoModeBanner: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(() => {
    if (!isGitHubPagesHost()) {
      return false;
    }
    try {
      return localStorage.getItem(PAGES_DEMO_BANNER_DISMISSED_KEY) !== '1';
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(false);

  if (!visible) {
    return null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(PAGES_DEMO_BANNER_DISMISSED_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  const handleLoadDemo = async () => {
    setLoading(true);
    try {
      const count = await loadDemoPantrySeed();
      dispatch(
        addToast({
          message: t('demo.banner.loaded', { count }),
          type: 'success',
        }),
      );
      dismiss();
    } catch {
      dispatch(addToast({ message: t('demo.banner.error'), type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2"
      role="region"
      aria-label={t('demo.banner.ariaLabel')}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-[var(--color-accent-500)]/30 bg-zinc-900/90 px-4 py-3">
        <FlaskConical className="text-[var(--color-accent-400)] shrink-0" size={20} aria-hidden />
        <p className="text-sm text-zinc-300 flex-1">{t('demo.banner.message')}</p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleLoadDemo()}
            className="px-3 py-1.5 rounded-lg bg-[var(--color-accent-500)] text-zinc-900 text-sm font-semibold hover:bg-[var(--color-accent-400)] disabled:opacity-50"
          >
            {loading ? t('demo.banner.loading') : t('demo.banner.cta')}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            aria-label={t('demo.banner.dismiss')}
          >
            <X size={18} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};
