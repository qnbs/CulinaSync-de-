import { test, expect } from '@playwright/test';
import { gotoApp } from './helpers/gotoApp';
import { openSettingsSection } from './helpers/navigation';

test.describe('Einstellungen — Lokale KI', () => {
  test('Stack sichtbar; Ollama-URL bleibt loopback-only', async ({ page, baseURL }) => {
    await gotoApp(page, baseURL);
    await openSettingsSection(page, /lokale ki/i);

    await expect(page.getByText(/webllm|onnx|transformers|heuristic/i).first()).toBeVisible({
      timeout: 15_000,
    });

    const ollamaToggle = page.getByRole('switch', { name: /ollama-connector/i });
    await ollamaToggle.click();

    const ollamaUrl = page.locator('#ollama-base-url');
    await expect(ollamaUrl).toBeEnabled();
    await expect(ollamaUrl).toHaveValue('http://127.0.0.1:11434');

    await ollamaUrl.fill('http://192.168.1.5:11434');
    await ollamaUrl.blur();
    await expect(ollamaUrl).toHaveValue('http://127.0.0.1:11434');
  });
});
