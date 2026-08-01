#!/usr/bin/env node
/**
 * Fail if README version badge does not match root package.json.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const readmePath = process.env.README_VERSION_CHECK_PATH || join(root, 'README.md');
const readme = readFileSync(readmePath, 'utf8');

const versionLine = readme.match(/\*\*Version\*\*\s*\|\s*`([^`]+)`/);
if (!versionLine) {
  console.error('README.md: could not find Version table cell');
  process.exit(1);
}

if (versionLine[1] !== version) {
  console.error(`README version mismatch: README has ${versionLine[1]}, package.json has ${version}`);
  process.exit(1);
}

console.log(`README version matches package.json (${version})`);
