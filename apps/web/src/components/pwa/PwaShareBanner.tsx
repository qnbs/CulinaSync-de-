import React from 'react';
import { Share2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTransientUiStore } from '../../store/transientUiStore';
import { Button } from '../ui';

export const PwaShareBanner: React.FC = () => {
  const { t } = useTranslation();
  const pendingShareText = useTransientUiStore((s) => s.pendingShareText);
  const setPendingShareText = useTransientUiStore((s) => s.setPendingShareText);

  if (!pendingShareText) {
    return null;
  }

  return (
    <div
      className="mb-4 flex items-start gap-3 rounded-2xl border border-[var(--color-accent-500)]/30 bg-[var(--color-accent-500)]/10 px-4 py-3"
      role="status"
    >
      <Share2 className="h-5 w-5 shrink-0 text-[var(--color-accent-400)] mt-0.5" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-100">{t('app.pwa.shareReceivedTitle')}</p>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{pendingShareText}</p>
        <p className="text-xs text-zinc-500 mt-1">{t('app.pwa.shareReceivedHint')}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0"
        aria-label={t('common.close')}
        onClick={() => setPendingShareText(null)}
      >
        <X size={16} aria-hidden />
      </Button>
    </div>
  );
};
