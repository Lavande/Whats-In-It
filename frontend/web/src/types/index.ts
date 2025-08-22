// User Preferences Types (matching Flutter's UserPreferences model)
export interface UserPreferences {
  dietType: string[];
  allergies: string[];
  avoidIngredients: string[];
  sugarConcern: boolean;
  saltConcern: boolean;
  fatConcern: boolean;
  weightLoss?: boolean;
  muscleGain?: boolean;
  digestiveSensitivity?: boolean;
}

// Product Types (matching Flutter's Product model)
export interface Product {
  barcode: string;
  name: string;
  brand: string;
  image_url?: string;
  ingredients_text: string;
  ingredients_list: string[];
  nutrition_facts: NutritionFacts;
}

export interface NutritionFacts {
  per_quantity?: string;
  energy_kj?: number;
  energy_kcal?: number;
  fat?: number;
  saturated_fat?: number;
  carbohydrates?: number;
  sugars?: number;
  fiber?: number;
  proteins?: number;
  salt?: number;
  sodium?: number;
}

// Analysis Result Types (matching Flutter's AnalysisResult model)
export interface AnalysisResult {
  health_score: number;
  recommendation: 'recommended' | 'not recommended';
  recommendation_reason: string;
  nutrition_components: NutritionComponent[];
  key_ingredients: KeyIngredient[];
  additives: Additive[];
  sources?: Citation[];
}

export interface NutritionComponent {
  name: string;
  value: string;
  health_rating: 'healthy' | 'moderate' | 'unhealthy';
  reason: string;
}

export interface KeyIngredient {
  name: string;
  description: string;
  health_impact: string;
}

export interface Additive {
  code: string;
  name: string;
  safety_level: 'Safe' | 'Caution' | 'Controversial' | 'Avoid';
  description: string;
  potential_effects: string;
}

export interface Citation {
  title: string;
  url?: string;
}

// API Request/Response Types
export interface ComprehensiveAnalysisRequest {
  product: Product;
  user_preferences: {
    diet_type: string[];
    allergies: string[];
    avoid_ingredients: string[];
    health_concerns: {
      sugar: boolean;
      salt: boolean;
      fat: boolean;
    };
  };
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Scan History
export interface ScanHistoryItem {
  id: string;
  barcode: string;
  product: Product;
  analysisResult?: AnalysisResult;
  scannedAt: Date;
}

// Onboarding Types
export interface OnboardingState {
  currentStep: number;
  isCompleted: boolean;
  welcomeShown: boolean;
}

export interface DietOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface HealthFocusOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Store Types for Zustand
export interface AppState {
  // User Preferences
  userPreferences: UserPreferences;
  onboardingState: OnboardingState;
  setUserPreferences: (preferences: UserPreferences) => void;
  setOnboardingCompleted: () => void;
  resetOnboarding: () => void;
  
  // Product & Analysis
  currentProduct: Product | null;
  currentAnalysis: AnalysisResult | null;
  productLoadingState: LoadingState;
  analysisLoadingState: LoadingState;
  errorMessage: string;
  
  setCurrentProduct: (product: Product | null) => void;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  setProductLoadingState: (state: LoadingState) => void;
  setAnalysisLoadingState: (state: LoadingState) => void;
  setErrorMessage: (message: string) => void;
  clearError: () => void;
  
  // Scan History
  scanHistory: ScanHistoryItem[];
  addToScanHistory: (item: Omit<ScanHistoryItem, 'id' | 'scannedAt'>) => void;
  clearScanHistory: () => void;
}

// API Error Type
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}