import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAppServices, resetAppServices, setAppServices } from '../serviceRegistry';

describe('serviceRegistry', () => {
  beforeEach(() => {
    resetAppServices();
  });

  it('getAppServices liefert Standard-Gateways', () => {
    const s = getAppServices();
    expect(s.ai.generateRecipeIdeas).toBeDefined();
    expect(s.scanner.scanBarcodeFromImage).toBeDefined();
    expect(s.whisper.transcribeWithWhisper).toBeDefined();
  });

  it('setAppServices merged ai-Overrides ohne andere ai-Methoden zu verlieren', async () => {
    const mockIdeas = vi.fn(async () => []);
    setAppServices({
      ai: { generateRecipeIdeas: mockIdeas },
    });
    const s = getAppServices();
    await s.ai.generateRecipeIdeas({} as never, [], {} as never);
    expect(mockIdeas).toHaveBeenCalledTimes(1);
    expect(typeof s.ai.generateRecipe).toBe('function');
  });

  it('resetAppServices stellt Defaults wieder her', async () => {
    setAppServices({
      ai: { generateRecipeIdeas: vi.fn(async () => []) },
    });
    resetAppServices();
    const s = getAppServices();
    expect(s.ai.generateRecipeIdeas).not.toBeNull();
  });
});
