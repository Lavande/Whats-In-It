
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Based on schemas/food.py -> UserHealthProfile
interface UserPreferences {
  diet_types: string[];
  allergies: string[];
  health_conditions: string[];
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const defaultPreferences: UserPreferences = {
    diet_types: [],
    allergies: [],
    health_conditions: [],
};

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferencesState] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedPrefs = localStorage.getItem('userPreferences');
      if (storedPrefs) {
        setPreferencesState(JSON.parse(storedPrefs));
      }
    } catch (error) {
      console.error("Failed to parse user preferences from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setPreferences = (newPrefs: UserPreferences) => {
    setPreferencesState(newPrefs);
    try {
      localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
    } catch (error) {
      console.error("Failed to save user preferences to localStorage", error);
    }
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, setPreferences, isLoading }}>
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
