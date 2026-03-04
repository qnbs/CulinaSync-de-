import { describe, expect, it } from 'vitest';

// This test proves the MSW layer is ready to mock Gemini HTTP endpoints.
describe('Gemini endpoint mocking with MSW', () => {
  it('mocks Google Generative Language models endpoint', async () => {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=fake-key');
    const data = await response.json() as { models: Array<{ name: string }> };

    expect(response.ok).toBe(true);
    expect(data.models[0].name).toBe('models/gemini-2.5-flash');
  });
});
