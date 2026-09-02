import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function goToSettings(page: Page): Promise<void> {
  const btn = page.getByRole('button', { name: /einstellungen/i }).first();
  await expect(btn).toBeVisible({ timeout: 15_000 });
  await btn.click();
  await expect(page.locator('#main-content')).toBeVisible();
}

export async function openSettingsSection(page: Page, sectionName: string | RegExp): Promise<void> {
  await goToSettings(page);
  const locator =
    typeof sectionName === 'string'
      ? page.getByRole('button', { name: sectionName, exact: true })
      : page.getByRole('button', { name: sectionName }).first();
  await locator.click();
}

export async function goToSettingsData(page: Page): Promise<void> {
  await openSettingsSection(page, /^Daten Backup/i);
  await expect(page.getByRole('heading', { name: /daten.*speicher/i })).toBeVisible();
}

export async function goToPantry(page: Page): Promise<void> {
  const btn = page.getByRole('button', { name: /vorrat/i }).first();
  await expect(btn).toBeVisible({ timeout: 15_000 });
  await btn.click();
  await expect(page.locator('#main-content')).toBeVisible();
}

export async function goToRecipes(page: Page): Promise<void> {
  const bottomNav = page.getByRole('navigation', { name: /hauptnavigation/i });
  if (await bottomNav.isVisible().catch(() => false)) {
    const mobileBtn = bottomNav.getByRole('button', { name: /^rezepte$/i });
    await expect(mobileBtn).toBeVisible({ timeout: 15_000 });
    await mobileBtn.click();
  } else {
    const btn = page.getByRole('button', { name: /rezept/i }).first();
    await expect(btn).toBeVisible({ timeout: 15_000 });
    await btn.click();
  }
  await expect(page.locator('#main-content')).toBeVisible();
}

export async function goToAiChef(page: Page): Promise<void> {
  const btn = page.getByRole('button', { name: /ki-chef|ki koch/i }).first();
  await expect(btn).toBeVisible({ timeout: 15_000 });
  await btn.click();
  await expect(page.locator('#main-content')).toBeVisible();
}
