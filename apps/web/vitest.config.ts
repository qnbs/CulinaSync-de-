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
      // QNBS-v3: M5 — Regressionsschutz (Snapshot 2026-06-02: ~65 % stmts / ~66 % lines / ~49 % branches / ~58 % funcs); ROADMAP-Ziel ≥70 % weiter offen
      thresholds: {
        lines: 65,
        statements: 64,
        functions: 58,
        branches: 49,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
