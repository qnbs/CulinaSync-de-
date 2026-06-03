import { useState, useEffect, useRef, useCallback, useReducer, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Recipe } from '../types';
import { useWakeLock } from './useWakeLock';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setVoiceAction } from '../store/slices/uiSlice';
import { cookModeReducer, initialCookModeState } from '../components/cook-mode/cookModeReducer';

export const useCookModeController = (recipe: Recipe, onExit: () => void) => {
  const { t } = useTranslation();
  const [cookModeState, dispatchCookMode] = useReducer(cookModeReducer, initialCookModeState);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(true);
  const { currentStep, checkedIngredients, timerSeconds, timerRunning } = cookModeState;

  const inactivityTimerRef = useRef<number | null>(null);

  const dispatch = useAppDispatch();
  const { voiceAction } = useAppSelector((state) => state.ui);

  const [, requestWakeLock, releaseWakeLock] = useWakeLock();
  const { speak, cancel, isSpeaking } = useSpeechSynthesis();

  const ingredientList = useMemo(() => {
    const flattened = recipe.ingredients.flatMap((group) => group.items.map((item) => item.name.trim()));
    return Array.from(new Set(flattened.filter(Boolean)));
  }, [recipe.ingredients]);

  const scheduleInactivityHide = useCallback(() => {
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = window.setTimeout(() => {
      setIsUiVisible(false);
    }, 3500);
  }, []);

  const revealUi = useCallback(() => {
    setIsUiVisible(true);
    scheduleInactivityHide();
  }, [scheduleInactivityHide]);

  useEffect(() => {
    void requestWakeLock();

    const handleActivity = () => revealUi();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    scheduleInactivityHide();

    return () => {
      void releaseWakeLock();
      if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [requestWakeLock, releaseWakeLock, revealUi, scheduleInactivityHide]);

  useEffect(() => {
    if (isSpeechEnabled) {
      speak(recipe.instructions[currentStep]);
    } else {
      cancel();
    }
  }, [cancel, currentStep, isSpeechEnabled, recipe.instructions, speak]);

  useEffect(() => {
    if (!timerRunning) {
      return;
    }
    const id = window.setInterval(() => {
      if (timerSeconds <= 1 && isSpeechEnabled) {
        speak(t('cookMode.timerExpired'));
      }
      dispatchCookMode({ type: 'TICK_TIMER' });
    }, 1000);

    return () => window.clearInterval(id);
  }, [timerRunning, timerSeconds, isSpeechEnabled, speak, t]);

  useEffect(() => {
    if (voiceAction) {
      const { type, payload } = voiceAction;
      scheduleInactivityHide();
      if (type === 'NEXT_STEP' && currentStep < recipe.instructions.length - 1) {
        dispatchCookMode({ type: 'NEXT_STEP', maxSteps: recipe.instructions.length });
      } else if (type === 'PREVIOUS_STEP' && currentStep > 0) {
        dispatchCookMode({ type: 'PREVIOUS_STEP' });
      } else if (type === 'EXIT_COOK_MODE') {
        onExit();
      } else if (type === 'START_COOK_TIMER') {
        const payloadSeconds = Number(String(payload).split('#')[0] || '0');
        dispatchCookMode({ type: 'START_TIMER', seconds: payloadSeconds > 0 ? payloadSeconds : undefined });
      } else if (type === 'PAUSE_COOK_TIMER') {
        dispatchCookMode({ type: 'PAUSE_TIMER' });
      } else if (type === 'CHECK_COOK_INGREDIENT') {
        const raw = String(payload).split('#')[0].trim().toLowerCase();
        const match = ingredientList.find((item) => item.toLowerCase().includes(raw) || raw.includes(item.toLowerCase()));
        if (match) {
          dispatchCookMode({ type: 'CHECK_INGREDIENT', ingredient: match });
        }
      } else if (type === 'UNCHECK_COOK_INGREDIENT') {
        const raw = String(payload).split('#')[0].trim().toLowerCase();
        const match = ingredientList.find((item) => item.toLowerCase().includes(raw) || raw.includes(item.toLowerCase()));
        if (match) {
          dispatchCookMode({ type: 'UNCHECK_INGREDIENT', ingredient: match });
        }
      }
      if (
        ['NEXT_STEP', 'PREVIOUS_STEP', 'EXIT_COOK_MODE', 'START_COOK_TIMER', 'PAUSE_COOK_TIMER', 'CHECK_COOK_INGREDIENT', 'UNCHECK_COOK_INGREDIENT'].includes(
          type,
        )
      ) {
        dispatch(setVoiceAction(null));
      }
    }
  }, [voiceAction, dispatch, onExit, currentStep, recipe.instructions.length, ingredientList, scheduleInactivityHide]);

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  const handleNext = () => {
    if (currentStep < recipe.instructions.length - 1) {
      dispatchCookMode({ type: 'NEXT_STEP', maxSteps: recipe.instructions.length });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      dispatchCookMode({ type: 'PREVIOUS_STEP' });
    }
  };

  const handleRepeat = () => {
    if (isSpeechEnabled) {
      speak(recipe.instructions[currentStep]);
    }
  };

  const progressPercentage = ((currentStep + 1) / recipe.instructions.length) * 100;
  const ingredientProgress = ingredientList.length ? Math.round((checkedIngredients.length / ingredientList.length) * 100) : 0;
  const isInterfaceVisible = isUiVisible || Boolean(voiceAction);

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const rest = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${rest}`;
  };

  const toggleIngredient = (ingredient: string) => {
    dispatchCookMode({ type: 'TOGGLE_INGREDIENT', ingredient });
  };

  const onTimerToggle = () => dispatchCookMode({ type: timerRunning ? 'PAUSE_TIMER' : 'START_TIMER' });
  const onResetTimerShort = () => dispatchCookMode({ type: 'RESET_TIMER', seconds: 180 });
  const onAddThirty = () => dispatchCookMode({ type: 'ADD_TIMER_SECONDS', seconds: 30 });

  return {
    t,
    recipe,
    onExit,
    currentStep,
    checkedIngredients,
    timerSeconds,
    timerRunning,
    isSpeechEnabled,
    setIsSpeechEnabled,
    isUiVisible,
    isSpeaking,
    ingredientList,
    progressPercentage,
    ingredientProgress,
    isInterfaceVisible,
    formatTimer,
    handleNext,
    handlePrev,
    handleRepeat,
    toggleIngredient,
    onTimerToggle,
    onResetTimerShort,
    onAddThirty,
  };
};
