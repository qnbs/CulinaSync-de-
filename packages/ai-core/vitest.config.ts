import { defineConfig } from 'vitest/config';

// ai-core is a pure TS/ESM lib (no DOM) — node environment, source-adjacent tests.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    reporters: process.env.CI ? ['default', 'github-actions'] : ['default'],
  },
});
