"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { UserPreferences } from "@/types";
import Button from "@/components/ui/Button";
import PreferenceCard from "@/components/onboarding/PreferenceCard";
import SelectableChip from "@/components/onboarding/SelectableChip";
import { 
  Heart, 
  Utensils, 
  Leaf, 
  Apple, 
  Fish, 
  ChefHat,
  AlertCircle,
  Monitor,
  Droplets,
  Activity,
  Dumbbell,
  Shield
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { setUserPreferences, setOnboardingCompleted } = useAppStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDietStyle, setSelectedDietStyle] = useState('standard');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedHealthFocus, setSelectedHealthFocus] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');

  const dietStyles = [
    {
      id: 'standard',
      title: 'No Preference',
      description: 'Standard diet with no specific restrictions',
      icon: <Utensils className="w-6 h-6" />,
    },
    {
      id: 'ketogenic',
      title: 'Keto',
      description: 'High-fat, low-carb diet',
      icon: <ChefHat className="w-6 h-6" />,
    },
    {
      id: 'vegan',
      title: 'Vegan',
      description: 'Excludes all animal products',
      icon: <Leaf className="w-6 h-6" />,
    },
    {
      id: 'low_carb',
      title: 'Low-Carb',
      description: 'Reduced carbohydrate intake',
      icon: <Apple className="w-6 h-6" />,
    },
    {
      id: 'mediterranean',
      title: 'Mediterranean',
      description: 'Rich in fruits, vegetables, whole grains, and olive oil',
      icon: <Fish className="w-6 h-6" />,
    },
  ];

  const commonAllergies = [
    'Lactose', 'Gluten', 'Nuts', 'Peanuts', 'Eggs', 'Seafood', 
    'Soy', 'Food Coloring', 'Corn', 'Shellfish', 'Wheat', 'MSG'
  ];

  const healthFocusOptions = [
    {
      id: 'sugar',
      title: 'Sugar Concern',
      description: 'Managing blood sugar or reducing sugar intake',
      icon: <Monitor className="w-6 h-6" />,
    },
    {
      id: 'salt',
      title: 'Salt Concern',
      description: 'Managing blood pressure or reducing sodium intake',
      icon: <Droplets className="w-6 h-6" />,
    },
    {
      id: 'cholesterol',
      title: 'High Cholesterol',
      description: 'Managing or reducing cholesterol levels',
      icon: <Activity className="w-6 h-6" />,
    },
    {
      id: 'weight_loss',
      title: 'Weight Loss',
      description: 'Focus on calories and portion control',
      icon: <Dumbbell className="w-6 h-6" />,
    },
    {
      id: 'muscle_gain',
      title: 'Muscle Gain',
      description: 'Focus on protein and nutrition for muscle building',
      icon: <Shield className="w-6 h-6" />,
    },
    {
      id: 'digestive',
      title: 'Digestive Sensitivity',
      description: 'Gentle on the digestive system',
      icon: <AlertCircle className="w-6 h-6" />,
    },
  ];

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !selectedAllergies.includes(customAllergy.trim())) {
      setSelectedAllergies([...selectedAllergies, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setSelectedAllergies(selectedAllergies.filter(a => a !== allergy));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    const userPrefs: UserPreferences = {
      dietType: [selectedDietStyle],
      allergies: selectedAllergies,
      avoidIngredients: [],
      sugarConcern: selectedHealthFocus.includes('sugar'),
      saltConcern: selectedHealthFocus.includes('salt'),
      fatConcern: selectedHealthFocus.includes('cholesterol'),
    };
    
    setUserPreferences(userPrefs);
    setOnboardingCompleted();
    router.push('/');
  };

  const renderWelcomeStep = () => (
    <div className="text-center py-16">
      <div className="mb-8">
        <Heart className="w-16 h-16 text-[var(--primary)] mx-auto mb-4" />
      </div>
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-6">
        Hi 👋
      </h1>
      <p className="text-xl text-[var(--text-secondary)] mb-12 max-w-md mx-auto">
        Let's tailor your experience to fit your health goals.
      </p>
      <Button size="lg" onClick={handleNext}>
        Get Started
      </Button>
    </div>
  );

  const renderDietStyleStep = () => (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8">
        What's your diet style?
      </h2>
      <div className="space-y-3 mb-8">
        {dietStyles.map((diet) => (
          <PreferenceCard
            key={diet.id}
            title={diet.title}
            description={diet.description}
            icon={diet.icon}
            isSelected={selectedDietStyle === diet.id}
            onTap={() => setSelectedDietStyle(diet.id)}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );

  const renderAllergiesStep = () => (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8">
        Any allergies or intolerances?
      </h2>
      
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            placeholder="Type a specific allergy..."
            className="flex-1 px-4 py-2 border border-[var(--surface-variant)] rounded-lg bg-[var(--surface-container)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            onKeyPress={(e) => e.key === 'Enter' && addCustomAllergy()}
          />
          <Button onClick={addCustomAllergy} disabled={!customAllergy.trim()}>
            Add
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
          Common Allergies & Intolerances
        </h3>
        <div className="flex flex-wrap gap-2">
          {commonAllergies.map((allergy) => (
            <SelectableChip
              key={allergy}
              label={allergy}
              isSelected={selectedAllergies.includes(allergy)}
              onSelected={(selected) => {
                if (selected) {
                  setSelectedAllergies([...selectedAllergies, allergy]);
                } else {
                  removeAllergy(allergy);
                }
              }}
            />
          ))}
        </div>
      </div>

      {selectedAllergies.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            Your Selected Allergies
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedAllergies.map((allergy) => (
              <div
                key={allergy}
                className="inline-flex items-center px-3 py-2 bg-[var(--primary)] text-white rounded-full text-sm"
              >
                {allergy}
                <button
                  onClick={() => removeAllergy(allergy)}
                  className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );

  const renderHealthFocusStep = () => (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
        Any health focus areas?
      </h2>
      <p className="text-[var(--text-secondary)] mb-8">
        Select all that apply to you.
      </p>
      
      <div className="space-y-3 mb-8">
        {healthFocusOptions.map((focus) => (
          <PreferenceCard
            key={focus.id}
            title={focus.title}
            description={focus.description}
            icon={focus.icon}
            isSelected={selectedHealthFocus.includes(focus.id)}
            onTap={() => {
              if (selectedHealthFocus.includes(focus.id)) {
                setSelectedHealthFocus(selectedHealthFocus.filter(f => f !== focus.id));
              } else {
                setSelectedHealthFocus([...selectedHealthFocus, focus.id]);
              }
            }}
          />
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Finish Setup
        </Button>
      </div>
    </div>
  );

  const renderCompletionStep = () => (
    <div className="text-center py-16">
      <div className="mb-8">
        <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-6">
        You're all set 🎉
      </h1>
      <p className="text-xl text-[var(--text-secondary)] mb-12 max-w-md mx-auto">
        From now on, all suggestions will be tailored to your preferences.
      </p>
      <Button size="lg" onClick={completeOnboarding}>
        Start Scanning
      </Button>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderWelcomeStep();
      case 1: return renderDietStyleStep();
      case 2: return renderAllergiesStep();
      case 3: return renderHealthFocusStep();
      case 4: return renderCompletionStep();
      default: return renderWelcomeStep();
    }
  };

  const showProgress = currentStep > 0 && currentStep < 4;

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {showProgress && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
              <span>Step {currentStep} of 3</span>
              <span>{Math.round((currentStep / 3) * 100)}% complete</span>
            </div>
            <div className="w-full bg-[var(--surface-variant)] rounded-full h-2">
              <div 
                className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="bg-[var(--surface-container)] rounded-2xl shadow-lg p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}