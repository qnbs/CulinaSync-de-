import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAppServices, resetAppServices, setAppServices } from '../serviceRegistry';

const registryMocks = vi.hoisted(() => ({
  generateRecipeIdeas: vi.fn(async () => []),
  generateRecipe: vi.fn(async () => ({ recipeTitle: 'x' })),
  generateShoppingList: vi.fn(async () => []),
  generateRecipeImage: vi.fn(async () => 'data:image/png;base64,x'),
  extractPantryItemsFromImage: vi.fn(async () => 'tomate'),
  scanBarcodeFromImage: vi.fn(async () => '4012345'),
  recognizeTextFromImage: vi.fn(async () => 'ocr-text'),
  transcribeWithWhisper: vi.fn(async () => ({ text: 'hallo', language: 'de' })),
  initWhisper: vi.fn(async () => undefined),
}));

vi.mock('../aiProviderService', () => ({
  generateRecipeIdeas: registryMocks.generateRecipeIdeas,
  generateRecipe: registryMocks.generateRecipe,
  generateShoppingList: registryMocks.generateShoppingList,
}));

vi.mock('../geminiService', () => ({
  generateRecipeImage: registryMocks.generateRecipeImage,
  extractPantryItemsFromImage: registryMocks.extractPantryItemsFromImage,
}));

vi.mock('../scannerService', () => ({
  scanBarcodeFromImage: registryMocks.scanBarcodeFromImage,
  recognizeTextFromImage: registryMocks.recognizeTextFromImage,
}));

vi.mock('../whisperService', () => ({
  transcribeWithWhisper: registryMocks.transcribeWithWhisper,
  initWhisper: registryMocks.initWhisper,
}));

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

  it('setAppServices merged scanner- und whisper-Overrides', async () => {
    const scan = vi.fn(async () => '123');
    const transcribe = vi.fn(async () => ({ text: 'hi' }));
    setAppServices({
      scanner: { scanBarcodeFromImage: scan },
      whisper: { transcribeWithWhisper: transcribe },
    });
    const s = getAppServices();
    await expect(s.scanner.scanBarcodeFromImage(new File([], 'x'))).resolves.toBe('123');
    await expect(s.whisper.transcribeWithWhisper(new Blob())).resolves.toMatchObject({ text: 'hi' });
    expect(typeof s.scanner.recognizeTextFromImage).toBe('function');
  });

  it('Default-Gateways delegieren an aiProviderService, geminiService, scanner und whisper', async () => {
    resetAppServices();
    const s = getAppServices();
    const file = new File([], 'scan.jpg');

    await s.ai.generateRecipeIdeas({} as never, [], {} as never);
    await s.ai.generateRecipe({} as never, [], {} as never, {} as never);
    await s.ai.generateShoppingList('prompt', [], []);
    await s.ai.generateRecipeImage('Titel');
    await s.ai.extractPantryItemsFromImage(file);

    await s.scanner.scanBarcodeFromImage(file);
    await s.scanner.recognizeTextFromImage(file, 'deu');

    await s.whisper.transcribeWithWhisper(new Blob());
    await s.whisper.initWhisper('/models/whisper');

    expect(registryMocks.generateRecipeIdeas).toHaveBeenCalled();
    expect(registryMocks.generateRecipe).toHaveBeenCalled();
    expect(registryMocks.generateShoppingList).toHaveBeenCalled();
    expect(registryMocks.generateRecipeImage).toHaveBeenCalledWith('Titel');
    expect(registryMocks.extractPantryItemsFromImage).toHaveBeenCalledWith(file);
    expect(registryMocks.scanBarcodeFromImage).toHaveBeenCalledWith(file);
    expect(registryMocks.recognizeTextFromImage).toHaveBeenCalledWith(file, 'deu');
    expect(registryMocks.transcribeWithWhisper).toHaveBeenCalled();
    expect(registryMocks.initWhisper).toHaveBeenCalledWith('/models/whisper');
  });
});
