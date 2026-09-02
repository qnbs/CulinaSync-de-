import { defineConfig, devices } from '@playwright/test';

const isCi = Boolean(process.env.CI);
/** CI: gebautes `dist/` via Preview (schnell, kein HMR). Lokal: Vite-Dev auf 5173. */
const previewPort = 4173;
const devPort = 5173;
const port = isCi ? previewPort : devPort;
/** Muss zu `vite.config.ts` `base` passen (GitHub Pages: /CulinaSync-de-/). */
const appBasePath = isCi ? '/CulinaSync-de-/' : '/';
const baseURL = `http://127.0.0.1:${port}${appBasePath === '/' ? '' : appBasePath.replace(/\/$/, '')}/`;

// QNBS-v3: Drei Browser-Projekte — CI Smoke nutzt --project=chromium; Matrix ein Job pro Browser
const browserProjects = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'], actionTimeout: 20_000 },
    timeout: 60_000,
  },
];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? 'github' : 'list',
  timeout: 30_000,
  use: {
    baseURL,
    trace: isCi ? 'off' : 'on-first-retry',
    video: 'off',
    screenshot: 'off',
  },
  projects: browserProjects as Array<{
    name: string;
    use: Record<string, unknown>;
  }>,
  webServer: isCi
    ? {
        command: `GITHUB_ACTIONS=true pnpm exec vite preview --host 127.0.0.1 --strictPort --port ${previewPort}`,
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
