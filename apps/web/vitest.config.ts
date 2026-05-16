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
      // QNBS-v3: M5 — Regressionsschutz (Snapshot 2026-05-04: ~59 % stmts / ~61 % lines / ~46 % branches / ~52 % funcs); ROADMAP-Ziel ≥70 % weiter offen
      thresholds: {
        lines: 60,
        statements: 58,
        functions: 51,
        branches: 45,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
