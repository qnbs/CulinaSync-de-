import { describe, expect, it } from 'vitest';
import { cookModeReducer, initialCookModeState } from '../cookModeReducer';

describe('cookModeReducer', () => {
  it('advances and clamps step with NEXT_STEP', () => {
    let s = initialCookModeState;
    s = cookModeReducer(s, { type: 'NEXT_STEP', maxSteps: 3 });
    expect(s.currentStep).toBe(1);
    s = { ...s, currentStep: 2 };
    s = cookModeReducer(s, { type: 'NEXT_STEP', maxSteps: 3 });
    expect(s.currentStep).toBe(2);
  });

  it('PREVIOUS_STEP does not go below 0', () => {
    const s = cookModeReducer(initialCookModeState, { type: 'PREVIOUS_STEP' });
    expect(s.currentStep).toBe(0);
  });

  it('TICK_TIMER stops at 0 and clears running', () => {
    let s = { ...initialCookModeState, timerSeconds: 1, timerRunning: true };
    s = cookModeReducer(s, { type: 'TICK_TIMER' });
    expect(s.timerSeconds).toBe(0);
    expect(s.timerRunning).toBe(false);
  });

  it('TOGGLE_INGREDIENT toggles membership', () => {
    let s = cookModeReducer(initialCookModeState, { type: 'TOGGLE_INGREDIENT', ingredient: 'Mehl' });
    expect(s.checkedIngredients).toContain('Mehl');
    s = cookModeReducer(s, { type: 'TOGGLE_INGREDIENT', ingredient: 'Mehl' });
    expect(s.checkedIngredients).not.toContain('Mehl');
  });

  it('RESET_TIMER sets seconds and pauses', () => {
    let s = { ...initialCookModeState, timerRunning: true, timerSeconds: 999 };
    s = cookModeReducer(s, { type: 'RESET_TIMER', seconds: 120 });
    expect(s.timerSeconds).toBe(120);
    expect(s.timerRunning).toBe(false);
  });

  it('START_TIMER uses custom seconds when provided', () => {
    const s = cookModeReducer(initialCookModeState, { type: 'START_TIMER', seconds: 90 });
    expect(s.timerSeconds).toBe(90);
    expect(s.timerRunning).toBe(true);
  });

  it('PAUSE_TIMER stops running without changing seconds', () => {
    const s = cookModeReducer(
      { ...initialCookModeState, timerRunning: true, timerSeconds: 42 },
      { type: 'PAUSE_TIMER' },
    );
    expect(s.timerRunning).toBe(false);
    expect(s.timerSeconds).toBe(42);
  });

  it('ADD_TIMER_SECONDS increments timer', () => {
    const s = cookModeReducer(initialCookModeState, { type: 'ADD_TIMER_SECONDS', seconds: 30 });
    expect(s.timerSeconds).toBe(210);
  });

  it('TICK_TIMER decrements above 1', () => {
    const s = cookModeReducer({ ...initialCookModeState, timerSeconds: 5, timerRunning: true }, { type: 'TICK_TIMER' });
    expect(s.timerSeconds).toBe(4);
    expect(s.timerRunning).toBe(true);
  });

  it('CHECK_INGREDIENT and UNCHECK_INGREDIENT are idempotent', () => {
    let s = cookModeReducer(initialCookModeState, { type: 'CHECK_INGREDIENT', ingredient: 'Salz' });
    s = cookModeReducer(s, { type: 'CHECK_INGREDIENT', ingredient: 'Salz' });
    expect(s.checkedIngredients).toEqual(['Salz']);
    s = cookModeReducer(s, { type: 'UNCHECK_INGREDIENT', ingredient: 'Salz' });
    expect(s.checkedIngredients).toEqual([]);
  });
});
