import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGenerateContent, mockGenerateImages, mockLoadApiKey } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockGenerateImages: vi.fn(),
  mockLoadApiKey: vi.fn(),
}));

vi.mock('../apiKeyService', () => ({
  loadApiKey: mockLoadApiKey,
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(function GoogleGenAI() {
    return {
      models: {
        generateContent: mockGenerateContent,
        generateImages: mockGenerateImages,
      },
    };
  }),
  Type: {
    OBJECT: 'object',
    ARRAY: 'array',
    STRING: 'string',
    NUMBER: 'number',
  },
}));

import {
  generateShoppingList,
  invalidateAIClient,
} from '../geminiService';

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateAIClient();
  });

  it('rejects when API key is missing', async () => {
    mockLoadApiKey.mockResolvedValueOnce(null);

    await expect(
      generateShoppingList('Pasta fuer 2', [], [])
    ).rejects.toThrow(/Kein API-Schlüssel konfiguriert/i);
  });

  it('maps invalid API key errors to user-friendly German message', async () => {
    mockLoadApiKey.mockResolvedValueOnce('AIzaValidLookingKey');
    mockGenerateContent.mockRejectedValueOnce(new Error('API_KEY_INVALID'));

    await expect(
      generateShoppingList('Pasta fuer 2', [], [])
    ).rejects.toThrow(/API-Schlüssel ist ungültig/i);
  });

  it('returns parsed shopping items on valid AI JSON response', async () => {
    mockLoadApiKey.mockResolvedValueOnce('AIzaValidLookingKey');
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        items: [
          { name: 'Tomaten', quantity: 3, unit: 'Stueck', category: 'Obst & Gemuese' },
        ],
      }),
    });

    const result = await generateShoppingList('Pasta fuer 2', [], []);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'Tomaten',
      quantity: 3,
      unit: 'Stueck',
    });
  });
});
