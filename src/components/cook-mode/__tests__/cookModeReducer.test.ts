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
});
