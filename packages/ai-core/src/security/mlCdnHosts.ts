/**
 * Canonical allowlist for on-device model artifact hosts (WebLLM/MLC, transformers.js).
 * Mirrored in apps/web CSP via networkEndpointPolicy imports.
 */
export const ML_MODEL_CDN_HOSTS = [
  'huggingface.co',
  'cdn.jsdelivr.net',
  'cdn-lfs.huggingface.co',
  'cdn-lfs-us-1.huggingface.co',
  'cdn-lfs-eu-1.huggingface.co',
  'raw.githubusercontent.com',
] as const;

export const parseHttpsUrl = (raw: string): URL | null => {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') {
      return null;
    }
    return url;
  } catch {
    return null;
  }
};

/** MLC WebLLM wasm libs are served only from the mlc-ai org on GitHub raw. */
export const isAllowedMlCdnUrl = (raw: string): boolean => {
  const url = parseHttpsUrl(raw);
  if (!url) {
    return false;
  }
  const host = url.hostname.toLowerCase();
  for (const allowed of ML_MODEL_CDN_HOSTS) {
    if (host !== allowed && !host.endsWith(`.${allowed}`)) {
      continue;
    }
    if (allowed === 'raw.githubusercontent.com') {
      return url.pathname.startsWith('/mlc-ai/');
    }
    return true;
  }
  return false;
};
