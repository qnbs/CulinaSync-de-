import { describe, expect, it } from 'vitest';
import { processCommand } from '../voiceCommands';

describe('processCommand', () => {
  it('parses cook-mode next step (DE + EN)', () => {
    expect(processCommand('bitte nächster schritt', 'recipes').type).toBe('NEXT_STEP');
    expect(processCommand('next step please', 'recipes').type).toBe('NEXT_STEP');
  });

  it('parses cook-mode exit', () => {
    expect(processCommand('exit cook mode', 'recipes').type).toBe('EXIT_COOK_MODE');
    expect(processCommand('beende kochmodus', 'recipes').type).toBe('EXIT_COOK_MODE');
  });

  it('parses navigation to pantry', () => {
    const r = processCommand('gehe zur vorrat', 'chef');
    expect(r.type).toBe('NAVIGATE');
    expect(r.payload).toBe('pantry');
  });

  it('parses add shopping list item', () => {
    const r = processCommand('füge 500g Mehl auf die Einkaufsliste', 'shopping-list');
    expect(r.type).toBe('ADD_SHOPPING_ITEM');
    expect(r.payload && typeof r.payload === 'object' && 'name' in r.payload).toBe(true);
  });

  it('returns UNKNOWN for nonsense', () => {
    expect(processCommand('xyzzy plugh', 'recipes').type).toBe('UNKNOWN');
  });
});
