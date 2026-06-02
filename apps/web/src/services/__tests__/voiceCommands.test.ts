import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeVoiceAction, processCommand, type VoiceCommandServices } from '../voiceCommands';
import type { Page } from '@/types';

vi.mock('i18next', () => ({
  default: {
    t: (key: string, vars?: Record<string, string>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    language: 'de',
  },
}));

describe('executeVoiceAction', () => {
  let services: VoiceCommandServices;

  beforeEach(() => {
    services = {
      navigate: vi.fn(),
      addToast: vi.fn(),
      addShoppingListItem: vi.fn().mockResolvedValue({
        status: 'added' as const,
        item: { id: 1, name: 'Mehl', quantity: 1, unit: 'kg', category: 'x', sortOrder: 0, isChecked: false },
      }),
      addOrUpdatePantryItem: vi.fn().mockResolvedValue({
        status: 'added' as const,
        item: {
          id: 1,
          name: 'Reis',
          quantity: 1,
          unit: 'kg',
          createdAt: 1,
          updatedAt: 1,
        },
      }),
      removeItemFromPantry: vi.fn().mockResolvedValue(true),
      dispatch: vi.fn(),
    };
  });

  it('navigiert und zeigt Toast', () => {
    executeVoiceAction({ type: 'NAVIGATE', payload: 'pantry' as Page }, services, 'chef');
    expect(services.navigate).toHaveBeenCalledWith('pantry');
    expect(services.addToast).toHaveBeenCalled();
  });

  it('ADD_SHOPPING_ITEM ruft addShoppingListItem auf', async () => {
    executeVoiceAction(
      {
        type: 'ADD_SHOPPING_ITEM',
        payload: { name: 'Zucker', quantity: 1, unit: 'kg', isChecked: false },
      },
      services,
      'chef',
    );
    await waitFor(() => expect(services.addShoppingListItem).toHaveBeenCalled());
  });

  it('UNKNOWN zeigt Fehler-Toast', () => {
    executeVoiceAction({ type: 'UNKNOWN' }, services, 'recipes');
    expect(services.addToast).toHaveBeenCalled();
  });

  it('NEXT_STEP dispatcht VoiceAction', () => {
    executeVoiceAction({ type: 'NEXT_STEP', payload: '' }, services, 'recipes');
    expect(services.dispatch).toHaveBeenCalled();
  });
});

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

  it('parses pantry add and remove', () => {
    const add = processCommand('füge 2 kg reis zum vorrat hinzu', 'pantry');
    expect(add.type).toBe('ADD_PANTRY_ITEM');
    const remove = processCommand('entferne milch aus dem vorrat', 'pantry');
    expect(remove.type).toBe('REMOVE_PANTRY_ITEM');
  });

  it('parses timer and ingredient check in cook mode', () => {
    expect(processCommand('timer starte 5 minuten', 'recipes').type).toBe('START_COOK_TIMER');
    expect(processCommand('zutat tomaten abhaken', 'recipes').type).toBe('CHECK_COOK_INGREDIENT');
  });
});

describe('executeVoiceAction pantry flows', () => {
  it('ADD_PANTRY_ITEM und REMOVE_PANTRY_ITEM rufen Services auf', async () => {
    const services: VoiceCommandServices = {
      navigate: vi.fn(),
      addToast: vi.fn(),
      addShoppingListItem: vi.fn(),
      addOrUpdatePantryItem: vi.fn().mockResolvedValue({ status: 'added', item: { id: 1 } }),
      removeItemFromPantry: vi.fn().mockResolvedValue(true),
      dispatch: vi.fn(),
    };
    executeVoiceAction(
      { type: 'ADD_PANTRY_ITEM', payload: { name: 'Reis', quantity: 2, unit: 'kg' } },
      services,
      'pantry',
    );
    await waitFor(() => expect(services.addOrUpdatePantryItem).toHaveBeenCalled());
    executeVoiceAction({ type: 'REMOVE_PANTRY_ITEM', payload: 'Milch' }, services, 'pantry');
    await waitFor(() => expect(services.removeItemFromPantry).toHaveBeenCalledWith('Milch'));
  });
});
