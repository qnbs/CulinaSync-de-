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
    expect(processCommand('zutat tomaten zurücksetzen', 'recipes').type).toBe('UNCHECK_COOK_INGREDIENT');
    expect(processCommand('timer pause', 'recipes').type).toBe('PAUSE_COOK_TIMER');
    expect(processCommand('start cook mode', 'recipes').type).toBe('START_COOK_MODE');
    expect(processCommand('suche nach milch', 'pantry').type).toBe('SEARCH');
    expect(processCommand('hake milch ab', 'shopping-list').type).toBe('CHECK_SHOPPING_ITEM');
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

  it('ADD_PANTRY_ITEM updated zeigt Update-Toast und navigiert von anderer Seite', async () => {
    const services: VoiceCommandServices = {
      navigate: vi.fn(),
      addToast: vi.fn(),
      addShoppingListItem: vi.fn(),
      addOrUpdatePantryItem: vi.fn().mockResolvedValue({
        status: 'updated',
        item: { id: 1, name: 'Reis', quantity: 3, unit: 'kg', createdAt: 1, updatedAt: 2 },
      }),
      removeItemFromPantry: vi.fn(),
      dispatch: vi.fn(),
    };
    executeVoiceAction(
      { type: 'ADD_PANTRY_ITEM', payload: { name: 'Reis', quantity: 3, unit: 'kg' } },
      services,
      'chef',
    );
    await waitFor(() => expect(services.navigate).toHaveBeenCalledWith('pantry'));
  });

  it('REMOVE_PANTRY_ITEM Fehler zeigt error-Toast', async () => {
    const services: VoiceCommandServices = {
      navigate: vi.fn(),
      addToast: vi.fn(),
      addShoppingListItem: vi.fn(),
      addOrUpdatePantryItem: vi.fn(),
      removeItemFromPantry: vi.fn().mockResolvedValue(false),
      dispatch: vi.fn(),
    };
    executeVoiceAction({ type: 'REMOVE_PANTRY_ITEM', payload: 'Milch' }, services, 'chef');
    await waitFor(() =>
      expect(services.addToast).toHaveBeenCalledWith(expect.any(String), 'error'),
    );
    expect(services.navigate).toHaveBeenCalledWith('pantry');
  });

  it('ADD_SHOPPING_ITEM auf shopping-list navigiert nicht erneut', async () => {
    const services: VoiceCommandServices = {
      navigate: vi.fn(),
      addToast: vi.fn(),
      addShoppingListItem: vi.fn().mockResolvedValue({
        status: 'added',
        item: { id: 1, name: 'Zucker', quantity: 1, unit: 'kg', category: 'x', sortOrder: 0, isChecked: false },
      }),
      addOrUpdatePantryItem: vi.fn(),
      removeItemFromPantry: vi.fn(),
      dispatch: vi.fn(),
    };
    executeVoiceAction(
      { type: 'ADD_SHOPPING_ITEM', payload: { name: 'Zucker', quantity: 1, unit: 'kg', isChecked: false } },
      services,
      'shopping-list',
    );
    await waitFor(() => expect(services.addShoppingListItem).toHaveBeenCalled());
    expect(services.navigate).not.toHaveBeenCalled();
  });
});

describe('processCommand extended', () => {
  it('parses navigation targets and read list', () => {
    expect(processCommand('gehe zu planer', 'chef').payload).toBe('meal-planner');
    expect(processCommand('open settings', 'chef').payload).toBe('settings');
    expect(processCommand('lies einkaufsliste', 'shopping-list').type).toBe('READ_LIST');
    expect(processCommand('was habe ich im vorrat', 'pantry').type).toBe('READ_LIST');
  });

  it('parses adjust pantry quantity and generate recipe', () => {
    expect(processCommand('erhöhe milch um 2', 'pantry').type).toBe('ADJUST_PANTRY_QUANTITY');
    expect(processCommand('koche pasta carbonara', 'chef').type).toBe('GENERATE_RECIPE');
    expect(processCommand('timer starte für 2 minuten', 'recipes').payload).toBe('120');
  });

  it('parseItemString fallback ohne Menge', () => {
    const r = processCommand('füge butter auf die liste', 'shopping-list');
    expect(r.type).toBe('ADD_SHOPPING_ITEM');
    expect(r.payload).toMatchObject({ name: 'butter', quantity: 1, unit: 'Stk' });
  });

  it('parses weitere Navigation und Timer-Sekunden', () => {
    expect(processCommand('go to help', 'chef').payload).toBe('help');
    expect(processCommand('öffne rezepte', 'chef').payload).toBe('recipes');
    expect(processCommand('open shopping list', 'chef').payload).toBe('shopping-list');
    expect(processCommand('timer starte für 30 sekunden', 'recipes').payload).toBe('30');
    expect(processCommand('previous step', 'recipes').type).toBe('PREVIOUS_STEP');
    expect(processCommand('suche nach pasta', 'recipes').type).toBe('SEARCH');
  });

  it('parses reduziere pantry und englische pantry/remove', () => {
    const dec = processCommand('reduziere zucker um 1', 'pantry');
    expect(dec.type).toBe('ADJUST_PANTRY_QUANTITY');
    expect(dec.payload).toMatchObject({ amount: -1 });
    expect(processCommand('remove milk from pantry', 'pantry').type).toBe('REMOVE_PANTRY_ITEM');
    expect(processCommand('add 500g flour to the shopping list', 'shopping-list').type).toBe('ADD_SHOPPING_ITEM');
    expect(processCommand('start cook mode', 'chef').type).toBe('UNKNOWN');
  });
});
