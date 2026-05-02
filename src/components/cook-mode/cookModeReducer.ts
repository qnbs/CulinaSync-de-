export type CookModeState = {
  currentStep: number;
  checkedIngredients: string[];
  timerSeconds: number;
  timerRunning: boolean;
};

export type CookModeAction =
  | { type: 'NEXT_STEP'; maxSteps: number }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'START_TIMER'; seconds?: number }
  | { type: 'ADD_TIMER_SECONDS'; seconds: number }
  | { type: 'PAUSE_TIMER' }
  | { type: 'TICK_TIMER' }
  | { type: 'TOGGLE_INGREDIENT'; ingredient: string }
  | { type: 'CHECK_INGREDIENT'; ingredient: string }
  | { type: 'UNCHECK_INGREDIENT'; ingredient: string }
  | { type: 'RESET_TIMER'; seconds: number };

export const initialCookModeState: CookModeState = {
  currentStep: 0,
  checkedIngredients: [],
  timerSeconds: 180,
  timerRunning: false,
};

export const cookModeReducer = (state: CookModeState, action: CookModeAction): CookModeState => {
  switch (action.type) {
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, action.maxSteps - 1),
      };
    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };
    case 'START_TIMER':
      return {
        ...state,
        timerSeconds: action.seconds && action.seconds > 0 ? action.seconds : state.timerSeconds,
        timerRunning: true,
      };
    case 'PAUSE_TIMER':
      return {
        ...state,
        timerRunning: false,
      };
    case 'ADD_TIMER_SECONDS':
      return {
        ...state,
        timerSeconds: state.timerSeconds + action.seconds,
      };
    case 'TICK_TIMER':
      if (state.timerSeconds <= 1) {
        return {
          ...state,
          timerSeconds: 0,
          timerRunning: false,
        };
      }
      return {
        ...state,
        timerSeconds: state.timerSeconds - 1,
      };
    case 'TOGGLE_INGREDIENT':
      return {
        ...state,
        checkedIngredients: state.checkedIngredients.includes(action.ingredient)
          ? state.checkedIngredients.filter((item) => item !== action.ingredient)
          : [...state.checkedIngredients, action.ingredient],
      };
    case 'CHECK_INGREDIENT':
      return state.checkedIngredients.includes(action.ingredient)
        ? state
        : { ...state, checkedIngredients: [...state.checkedIngredients, action.ingredient] };
    case 'UNCHECK_INGREDIENT':
      return {
        ...state,
        checkedIngredients: state.checkedIngredients.filter((item) => item !== action.ingredient),
      };
    case 'RESET_TIMER':
      return {
        ...state,
        timerSeconds: action.seconds,
        timerRunning: false,
      };
    default:
      return state;
  }
};
