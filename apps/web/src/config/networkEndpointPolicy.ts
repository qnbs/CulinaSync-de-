/**
 * Runtime network endpoint policy for outbound connections.
 * Complements CSP connect-src — blocks disallowed targets before fetch().
 */

export type NetworkEndpointPurpose =
  | 'ollama_loopback'
  | 'gemini_api'
  | 'ai_model_cdn'
  | 'user_sync'
  | 'general_https';

/** Hostnames allowed for on-device model weights and WASM runtimes. */
export const AI_MODEL_CDN_HOSTS = [
  'huggingface.co',
  'cdn.jsdelivr.net',
  'cdn-lfs.huggingface.co',
  'cdn-lfs-us-1.huggingface.co',
  'cdn-lfs-eu-1.huggingface.co',
] as const;

/** Gemini generative language API host. */
export const GEMINI_API_HOST = 'generativelanguage.googleapis.com';

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]']);

export const parseHttpUrl = (raw: string): URL | null => {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    return url;
  } catch {
    return null;
  }
};

export const isLoopbackHost = (hostname: string): boolean => LOOPBACK_HOSTS.has(hostname.toLowerCase());

/** Ollama connector must stay on loopback HTTP(S) — no remote inference endpoints. */
export const isAllowedOllamaBaseUrl = (raw: string): boolean => {
  const url = parseHttpUrl(raw);
  if (!url) return false;
  return isLoopbackHost(url.hostname);
};

export const isAllowedAiModelCdnUrl = (raw: string): boolean => {
  const url = parseHttpUrl(raw);
  if (!url || url.protocol !== 'https:') return false;
  const host = url.hostname.toLowerCase();
  return AI_MODEL_CDN_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
};

export const isAllowedGeminiApiUrl = (raw: string): boolean => {
  const url = parseHttpUrl(raw);
  if (!url || url.protocol !== 'https:') return false;
  return url.hostname.toLowerCase() === GEMINI_API_HOST;
};

/**
 * Throws when URL is not permitted for the given purpose.
 * `user_sync` and `general_https` accept any HTTPS origin (user-configured sync/IPFS).
 */
export const assertAllowedEndpoint = (raw: string, purpose: NetworkEndpointPurpose): void => {
  const url = parseHttpUrl(raw);
  if (!url) {
    throw new Error(`network-endpoint-invalid:${purpose}`);
  }

  switch (purpose) {
    case 'ollama_loopback':
      if (!isAllowedOllamaBaseUrl(raw)) {
        throw new Error('network-endpoint-ollama-loopback-only');
      }
      return;
    case 'gemini_api':
      if (!isAllowedGeminiApiUrl(raw)) {
        throw new Error('network-endpoint-gemini-host');
      }
      return;
    case 'ai_model_cdn':
      if (!isAllowedAiModelCdnUrl(raw)) {
        throw new Error('network-endpoint-ai-cdn');
      }
      return;
    case 'user_sync':
    case 'general_https':
      if (url.protocol !== 'https:') {
        throw new Error('network-endpoint-https-only');
      }
      return;
    default:
      throw new Error('network-endpoint-unknown-purpose');
  }
};

/** Serialized connect-src host tokens mirrored in csp.ts for drift tests. */
export const CSP_EXPLICIT_CONNECT_HOSTS = [
  `https://${GEMINI_API_HOST}`,
  ...AI_MODEL_CDN_HOSTS.map((host) => `https://${host}`),
] as const;
