import { test, expect } from '@playwright/test';
import { gotoApp } from './helpers/gotoApp';

test.describe('CulinaSync Smoke', () => {
  test('Startseite lädt', async ({ page, baseURL }) => {
    await gotoApp(page, baseURL);
    await expect(page.getByRole('link', { name: /skip|inhalt/i })).toBeVisible();
  });
});
