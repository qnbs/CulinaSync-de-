import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'url';

const isCi = Boolean(process.env.CI);

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('0.0.0-test'),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // QNBS-v3: Dexie/RTL + MSW — unter Windows stabil: forks statt threads; maxWorkers 1; längere Hooks/Teardown vermeidet vitest-pool-runner Timeouts (Coverage-Endphase)
    testTimeout: 30_000,
    hookTimeout: 60_000,
    teardownTimeout: 60_000,
    pool: 'forks',
    forks: { singleFork: true },
    maxWorkers: 1,
    fileParallelism: false,
    reporters: isCi ? (['default', 'github-actions'] as const) : (['default'] as const),
    slowTestThreshold: 5_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // QNBS-v3: M5 — PRD-Ziel ≥70 % Statements/Lines (Snapshot 2026-06-02 Sprint: ~70,5 % / ~71,8 %); Functions/Branches Follow-up
      thresholds: {
        lines: 70,
        statements: 70,
        functions: 63,
        branches: 55,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
