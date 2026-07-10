/**
 * Reine Hilfslogik für Post-Deploy-Smoke (unit-testbar via node --test).
 */

/** @param {number} status @param {string} targetName */
export const shouldSkipProtectedVercel = (status, targetName) =>
  targetName.includes('Vercel') && (status === 401 || status === 403);

/**
 * Vercel Deployment Protection often answers with a 302 that `fetch` follows to
 * an SSO/auth page returning HTTP 200 — so the status looks OK but the body is
 * the auth wall, not the app. Detect that case so the smoke check can SKIP
 * (warn) instead of hard-failing a protected deployment.
 * @param {{ targetName: string, body?: string, finalUrl?: string, redirected?: boolean }} args
 */
export const isVercelProtectionPage = ({ targetName, body = '', finalUrl = '', redirected = false }) => {
  if (!targetName.includes('Vercel')) return false;
  // The app is served from a *.vercel.app host; a redirect onto vercel.com
  // (login / sso-api) is unambiguously the Deployment-Protection auth wall.
  const redirectedToAuthHost = redirected && /^https?:\/\/vercel\.com\//i.test(finalUrl);
  const urlHasSso = /sso-api|%2fsso-api|\/_vercel\/protection/i.test(finalUrl);
  const bodyHasSso =
    /_vercel_sso_nonce|authentication required|security checkpoint|vercel\.com\/(login|sso)/i.test(body);
  return redirectedToAuthHost || urlHasSso || bodyHasSso;
};

/**
 * @param {number} status
 * @param {string} body
 * @param {string[]} mustInclude
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export const evaluateDeployResponse = (status, body, mustInclude) => {
  if (!status || status < 200 || status >= 300) {
    return { ok: false, reason: `http-${status}` };
  }
  const missing = mustInclude.filter((snippet) => !body.includes(snippet));
  if (missing.length > 0) {
    return { ok: false, reason: `missing-${missing.join(',')}` };
  }
  return { ok: true };
};
