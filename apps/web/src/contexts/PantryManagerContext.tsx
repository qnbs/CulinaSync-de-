import React, { createContext, useContext } from 'react';
import { usePantryManager } from '../hooks/usePantryManager';

type PantryManagerContextType = ReturnType<typeof usePantryManager>;

const PantryManagerContext = createContext<PantryManagerContextType | null>(null);

export const PantryManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = usePantryManager();
  return (
    <PantryManagerContext.Provider value={value}>
      {children}
    </PantryManagerContext.Provider>
  );
};

export const usePantryManagerContext = () => {
  const context = useContext(PantryManagerContext);
  if (!context) {
    throw new Error('usePantryManagerContext must be used within a PantryManagerProvider');
  }
  return context;
};
