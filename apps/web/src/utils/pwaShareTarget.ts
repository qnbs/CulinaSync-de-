export type ShareTargetPayload = {
  title?: string;
  text?: string;
  url?: string;
};

export const parseShareTargetFromSearch = (search: string): ShareTargetPayload | null => {
  const params = new URLSearchParams(search);
  if (params.get('pwa-share') !== '1' && !params.has('title') && !params.has('text') && !params.has('url')) {
    return null;
  }

  const title = params.get('title')?.trim() || undefined;
  const text = params.get('text')?.trim() || undefined;
  const url = params.get('url')?.trim() || undefined;

  if (!title && !text && !url) {
    return null;
  }

  return { title, text, url };
};

export const summarizeSharePayload = (payload: ShareTargetPayload): string => {
  const parts = [payload.title, payload.text, payload.url].filter(Boolean);
  return parts.join(' — ').slice(0, 500);
};

export const stripShareTargetFromUrl = (): void => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('pwa-share');
  url.searchParams.delete('pwa-file');
  url.searchParams.delete('title');
  url.searchParams.delete('text');
  url.searchParams.delete('url');
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, '', next);
};
