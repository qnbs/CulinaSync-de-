#!/usr/bin/env node
/**
 * Smoke-Checks für GitHub Pages und Vercel Production (HTTP 200 + HTML-Snippet).
 * Keine Secrets. Exit 1 bei hartem Fehler.
 */
const targets = [
  {
    name: 'GitHub Pages',
    url: 'https://qnbs.github.io/CulinaSync-de-/',
    mustInclude: ['CulinaSync', 'id="root"'],
  },
  {
    name: 'Vercel Production',
    url: 'https://culina-sync-de-web-qnbs-projects.vercel.app/',
    mustInclude: ['CulinaSync', 'id="root"'],
  },
];

const fetchWithTimeout = async (url, ms = 20_000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'text/html' },
      redirect: 'follow',
    });
  } finally {
    clearTimeout(timer);
  }
};

let failed = false;

for (const target of targets) {
  try {
    const res = await fetchWithTimeout(target.url);
    const body = await res.text();
    // QNBS-v3: Vercel Deployment Protection liefert 401/403 ohne Session — kein harter CI-Fail für Pages-Deploy
    if (!res.ok) {
      if (target.name.includes('Vercel') && (res.status === 401 || res.status === 403)) {
        console.warn(
          `[deploy-verify] SKIP (geschützt): ${target.name} HTTP ${res.status} — ${target.url}`,
        );
        continue;
      }
      console.error(`[deploy-verify] ${target.name}: HTTP ${res.status} — ${target.url}`);
      failed = true;
      continue;
    }
    const missing = target.mustInclude.filter((snippet) => !body.includes(snippet));
    if (missing.length > 0) {
      console.error(`[deploy-verify] ${target.name}: Antwort ohne ${missing.join(', ')}`);
      failed = true;
      continue;
    }
    console.log(`[deploy-verify] OK: ${target.name} (${res.status})`);
  } catch (error) {
    console.error(`[deploy-verify] ${target.name}: ${error instanceof Error ? error.message : error}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
