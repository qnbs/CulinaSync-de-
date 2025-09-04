import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AppSettings } from '@/types';
import { loadSettings as load, saveSettings as save } from '@/services/settingsService';

interface SettingsContextType {
  settings: AppSettings;
  saveSettings: (newSettings: AppSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(load());

  const saveSettings = (newSettings: AppSettings) => {
    save(newSettings);
    setSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};