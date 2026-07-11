#!/usr/bin/env node
/**
 * Prune old GitHub deployment objects across ALL environments (github-pages,
 * Vercel Preview/Production, …), keeping the newest `keep` per environment.
 *
 * Deleting a deployment OBJECT only removes GitHub's record (declutters the
 * Environments UI). It does not touch the actual Vercel/Pages deployment. The
 * currently-active deployment is the newest, so it is always kept.
 *
 * Env vars:
 *   GITHUB_TOKEN | GH_TOKEN   required, needs `deployments: write`
 *   GITHUB_REPOSITORY         required, "owner/name"
 *   KEEP                      newest to keep per environment (default 3)
 *   ENVIRONMENTS              optional CSV allowlist (blank = all environments)
 *   DRY_RUN=1 | --dry-run     list what would be pruned, change nothing
 */
import { selectDeploymentsToPrune, summarizePrune } from './lib/prune-deployments-logic.mjs';

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const keep = Number.parseInt(process.env.KEEP ?? '3', 10);
const envFilter = (process.env.ENVIRONMENTS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const dryRun = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');

if (!token) {
  console.error('Missing GITHUB_TOKEN / GH_TOKEN.');
  process.exit(1);
}
if (!repo) {
  console.error('Missing GITHUB_REPOSITORY (owner/name).');
  process.exit(1);
}

const API = 'https://api.github.com';
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'culinasync-prune-deployments',
};

const api = (method, path, body) =>
  fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

const listAllDeployments = async () => {
  const all = [];
  for (let page = 1; page <= 100; page += 1) {
    const res = await api('GET', `/repos/${repo}/deployments?per_page=100&page=${page}`);
    if (!res.ok) {
      throw new Error(`List deployments failed: HTTP ${res.status}`);
    }
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
};

const main = async () => {
  const deployments = await listAllDeployments();
  const scoped = envFilter.length
    ? deployments.filter((d) => envFilter.includes(d.environment))
    : deployments;
  const toPrune = selectDeploymentsToPrune(scoped, keep);
  const summary = summarizePrune(scoped, toPrune);

  console.log(
    `Repo ${repo} — keep ${keep} newest per environment` +
      (envFilter.length ? ` (envs: ${envFilter.join(', ')})` : ' (all environments)'),
  );
  for (const [env, { total, prune }] of Object.entries(summary)) {
    console.log(`  ${env}: ${total} total → prune ${prune}, keep ${total - prune}`);
  }
  console.log(`Total to prune: ${toPrune.length}${dryRun ? ' (dry-run — no changes)' : ''}`);

  if (dryRun || toPrune.length === 0) return;

  let deleted = 0;
  let failed = 0;
  for (const d of toPrune) {
    // A deployment must be inactive before it can be deleted.
    const inactive = await api('POST', `/repos/${repo}/deployments/${d.id}/statuses`, {
      state: 'inactive',
    });
    if (!inactive.ok) {
      console.log(`::warning::deployment ${d.id} (${d.environment}) set-inactive HTTP ${inactive.status}`);
    }
    const del = await api('DELETE', `/repos/${repo}/deployments/${d.id}`);
    if (del.ok || del.status === 204) {
      deleted += 1;
    } else {
      failed += 1;
      console.log(`::warning::deployment ${d.id} (${d.environment}) delete HTTP ${del.status}`);
    }
  }
  console.log(`Pruned ${deleted} deployment(s), ${failed} failure(s).`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
