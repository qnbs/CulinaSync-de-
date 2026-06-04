#!/usr/bin/env node
import { execSync } from 'node:child_process';

const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
process.chdir(root);
execSync('pnpm run dev', { stdio: 'inherit', env: process.env });
