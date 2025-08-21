"use client";

import { useState, useEffect } from 'react';
import { useUserPreferences } from '@/context/UserPreferencesContext';

const allDietOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo"];
const allAllergyOptions = ["Peanuts", "Tree Nuts", "Milk", "Eggs", "Soy", "Wheat", "Fish", "Shellfish"];
const allConditionOptions = ["High Blood Pressure", "High Cholesterol", "Diabetes", "Celiac Disease"];

export default function SettingsPage() {
  const { preferences, setPreferences, isLoading } = useUserPreferences();
  const [localPrefs, setLocalPrefs] = useState(preferences);

  useEffect(() => {
    if (!isLoading) {
      setLocalPrefs(preferences);
    }
  }, [preferences, isLoading]);

  const handleMultiSelectChange = (field: keyof typeof localPrefs, value: string) => {
    const currentValues = localPrefs[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    setLocalPrefs({ ...localPrefs, [field]: newValues });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreferences(localPrefs);
    alert('Settings saved!');
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Health Profile & Settings</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        <MultiSelectChipGroup
          label="Dietary Preferences"
          options={allDietOptions}
          selected={localPrefs.diet_types}
          onChange={(value) => handleMultiSelectChange('diet_types', value)}
        />
        <MultiSelectChipGroup
          label="Allergies"
          options={allAllergyOptions}
          selected={localPrefs.allergies}
          onChange={(value) => handleMultiSelectChange('allergies', value)}
        />
        <MultiSelectChipGroup
          label="Health Conditions"
          options={allConditionOptions}
          selected={localPrefs.health_conditions}
          onChange={(value) => handleMultiSelectChange('health_conditions', value)}
        />
        <div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}

interface ChipGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
}

const MultiSelectChipGroup = ({ label, options, selected, onChange }: ChipGroupProps) => (
  <div>
    <h3 className="text-lg font-medium text-gray-300 mb-3">{label}</h3>
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selected.includes(option)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);