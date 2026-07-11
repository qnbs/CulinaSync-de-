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

test('design tokens expose the accent + surface custom properties on :root', () => {
  assert.match(tokens, /:root\s*\{/u);
  for (const token of ['--color-accent-500', '--surface-base', '--border-subtle']) {
    assert.ok(tokens.includes(token), `tokens.css should define ${token}`);
  }
});
