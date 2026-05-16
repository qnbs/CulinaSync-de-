import { defineConfig, devices } from '@playwright/test';

const isCi = Boolean(process.env.CI);
/** CI: gebautes `dist/` via Preview (schnell, kein HMR). Lokal: Vite-Dev auf 5173. */
const previewPort = 4173;
const devPort = 5173;
const port = isCi ? previewPort : devPort;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCi,
  retries: 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? 'github' : 'list',
  timeout: 30_000,
  use: {
    baseURL,
    trace: isCi ? 'off' : 'on-first-retry',
    video: 'off',
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: isCi
    ? {
        // QNBS-v3: Cloud-CI — kein `vite dev`/Turbo-Server; nur statisches Preview nach `pnpm run build`
        command: `pnpm exec vite preview --host 127.0.0.1 --strictPort --port ${previewPort}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
      }
    : {
        command: 'pnpm dev',
        url: `http://127.0.0.1:${devPort}`,
        reuseExistingServer: !isCi,
        timeout: 120_000,
      },
});
