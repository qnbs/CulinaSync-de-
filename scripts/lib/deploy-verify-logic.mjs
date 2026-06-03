/**
 * Reine Hilfslogik für Post-Deploy-Smoke (unit-testbar via node --test).
 */

/** @param {number} status @param {string} targetName */
export const shouldSkipProtectedVercel = (status, targetName) =>
  targetName.includes('Vercel') && (status === 401 || status === 403);

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
