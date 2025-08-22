"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from "next/head";
import { 
  User, 
  Heart, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  Shield,
  Utensils,
  Leaf,
  Apple,
  ChefHat,
  Fish,
  Monitor,
  Droplets,
  Activity,
  Dumbbell
} from 'lucide-react';
import { useAppStore } from "@/store/appStore";
import { UserPreferences } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SelectableChip from "@/components/onboarding/SelectableChip";

export default function SettingsPage() {
  const router = useRouter();
  const { userPreferences, setUserPreferences, resetOnboarding } = useAppStore();
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(userPreferences);
  const [customAllergy, setCustomAllergy] = useState('');

  const dietOptions = [
    { id: 'standard', title: 'No Preference', icon: <Utensils className="w-4 h-4" /> },
    { id: 'ketogenic', title: 'Keto', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'vegan', title: 'Vegan', icon: <Leaf className="w-4 h-4" /> },
    { id: 'low_carb', title: 'Low-Carb', icon: <Apple className="w-4 h-4" /> },
    { id: 'mediterranean', title: 'Mediterranean', icon: <Fish className="w-4 h-4" /> },
  ];

  const commonAllergies = [
    'Lactose', 'Gluten', 'Nuts', 'Peanuts', 'Eggs', 'Seafood', 
    'Soy', 'Food Coloring', 'Corn', 'Shellfish', 'Wheat', 'MSG'
  ];

  const handleSave = () => {
    setUserPreferences(localPrefs);
    alert('Settings saved successfully!');
  };

  const handleResetToOnboarding = () => {
    if (window.confirm('This will reset all your preferences. Are you sure?')) {
      resetOnboarding();
      setLocalPrefs({
        dietType: ['standard'],
        allergies: [],
        avoidIngredients: [],
        sugarConcern: false,
        saltConcern: false,
        fatConcern: false,
      });
    }
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !localPrefs.allergies.includes(customAllergy.trim())) {
      setLocalPrefs({
        ...localPrefs,
        allergies: [...localPrefs.allergies, customAllergy.trim()]
      });
      setCustomAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setLocalPrefs({
      ...localPrefs,
      allergies: localPrefs.allergies.filter(a => a !== allergy)
    });
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://whats-in-it.org/settings" />
        <title>Settings & Preferences - Customize Your Food Analysis | What's In It?</title>
        <meta name="description" content="Customize your food analysis preferences. Set diet type, allergies, health focus areas, and personalize your nutrition insights." />
      </Head>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <User className="w-8 h-8 text-[var(--primary)]" />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Settings & Preferences
          </h1>
        </div>
        
        <Button variant="outline" onClick={handleResetToOnboarding}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Preferences
        </Button>
      </div>

      <div className="space-y-6">
        {/* Diet Style */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
            <Utensils className="w-5 h-5 mr-2" />
            Diet Style
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dietOptions.map((diet) => (
              <button
                key={diet.id}
                onClick={() => setLocalPrefs({ ...localPrefs, dietType: [diet.id] })}
                className={`p-3 rounded-lg border-2 transition-all flex items-center space-x-2 ${
                  localPrefs.dietType.includes(diet.id)
                    ? 'border-[var(--primary)] bg-[var(--primary-light)]/10 text-[var(--primary-dark)]'
                    : 'border-[var(--surface-variant)] hover:border-[var(--primary-light)] text-[var(--text-primary)]'
                }`}
              >
                {diet.icon}
                <span className="text-sm font-medium">{diet.title}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Allergies & Ingredients to Avoid */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Allergies & Ingredients to Avoid
          </h2>
          
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                placeholder="Type a specific allergy or ingredient to avoid..."
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
                  isSelected={localPrefs.allergies.includes(allergy)}
                  onSelected={(selected) => {
                    if (selected) {
                      setLocalPrefs({
                        ...localPrefs,
                        allergies: [...localPrefs.allergies, allergy]
                      });
                    } else {
                      removeAllergy(allergy);
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {localPrefs.allergies.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                Your Selected Items
              </h3>
              <div className="flex flex-wrap gap-2">
                {localPrefs.allergies.map((allergy) => (
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
        </Card>

        {/* Health Focus Areas */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Health Focus Areas
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Select all that apply to you.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                localPrefs.sugarConcern
                  ? 'border-[var(--primary)] bg-[var(--primary-light)]/10'
                  : 'border-[var(--surface-variant)] hover:border-[var(--primary-light)]'
              }`}
              onClick={() => setLocalPrefs({ ...localPrefs, sugarConcern: !localPrefs.sugarConcern })}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  localPrefs.sugarConcern 
                    ? 'bg-[var(--primary)] text-white' 
                    : 'bg-[var(--surface-variant)] text-[var(--text-secondary)]'
                }`}>
                  <Monitor className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--text-primary)]">Sugar Concern</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Managing blood sugar or reducing sugar intake</p>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.sugarConcern}
                  onChange={(e) => e.stopPropagation()}
                  className="w-5 h-5 text-[var(--primary)] border-[var(--surface-variant)] rounded focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                localPrefs.saltConcern
                  ? 'border-[var(--primary)] bg-[var(--primary-light)]/10'
                  : 'border-[var(--surface-variant)] hover:border-[var(--primary-light)]'
              }`}
              onClick={() => setLocalPrefs({ ...localPrefs, saltConcern: !localPrefs.saltConcern })}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  localPrefs.saltConcern 
                    ? 'bg-[var(--primary)] text-white' 
                    : 'bg-[var(--surface-variant)] text-[var(--text-secondary)]'
                }`}>
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--text-primary)]">Salt Concern</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Managing blood pressure or reducing sodium intake</p>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.saltConcern}
                  onChange={(e) => e.stopPropagation()}
                  className="w-5 h-5 text-[var(--primary)] border-[var(--surface-variant)] rounded focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                localPrefs.fatConcern
                  ? 'border-[var(--primary)] bg-[var(--primary-light)]/10'
                  : 'border-[var(--surface-variant)] hover:border-[var(--primary-light)]'
              }`}
              onClick={() => setLocalPrefs({ ...localPrefs, fatConcern: !localPrefs.fatConcern })}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  localPrefs.fatConcern 
                    ? 'bg-[var(--primary)] text-white' 
                    : 'bg-[var(--surface-variant)] text-[var(--text-secondary)]'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--text-primary)]">High Cholesterol</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Managing or reducing cholesterol levels</p>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.fatConcern}
                  onChange={(e) => e.stopPropagation()}
                  className="w-5 h-5 text-[var(--primary)] border-[var(--surface-variant)] rounded focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                localPrefs.weightLoss
                  ? 'border-[var(--primary)] bg-[var(--primary-light)]/10'
                  : 'border-[var(--surface-variant)] hover:border-[var(--primary-light)]'
              }`}
              onClick={() => setLocalPrefs({ ...localPrefs, weightLoss: !localPrefs.weightLoss })}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  localPrefs.weightLoss 
                    ? 'bg-[var(--primary)] text-white' 
                    : 'bg-[var(--surface-variant)] text-[var(--text-secondary)]'
                }`}>
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--text-primary)]">Weight Loss</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Focus on calories and portion control</p>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.weightLoss || false}
                  onChange={(e) => e.stopPropagation()}
                  className="w-5 h-5 text-[var(--primary)] border-[var(--surface-variant)] rounded focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                localPrefs.muscleGain
                  ? 'border-[var(--primary)] bg-[var(--primary-light)]/10'
                  : 'border-[var(--surface-variant)] hover:border-[var(--primary-light)]'
              }`}
              onClick={() => setLocalPrefs({ ...localPrefs, muscleGain: !localPrefs.muscleGain })}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  localPrefs.muscleGain 
                    ? 'bg-[var(--primary)] text-white' 
                    : 'bg-[var(--surface-variant)] text-[var(--text-secondary)]'
                }`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--text-primary)]">Muscle Gain</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Focus on protein and nutrition for muscle building</p>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.muscleGain || false}
                  onChange={(e) => e.stopPropagation()}
                  className="w-5 h-5 text-[var(--primary)] border-[var(--surface-variant)] rounded focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                localPrefs.digestiveSensitivity
                  ? 'border-[var(--primary)] bg-[var(--primary-light)]/10'
                  : 'border-[var(--surface-variant)] hover:border-[var(--primary-light)]'
              }`}
              onClick={() => setLocalPrefs({ ...localPrefs, digestiveSensitivity: !localPrefs.digestiveSensitivity })}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  localPrefs.digestiveSensitivity 
                    ? 'bg-[var(--primary)] text-white' 
                    : 'bg-[var(--surface-variant)] text-[var(--text-secondary)]'
                }`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--text-primary)]">Digestive Sensitivity</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Gentle on the digestive system</p>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.digestiveSensitivity || false}
                  onChange={(e) => e.stopPropagation()}
                  className="w-5 h-5 text-[var(--primary)] border-[var(--surface-variant)] rounded focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <Button onClick={handleSave} size="lg">
            <Save className="w-5 h-5 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </>
  );
}