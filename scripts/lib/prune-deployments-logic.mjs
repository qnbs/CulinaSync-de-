/**
 * Pure selection logic for deployment pruning (unit-testable via node --test).
 *
 * Groups deployments by environment and keeps the `keep` newest per environment,
 * returning the rest (to be pruned). `created_at` is ISO-8601 and sorts lexically;
 * ties are broken by numeric id (higher id = newer) so the result is deterministic.
 *
 * @param {Array<{id:number|string, environment:string, created_at:string}>} deployments
 * @param {number} keep
 * @returns {Array<{id:number|string, environment:string, created_at:string}>}
 */
export const selectDeploymentsToPrune = (deployments, keep) => {
  const safeKeep = Math.max(0, Number.isFinite(keep) ? Math.floor(keep) : 0);
  const byEnv = new Map();
  for (const d of deployments) {
    const env = d.environment ?? 'unknown';
    const list = byEnv.get(env) ?? [];
    list.push(d);
    byEnv.set(env, list);
  }

  const prune = [];
  for (const list of byEnv.values()) {
    const sorted = [...list].sort((a, b) => {
      if (a.created_at !== b.created_at) {
        return a.created_at < b.created_at ? 1 : -1; // newest first
      }
      return Number(b.id) - Number(a.id); // tie-break: higher id kept first
    });
    prune.push(...sorted.slice(safeKeep));
  }
  return prune;
};

/** Count total vs prune per environment for a human-readable summary. */
export const summarizePrune = (scoped, toPrune) => {
  const summary = {};
  for (const d of scoped) {
    summary[d.environment] ??= { total: 0, prune: 0 };
    summary[d.environment].total += 1;
  }
  for (const d of toPrune) {
    summary[d.environment] ??= { total: 0, prune: 0 };
    summary[d.environment].prune += 1;
  }
  return summary;
};
