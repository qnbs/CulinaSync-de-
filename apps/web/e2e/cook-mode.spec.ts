import { test, expect } from '@playwright/test';
import { seedDismissedAppModals } from './helpers/appStorage';
import { goToRecipes } from './helpers/navigation';

/** Bekanntes Seed-Rezept (german-austrian.ts de-01) — stabil nach DB-Populate. */
const SEED_RECIPE_TITLE = /bayerischer schweinebraten/i;

test.describe('Kochmodus — Kernflow', () => {
  test.beforeEach(async ({ page }) => {
    await seedDismissedAppModals(page);
  });

  test('Rezeptbuch → Kochmodus → Schritt weiter → Beenden', async ({ page, baseURL }) => {
    await page.goto(baseURL ?? '/');
    await goToRecipes(page);

    // QNBS-v3: seed recipes populate async on first load; on a cold/loaded CI
    // container that can exceed 20s, causing a flaky miss. Wait for the list to
    // render at least one recipe card, then the seed card, with generous timeouts.
    await expect(page.getByRole('button').filter({ hasText: SEED_RECIPE_TITLE }).first())
      .toBeVisible({ timeout: 30_000 });
    const recipeCard = page.getByRole('button').filter({ hasText: SEED_RECIPE_TITLE }).first();
    await recipeCard.click();

    const cookModeStart = page.getByRole('button', { name: /^kochmodus$/i });
    await cookModeStart.scrollIntoViewIfNeeded();
    await expect(cookModeStart).toBeVisible({ timeout: 15_000 });
    await cookModeStart.click();

    await expect(page.getByText(/^kochmodus$/i).first()).toBeVisible();
    const nextStep = page.getByRole('button', { name: /naechster schritt/i });
    await expect(nextStep).toBeVisible();

    await nextStep.click();
    await expect(page.getByRole('button', { name: /vorheriger schritt/i })).toBeEnabled();

    await page.getByRole('button', { name: /beenden/i }).click();
    await expect(page.getByRole('button', { name: /^kochmodus$/i })).toBeVisible({ timeout: 10_000 });
  });
});
