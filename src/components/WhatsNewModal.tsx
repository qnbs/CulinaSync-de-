import React, { useEffect, useState } from 'react';

const VERSION = '2026.03.04';
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
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem('culinasync_version') !== VERSION;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (open) {
      localStorage.setItem('culinasync_version', VERSION);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
        <button onClick={() => setOpen(false)} className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-100 text-xl">×</button>
        <h2 className="text-xl font-bold mb-2 text-[var(--color-accent-400)]">Was ist neu? <span className="ml-2 text-xs bg-zinc-800 px-2 py-1 rounded">v{VERSION}</span></h2>
        <ul className="list-disc pl-6 text-sm text-zinc-200 space-y-1">
          {CHANGELOG.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
};
