import React from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';

interface OfflineStatusBarProps {
  isOnline: boolean;
}

const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({ isOnline }) => {
  const { t } = useTranslation();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-500/30 bg-amber-950/90 px-4 py-2 text-center text-sm text-amber-100 backdrop-blur-sm"
    >
      <p className="mx-auto flex max-w-3xl items-center justify-center gap-2 font-medium">
        <WifiOff className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
        <span>{t('app.offline.banner')}</span>
      </p>
      <p className="mx-auto mt-0.5 max-w-3xl text-xs text-amber-200/80">{t('app.offline.aiLimited')}</p>
    </div>
  );
};

export default OfflineStatusBar;
