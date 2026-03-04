import { http, HttpResponse } from 'msw';

export const handlers = [
  // Gemini endpoint mock for integration-like tests.
  http.get('https://generativelanguage.googleapis.com/v1beta/models', () => {
    return HttpResponse.json({
      models: [{ name: 'models/gemini-2.5-flash' }],
    });
  }),
];
