#!/usr/bin/env node
/**
 * Smoke-Checks für GitHub Pages und Vercel Production (HTTP 200 + HTML-Snippet).
 * Keine Secrets. Exit 1 bei hartem Fehler.
 */
import {
  evaluateDeployResponse,
  isVercelProtectionPage,
  shouldSkipProtectedVercel,
} from './lib/deploy-verify-logic.mjs';

const targets = [
  {
    name: 'GitHub Pages',
    url: 'https://qnbs.github.io/CulinaSync-de-/',
    mustInclude: ['CulinaSync', 'id="root"'],
  },
  {
    name: 'Vercel Production',
    url: 'https://culina-sync-de-web.vercel.app/',
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
    // Vercel Deployment Protection: 401/403, or a followed redirect to an SSO
    // auth page (HTTP 200 with the auth wall instead of the app). Warn, don't fail.
    if (
      shouldSkipProtectedVercel(res.status, target.name) ||
      isVercelProtectionPage({
        targetName: target.name,
        body,
        finalUrl: res.url,
        redirected: res.redirected,
      })
    ) {
      console.warn(
        `[deploy-verify] SKIP (geschützt): ${target.name} — Deployment Protection aktiv (HTTP ${res.status})`,
      );
      continue;
    }
    if (!res.ok) {
      console.error(`[deploy-verify] ${target.name}: HTTP ${res.status} — ${target.url}`);
      failed = true;
      continue;
    }
    const verdict = evaluateDeployResponse(res.status, body, target.mustInclude);
    if (!verdict.ok) {
      console.error(`[deploy-verify] ${target.name}: Antwort ungültig (${verdict.reason})`);
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
