
"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAppStore } from '@/store/appStore';
import { UserPreferences } from '@/types';

// Legacy context wrapper for compatibility
interface UserPreferencesContextType {
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const preferences = useAppStore((state) => state.userPreferences);
  const setUserPreferences = useAppStore((state) => state.setUserPreferences);

  const contextValue: UserPreferencesContextType = {
    preferences,
    setPreferences: setUserPreferences,
    isLoading: false, // Zustand persist handles loading automatically
  };

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
