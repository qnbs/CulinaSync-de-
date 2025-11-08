import React, { createContext, useContext } from 'react';
import { useShoppingList } from '../hooks/useShoppingList';

type ShoppingListContextType = ReturnType<typeof useShoppingList>;

const ShoppingListContext = createContext<ShoppingListContextType | null>(null);

export const ShoppingListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useShoppingList();
  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
};

export const useShoppingListContext = () => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingListContext must be used within a ShoppingListProvider');
  }
  return context;
};