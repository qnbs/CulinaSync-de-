#!/usr/bin/env node
/**
 * Tauri beforeBuildCommand — Monorepo-Root (CI, Windows, macOS, lokal).
 */
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
process.chdir(root);
process.env.CULINASYNC_DESKTOP_BUILD = process.env.CULINASYNC_DESKTOP_BUILD ?? '1';
execSync('pnpm run build', { stdio: 'inherit', env: process.env });
