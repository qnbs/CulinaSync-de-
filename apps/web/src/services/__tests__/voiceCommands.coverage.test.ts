import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { executeVoiceAction, processCommand, type VoiceCommandServices } from '../voiceCommands';

vi.mock('i18next', () => ({
  default: {
    t: (key: string, vars?: Record<string, string>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    language: 'de',
  },
}));

const baseServices = (): VoiceCommandServices => ({
  navigate: vi.fn(),
  addToast: vi.fn(),
  addShoppingListItem: vi.fn().mockResolvedValue({
    status: 'added',
    item: { id: 1, name: 'Mehl', quantity: 1, unit: 'kg', category: 'x', sortOrder: 0, isChecked: false },
  }),
  addOrUpdatePantryItem: vi.fn().mockResolvedValue({
    status: 'updated',
    item: { id: 1, name: 'Reis', quantity: 2, unit: 'kg', createdAt: 1, updatedAt: 1 },
  }),
  removeItemFromPantry: vi.fn().mockResolvedValue(false),
  dispatch: vi.fn(),
});

describe('processCommand coverage matrix', () => {
  it.each([
    ['gehe zu chef', 'chef', 'NAVIGATE', 'chef'],
    ['öffne rezepte', 'pantry', 'NAVIGATE', 'recipes'],
    ['go to meal planner', 'chef', 'NAVIGATE', 'meal-planner'],
    ['open shopping list', 'chef', 'NAVIGATE', 'shopping-list'],
    ['gehe zu einstellungen', 'chef', 'NAVIGATE', 'settings'],
    ['open help', 'chef', 'NAVIGATE', 'help'],
    ['previous step', 'recipes', 'PREVIOUS_STEP', undefined],
    ['timer pause', 'recipes', 'PAUSE_COOK_TIMER', undefined],
    ['timer starte', 'recipes', 'START_COOK_TIMER', '0'],
    ['timer starte für 10 sekunden', 'recipes', 'START_COOK_TIMER', '10'],
    ['timer starten für 2 minuten', 'recipes', 'START_COOK_TIMER', '120'],
    ['timer start für 5 sekunde', 'recipes', 'START_COOK_TIMER', '5'],
    ['zutat salz zurücksetzen', 'recipes', 'UNCHECK_COOK_INGREDIENT', 'salz'],
    ['starte kochmodus', 'recipes', 'START_COOK_MODE', undefined],
    ['starte kochmodus', 'pantry', 'UNKNOWN', 'starte kochmodus'],
    ['lies einkaufsliste', 'chef', 'READ_LIST', 'shopping-list'],
    ['read pantry', 'chef', 'READ_LIST', 'pantry'],
    ['was habe ich liste', 'shopping-list', 'READ_LIST', 'shopping-list'],
    ['erhöhe milch um 2', 'pantry', 'ADJUST_PANTRY_QUANTITY', undefined],
    ['verringere milch um 1', 'pantry', 'ADJUST_PANTRY_QUANTITY', undefined],
    ['suche nach pasta', 'recipes', 'SEARCH', 'pasta'],
    ['hake milch von der liste ab', 'shopping-list', 'CHECK_SHOPPING_ITEM', 'milch'],
    ['koche pasta', 'chef', 'GENERATE_RECIPE', 'koche pasta'],
    ['cook pasta', 'pantry', 'UNKNOWN', 'cook pasta'],
  ] as const)('%s on %s → %s', (cmd, page, type, payload) => {
    const result = processCommand(cmd, page);
    expect(result.type).toBe(type);
    if (type === 'ADJUST_PANTRY_QUANTITY') {
      expect(result.payload).toMatchObject({ name: expect.any(String), amount: expect.any(Number) });
    } else if (payload !== undefined) {
      expect(result.payload).toBe(payload);
    }
  });

  it('parst Item-Strings mit und ohne Menge', () => {
    const withQty = processCommand('füge 1,5 kg mehl auf die liste', 'shopping-list');
    expect(withQty.type).toBe('ADD_SHOPPING_ITEM');
    expect(withQty.payload).toMatchObject({ name: 'mehl', quantity: 1.5, unit: 'kg' });

    const noQty = processCommand('füge basilikum auf die liste', 'shopping-list');
    expect(noQty.type).toBe('ADD_SHOPPING_ITEM');
    expect(noQty.payload).toMatchObject({ name: 'basilikum', quantity: 1, unit: 'Stk' });
  });
});

describe('executeVoiceAction coverage', () => {
  it('navigiert bei Shopping-Add wenn nicht auf Liste', async () => {
    const services = baseServices();
    executeVoiceAction(
      { type: 'ADD_SHOPPING_ITEM', payload: { name: 'Zucker', quantity: 1, unit: 'kg', isChecked: false } },
      services,
      'chef',
    );
    await waitFor(() => expect(services.navigate).toHaveBeenCalledWith('shopping-list'));
  });

  it('updated-Toast und Navigation für Pantry', async () => {
    const services = baseServices();
    executeVoiceAction(
      { type: 'ADD_PANTRY_ITEM', payload: { name: 'Reis', quantity: 1, unit: 'kg' } },
      services,
      'chef',
    );
    await waitFor(() => {
      expect(services.addToast).toHaveBeenCalled();
      expect(services.navigate).toHaveBeenCalledWith('pantry');
    });
  });

  it('Fehler-Toast wenn Remove fehlschlägt', async () => {
    const services = baseServices();
    executeVoiceAction({ type: 'REMOVE_PANTRY_ITEM', payload: 'Milch' }, services, 'chef');
    await waitFor(() => {
      expect(services.addToast).toHaveBeenCalledWith(expect.stringContaining('notFound'), 'error');
      expect(services.navigate).toHaveBeenCalledWith('pantry');
    });
  });

  it('NAVIGATE / SEARCH / READ_LIST / COOK / CHECK / ADJUST / UNKNOWN', async () => {
    const services = baseServices();
    executeVoiceAction({ type: 'NAVIGATE', payload: 'recipes' }, services, 'chef');
    expect(services.navigate).toHaveBeenCalledWith('recipes');

    executeVoiceAction({ type: 'SEARCH', payload: 'pasta' }, services, 'recipes');
    expect(services.dispatch).toHaveBeenCalled();

    executeVoiceAction({ type: 'READ_LIST', payload: 'pantry' }, services, 'chef');
    expect(services.dispatch).toHaveBeenCalled();

    executeVoiceAction({ type: 'START_COOK_MODE' }, services, 'recipes');
    executeVoiceAction({ type: 'NEXT_STEP' }, services, 'recipes');
    executeVoiceAction({ type: 'PREVIOUS_STEP' }, services, 'recipes');
    executeVoiceAction({ type: 'EXIT_COOK_MODE' }, services, 'recipes');
    executeVoiceAction({ type: 'CHECK_COOK_INGREDIENT', payload: 'salz' }, services, 'recipes');
    executeVoiceAction({ type: 'UNCHECK_COOK_INGREDIENT', payload: 'salz' }, services, 'recipes');
    executeVoiceAction({ type: 'START_COOK_TIMER', payload: '30' }, services, 'recipes');
    executeVoiceAction({ type: 'PAUSE_COOK_TIMER' }, services, 'recipes');
    executeVoiceAction({ type: 'CHECK_SHOPPING_ITEM', payload: 'milch' }, services, 'shopping-list');
    executeVoiceAction(
      { type: 'ADJUST_PANTRY_QUANTITY', payload: { name: 'Milch', amount: 1 } },
      services,
      'pantry',
    );
    executeVoiceAction({ type: 'GENERATE_RECIPE', payload: 'koche pasta' }, services, 'chef');
    expect(services.dispatch).toHaveBeenCalled();
    executeVoiceAction({ type: 'UNKNOWN', payload: 'xyz' }, services, 'chef');
    expect(services.addToast).toHaveBeenCalledWith(expect.stringContaining('commandNotRecognized'), 'error');
  });

  it('kein Navigate wenn bereits auf Zielseite; Pantry added-Toast', async () => {
    const services = baseServices();
    services.addOrUpdatePantryItem = vi.fn().mockResolvedValue({
      status: 'added',
      item: { id: 1, name: 'Reis', quantity: 1, unit: 'kg', createdAt: 1, updatedAt: 1 },
    });
    executeVoiceAction(
      { type: 'ADD_SHOPPING_ITEM', payload: { name: 'Zucker', quantity: 1, unit: 'kg', isChecked: false } },
      services,
      'shopping-list',
    );
    await waitFor(() => expect(services.addToast).toHaveBeenCalled());
    expect(services.navigate).not.toHaveBeenCalled();

    executeVoiceAction(
      { type: 'ADD_PANTRY_ITEM', payload: { name: 'Reis', quantity: 1, unit: 'kg' } },
      services,
      'pantry',
    );
    await waitFor(() =>
      expect(services.addToast).toHaveBeenCalledWith(expect.stringContaining('addedToPantry')),
    );
  });

  it('Remove-Erfolg', async () => {
    const services = baseServices();
    services.removeItemFromPantry = vi.fn().mockResolvedValue(true);
    executeVoiceAction({ type: 'REMOVE_PANTRY_ITEM', payload: 'Milch' }, services, 'pantry');
    await waitFor(() => {
      expect(services.addToast).toHaveBeenCalledWith(expect.stringContaining('removedFromPantry'));
    });
  });
});
