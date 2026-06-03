import { useEffect, useState } from 'react';

export type HelpSystemStatus = {
  online: boolean;
  isStandalone: boolean;
  storageSummary: string | null;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

// QNBS-v3: Live-Systemstatus für Help/About — ohne Dexie-Zugriff, nur Browser-APIs
export const useHelpSystemStatus = (): HelpSystemStatus => {
  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  });
  const [storageSummary, setStorageSummary] = useState<string | null>(null);

  useEffect(() => {
    const syncOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', syncOnline);
    window.addEventListener('offline', syncOnline);

    void (async () => {
      if (!navigator.storage?.estimate) return;
      try {
        const { usage = 0, quota = 0 } = await navigator.storage.estimate();
        if (quota > 0) {
          const pct = Math.min(100, Math.round((usage / quota) * 100));
          setStorageSummary(`${formatBytes(usage)} / ${formatBytes(quota)} (${pct}%)`);
        } else if (usage > 0) {
          setStorageSummary(formatBytes(usage));
        }
      } catch {
        setStorageSummary(null);
      }
    })();

    return () => {
      window.removeEventListener('online', syncOnline);
      window.removeEventListener('offline', syncOnline);
    };
  }, []);

  return { online, isStandalone, storageSummary };
};
