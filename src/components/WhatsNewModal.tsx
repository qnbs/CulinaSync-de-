import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useModalA11y } from '../hooks/useModalA11y';

const VERSION = __APP_VERSION__;
const CHANGELOG = [
  'Universal Audit: Performance, Security, Accessibility, Best Practices',
  'Gemini Vision (Multi-Modal Input)',
  'Health Connect Export (Apple/Google/Samsung)',
  'Community-Sharing (IPFS/Nostr, opt-in)',
  'Voice 2.0 (Whisper.cpp lokal)',
  'Native Wrapper (Tauri/Capacitor, Deep-Linking)',
  'Global Error Boundary & Retry-Logik',
  'SEO/Meta/OG/Twitter, Preload, Print-Styles, Version-Badge',
];

export const WhatsNewModal: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem('culinasync_version') !== VERSION;
    } catch {
      return false;
    }
  });
  const modalRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  useModalA11y({
    isOpen: open,
    onClose: () => setOpen(false),
    containerRef: modalRef,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (open) {
      localStorage.setItem('culinasync_version', VERSION);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
      <div
        ref={modalRef}
        className="bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
        aria-describedby="whats-new-description"
        tabIndex={-1}
      >
        <button ref={closeButtonRef} type="button" onClick={() => setOpen(false)} className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-100 text-xl" aria-label={t('app.close')}>×</button>
        <h2 id="whats-new-title" className="text-xl font-bold mb-2 text-[var(--color-accent-400)]">Was ist neu? <span className="ml-2 text-xs bg-zinc-800 px-2 py-1 rounded">v{VERSION}</span></h2>
        <p id="whats-new-description" className="sr-only">Uebersicht der wichtigsten Aenderungen in dieser Version.</p>
        <ul className="list-disc pl-6 text-sm text-zinc-200 space-y-1">
          {CHANGELOG.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
};
