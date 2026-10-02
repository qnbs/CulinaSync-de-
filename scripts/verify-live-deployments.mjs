#!/usr/bin/env node
/**
 * Smoke-Checks für GitHub Pages (required) und optional Vercel Production.
 * Canonical production: GitHub Pages. Set DEPLOY_VERIFY_REQUIRE_VERCEL=1 to fail on Vercel outage.
 */
import {
  evaluateDeployResponse,
  isVercelProtectionPage,
  shouldSkipOptionalVercelUnavailable,
  shouldSkipProtectedVercel,
} from './lib/deploy-verify-logic.mjs';

/** Set DEPLOY_VERIFY_REQUIRE_VERCEL=1 to fail when Vercel production is down. */
const requireVercel = process.env.DEPLOY_VERIFY_REQUIRE_VERCEL === '1';

const targets = [
  {
    name: 'GitHub Pages',
    url: 'https://qnbs.github.io/CulinaSync-de-/',
    mustInclude: ['CulinaSync', 'id="root"'],
    required: true,
  },
  {
    name: 'Vercel Production',
    url: 'https://culina-sync-de-web.vercel.app/',
    mustInclude: ['CulinaSync', 'id="root"'],
    required: requireVercel,
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
    if (shouldSkipOptionalVercelUnavailable(res.status, target.name, !target.required)) {
      console.warn(
        `[deploy-verify] SKIP (optional): ${target.name} — HTTP ${res.status}; canonical production is GitHub Pages`,
      );
      continue;
    }
    if (!res.ok) {
      console.error(`[deploy-verify] ${target.name}: HTTP ${res.status} — ${target.url}`);
      if (target.required) {
        failed = true;
      }
      continue;
    }
    const verdict = evaluateDeployResponse(res.status, body, target.mustInclude);
    if (!verdict.ok) {
      console.error(`[deploy-verify] ${target.name}: Antwort ungültig (${verdict.reason})`);
      if (target.required) {
        failed = true;
      }
      continue;
    }
    console.log(`[deploy-verify] OK: ${target.name} (${res.status})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!target.required) {
      console.warn(`[deploy-verify] SKIP (optional): ${target.name} — ${message}`);
      continue;
    }
    console.error(`[deploy-verify] ${target.name}: ${message}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
