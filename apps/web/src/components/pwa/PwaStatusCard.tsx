import React, { useMemo } from 'react';
import { Smartphone, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { detectPwaCapabilities } from '../../utils/pwaCapabilities';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Badge, Button, Card } from '../ui';

type PwaStatusCardProps = {
  isStandalone: boolean;
  isIos: boolean;
  canInstall: boolean;
  onInstall?: () => void;
  onCheckUpdate?: () => void;
};

export const PwaStatusCard: React.FC<PwaStatusCardProps> = ({
  isStandalone,
  isIos,
  canInstall,
  onInstall,
  onCheckUpdate,
}) => {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const capabilities = useMemo(() => detectPwaCapabilities(), []);

  const supported = capabilities.filter((c) => c.supported);
  const unsupported = capabilities.filter((c) => !c.supported);

  return (
    <Card variant="flat" padding="md" className="space-y-4">
      <div className="flex items-center gap-2">
        <Smartphone className="h-5 w-5 text-[var(--color-accent-400)]" aria-hidden />
        <h4 className="font-bold text-zinc-100">{t('settings.data.pwa.title')}</h4>
      </div>
      <p className="text-sm text-zinc-400">{t('settings.data.pwa.description')}</p>

      <div className="flex flex-wrap gap-2">
        <Badge tone={isStandalone ? 'success' : 'neutral'}>
          {isStandalone ? t('settings.data.pwa.standalone') : t('settings.data.pwa.browserTab')}
        </Badge>
        <Badge tone={isOnline ? 'success' : 'warning'}>
          {isOnline ? (
            <span className="inline-flex items-center gap-1">
              <Wifi size={12} aria-hidden /> {t('settings.data.pwa.online')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <WifiOff size={12} aria-hidden /> {t('settings.data.pwa.offline')}
            </span>
          )}
        </Badge>
      </div>

      {isIos && !isStandalone && (
        <p className="text-xs text-zinc-500 rounded-xl bg-zinc-900/60 p-3 border border-zinc-800">
          {t('settings.data.pwa.iosInstallHint')}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {canInstall && onInstall && (
          <Button type="button" size="sm" onClick={onInstall}>
            {t('app.installReminder.install')}
          </Button>
        )}
        {onCheckUpdate && (
          <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={onCheckUpdate}>
            <RefreshCw size={14} aria-hidden />
            {t('settings.data.pwa.checkUpdate')}
          </Button>
        )}
      </div>

      <details className="text-xs text-zinc-500">
        <summary className="cursor-pointer font-medium text-zinc-400 hover:text-zinc-300">
          {t('settings.data.pwa.capabilitiesTitle')}
        </summary>
        <ul className="mt-2 space-y-1 list-disc pl-4">
          {supported.map((c) => (
            <li key={c.id} className="text-emerald-400/90">
              {t(`settings.data.pwa.capability.${c.id}`)}
            </li>
          ))}
          {unsupported.map((c) => (
            <li key={c.id} className="text-zinc-600">
              {t(`settings.data.pwa.capability.${c.id}`)} ({t('settings.data.pwa.notSupported')})
            </li>
          ))}
        </ul>
      </details>
    </Card>
  );
};
