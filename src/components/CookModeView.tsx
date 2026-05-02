import React from 'react';
import type { Recipe } from '../types';
import { useCookModeController } from '../hooks/useCookModeController';
import { CookModeHeader } from './cook-mode/CookModeHeader';
import { CookModeIngredientTimerGrid } from './cook-mode/CookModeIngredientTimerGrid';
import { CookModeFooter } from './cook-mode/CookModeFooter';

interface CookModeViewProps {
  recipe: Recipe;
  onExit: () => void;
}

const CookModeView: React.FC<CookModeViewProps> = ({ recipe, onExit }) => {
  const {
    t,
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
  } = useCookModeController(recipe, onExit);

  return (
    <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col text-zinc-100 font-sans overflow-hidden cursor-default selection:bg-[var(--color-accent-500)] selection:text-black">
      <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000">
        {recipe.imageUrl ? (
          <>
            <img src={recipe.imageUrl} alt="" className="w-full h-full object-cover blur-3xl scale-110 opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/60 to-zinc-950/90" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
        )}
      </div>

      <div className={`relative z-20 h-1.5 bg-white/5 w-full transition-opacity duration-700 mt-safe top-0 ${isUiVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div
          className="h-full bg-[var(--color-accent-500)] transition-all duration-500 ease-out shadow-[0_0_20px_rgba(var(--color-accent-glow),0.6)]"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <CookModeHeader
        recipeTitle={recipe.recipeTitle}
        label={t('cookMode.label')}
        timerRunning={timerRunning}
        timerSeconds={timerSeconds}
        isSpeechEnabled={isSpeechEnabled}
        isSpeaking={isSpeaking}
        isUiVisible={isUiVisible}
        onTimerToggle={onTimerToggle}
        onResetTimer={onResetTimerShort}
        onRepeatStep={handleRepeat}
        onToggleSpeech={() => setIsSpeechEnabled((p) => !p)}
        onExit={onExit}
        formatTimer={formatTimer}
        t={t}
      />

      <CookModeIngredientTimerGrid
        ingredientList={ingredientList}
        checkedIngredients={checkedIngredients}
        ingredientProgress={ingredientProgress}
        timerSeconds={timerSeconds}
        timerRunning={timerRunning}
        onToggleIngredient={toggleIngredient}
        onTimerToggle={onTimerToggle}
        onAddThirty={onAddThirty}
        onResetTimer={onResetTimerShort}
        formatTimer={formatTimer}
        isUiVisible={isUiVisible}
        currentStep={currentStep}
        instructionText={recipe.instructions[currentStep]}
        stepProgressLabel={t('cookMode.stepProgress', { current: currentStep + 1, total: recipe.instructions.length })}
        t={t}
      />

      <CookModeFooter
        currentStep={currentStep}
        totalSteps={recipe.instructions.length}
        isInterfaceVisible={isInterfaceVisible}
        onPrev={handlePrev}
        onNext={handleNext}
        onFinish={onExit}
        t={t}
      />
    </div>
  );
};

export default CookModeView;
