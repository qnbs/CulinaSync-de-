import { isAllowedMlCdnUrl, ML_MODEL_CDN_HOSTS } from './mlCdnHosts.js';

const ML_FETCH_ERROR = 'ml-cdn-fetch-blocked';

const resolveRequestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
};

const isMlCdnCandidate = (raw: string): boolean => {
  try {
    const url = new URL(
      raw,
      typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
    );
    const host = url.hostname.toLowerCase();
    return ML_MODEL_CDN_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
};

export const createGuardedMlFetch = (baseFetch: typeof fetch): typeof fetch => {
  const guardedFetch: typeof fetch = async (input, init) => {
    const requestUrl = resolveRequestUrl(input);
    if (isMlCdnCandidate(requestUrl)) {
      if (!isAllowedMlCdnUrl(requestUrl)) {
        throw new Error(ML_FETCH_ERROR);
      }
      return baseFetch(input, { ...init, redirect: init?.redirect ?? 'error' });
    }
    return baseFetch(input, init);
  };
  return guardedFetch;
};

const GUARD_MARKER = Symbol.for('culinasync.mlCdnFetchGuard');

type MarkedFetch = typeof fetch & { [GUARD_MARKER]?: true };

let installed = false;
let nativeFetch: typeof fetch | undefined;

/** Patches global fetch so WebLLM/MLC and transformers.js downloads hit the CDN allowlist. */
export const installMlCdnFetchGuard = (): void => {
  if (typeof globalThis.fetch !== 'function') {
    return;
  }
  const current = globalThis.fetch as MarkedFetch;
  if (current[GUARD_MARKER]) {
    installed = true;
    return;
  }
  if (installed) {
    return;
  }
  nativeFetch = current.bind(globalThis);
  const guarded = createGuardedMlFetch(nativeFetch) as MarkedFetch;
  guarded[GUARD_MARKER] = true;
  globalThis.fetch = guarded;
  installed = true;
};

export const restoreMlCdnFetchGuardForTests = (): void => {
  if (nativeFetch) {
    globalThis.fetch = nativeFetch;
  }
  nativeFetch = undefined;
  installed = false;
};

export const isMlCdnFetchGuardInstalled = (): boolean => installed;
