#!/usr/bin/env node
/**
 * M7 gate: exits 0 while latest stable TypeScript is < 7.0.0; exits 1 when GA is available.
 * Usage: node scripts/check-typescript-ga.mjs [--json]
 */
import { execSync } from 'node:child_process';

const json = process.argv.includes('--json');
const latest = execSync('npm view typescript version', { encoding: 'utf8' }).trim();
const major = Number.parseInt(latest.split('.')[0] ?? '0', 10);
const gaReady = major >= 7;

const report = {
  latest,
  gaReady,
  message: gaReady
    ? 'TypeScript 7.0 GA is available — run M7 upgrade checklist in docs/M7-TYPESCRIPT-7-GA-PREP.md'
    : `TypeScript ${latest} stable — stay on tsgo + TS 6 until 7.0 GA`,
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`[ts-ga-check] ${report.message}`);
}

process.exit(gaReady ? 1 : 0);
