import React, { createContext, useContext } from 'react';
import { useMealPlannerScreen, type MealPlannerScreenContextValue } from '../hooks/useMealPlannerScreen';

const MealPlannerContext = createContext<MealPlannerScreenContextValue | null>(null);

export const MealPlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMealPlannerScreen();
  return <MealPlannerContext.Provider value={value}>{children}</MealPlannerContext.Provider>;
};

export const useMealPlannerContext = () => {
  const ctx = useContext(MealPlannerContext);
  if (!ctx) {
    throw new Error('useMealPlannerContext must be used within a MealPlannerProvider');
  }
  return ctx;
};
