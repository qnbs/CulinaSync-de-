#!/usr/bin/env node
/**
 * Export WEB_CSP from csp.ts and inject into apps/web/vercel.json headers.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const headerFile = join(root, 'apps/web/generated/web-csp-header.txt');
const vercelPath = join(root, 'apps/web/vercel.json');

const exportResult = spawnSync(
  'pnpm',
  [
    '--filter',
    'web',
    'exec',
    'vitest',
    'run',
    'src/config/__tests__/csp.test.ts',
    '-t',
    'exports WEB_CSP for deployment headers',
  ],
  {
    cwd: root,
    env: { ...process.env, EXPORT_VERCEL_CSP: '1' },
    stdio: 'inherit',
  },
);

if (exportResult.status !== 0) {
  process.exit(exportResult.status ?? 1);
}

const csp = readFileSync(headerFile, 'utf8').trim();
const vercel = JSON.parse(readFileSync(vercelPath, 'utf8'));

const globalHeaders = vercel.headers?.find((entry) => entry.source === '/(.*)');
if (!globalHeaders) {
  console.error('vercel.json: missing (.*) headers block');
  process.exit(1);
}

const cspHeader = globalHeaders.headers.find((h) => h.key === 'Content-Security-Policy');
if (cspHeader) {
  cspHeader.value = csp;
} else {
  globalHeaders.headers.push({ key: 'Content-Security-Policy', value: csp });
}

writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);
console.log('Updated apps/web/vercel.json Content-Security-Policy');
