import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, UserPreferences, OnboardingState, Product, AnalysisResult, LoadingState, ScanHistoryItem } from '@/types';

const defaultUserPreferences: UserPreferences = {
  dietType: ['standard'],
  allergies: [],
  avoidIngredients: [],
  sugarConcern: false,
  saltConcern: false,
  fatConcern: false,
};

const defaultOnboardingState: OnboardingState = {
  currentStep: 0,
  isCompleted: false,
  welcomeShown: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User Preferences State
      userPreferences: defaultUserPreferences,
      onboardingState: defaultOnboardingState,
      
      setUserPreferences: (preferences: UserPreferences) =>
        set({ userPreferences: preferences }),
        
      setOnboardingCompleted: () =>
        set({
          onboardingState: {
            ...get().onboardingState,
            isCompleted: true,
          },
        }),
        
      resetOnboarding: () =>
        set({
          onboardingState: defaultOnboardingState,
          userPreferences: defaultUserPreferences,
        }),
      
      // Product & Analysis State
      currentProduct: null,
      currentAnalysis: null,
      productLoadingState: 'idle' as LoadingState,
      analysisLoadingState: 'idle' as LoadingState,
      errorMessage: '',
      
      setCurrentProduct: (product: Product | null) =>
        set({ currentProduct: product }),
        
      setCurrentAnalysis: (analysis: AnalysisResult | null) =>
        set({ currentAnalysis: analysis }),
        
      setProductLoadingState: (state: LoadingState) =>
        set({ productLoadingState: state }),
        
      setAnalysisLoadingState: (state: LoadingState) =>
        set({ analysisLoadingState: state }),
        
      setErrorMessage: (message: string) =>
        set({ errorMessage: message }),
        
      clearError: () =>
        set({ errorMessage: '' }),
      
      // Scan History State
      scanHistory: [],
      
      addToScanHistory: (item: Omit<ScanHistoryItem, 'id' | 'scannedAt'>) =>
        set((state) => ({
          scanHistory: [
            {
              ...item,
              id: crypto.randomUUID(),
              scannedAt: new Date(),
            },
            ...state.scanHistory,
          ].slice(0, 50), // Keep only last 50 scans
        })),
        
      clearScanHistory: () =>
        set({ scanHistory: [] }),
    }),
    {
      name: 'whats-in-it-storage',
      partialize: (state) => ({
        // Only persist user preferences, onboarding state, and scan history
        userPreferences: state.userPreferences,
        onboardingState: state.onboardingState,
        scanHistory: state.scanHistory,
      }),
    }
  )
);

// Selectors for easier access to specific parts of the state
export const useUserPreferences = () => useAppStore((state) => state.userPreferences);
export const useOnboardingState = () => useAppStore((state) => state.onboardingState);
export const useCurrentProduct = () => useAppStore((state) => state.currentProduct);
export const useCurrentAnalysis = () => useAppStore((state) => state.currentAnalysis);
export const useProductLoadingState = () => useAppStore((state) => state.productLoadingState);
export const useAnalysisLoadingState = () => useAppStore((state) => state.analysisLoadingState);
export const useScanHistory = () => useAppStore((state) => state.scanHistory);
export const useErrorMessage = () => useAppStore((state) => state.errorMessage);