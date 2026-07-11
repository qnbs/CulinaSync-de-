import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const preset = require('../tailwind-preset.cjs');
const tokens = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');

test('tailwind preset exports a config object with a theme', () => {
  assert.equal(typeof preset, 'object');
  assert.ok(preset.theme, 'preset should define a theme');
});

test('design tokens define the accent + surface custom properties inside :root', () => {
  const rootMatch = tokens.match(/:root\s*\{([\s\S]*?)\}/u);
  assert.ok(rootMatch, 'tokens.css should contain a :root block');
  const rootBlock = rootMatch[1];
  for (const token of ['--color-accent-500', '--surface-base', '--border-subtle']) {
    // Assert the actual declaration ("--token:") lives inside :root, not just anywhere/in a comment.
    assert.match(rootBlock, new RegExp(`${token}\\s*:`, 'u'), `:root should define ${token}`);
  }
});
