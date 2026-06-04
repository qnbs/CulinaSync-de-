/**
 * LHCI puppeteerScript — dismisses onboarding/Whats-New before Lighthouse audits.
 * Mirrors `apps/web/e2e/helpers/appStorage.ts` (no Playwright in this path).
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const appVersion = JSON.parse(
  readFileSync(join(__dirname, '../apps/web/package.json'), 'utf8'),
).version;

/**
 * @param {import('puppeteer').Browser} browser
 * @param {{ url: string }} context
 */
module.exports = async (browser, context) => {
  const page = await browser.newPage();
  await page.goto(context.url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.evaluate((version) => {
    localStorage.setItem('culinaSyncOnboarded', 'true');
    localStorage.setItem('culinasync_version', version);
  }, appVersion);
  await page.close();
};
