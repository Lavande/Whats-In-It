import { Leaf } from "lucide-react";
import { KeyIngredient } from "@/types";
import Card from "@/components/ui/Card";

interface KeyIngredientsAnalysisProps {
  ingredients: KeyIngredient[];
}

export default function KeyIngredientsAnalysis({ ingredients }: KeyIngredientsAnalysisProps) {
  if (ingredients.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Leaf className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Key Ingredients
        </h3>
        <span className="text-sm text-[var(--text-secondary)]">
          ({ingredients.length} highlighted)
        </span>
      </div>

      <div className="space-y-4">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="border border-[var(--surface-variant)] rounded-lg p-4">
            <h4 className="font-medium text-[var(--text-primary)] mb-2">
              {ingredient.name}
            </h4>
            
            {ingredient.description && (
              <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">
                {ingredient.description}
              </p>
            )}
            
            {ingredient.health_impact && (
              <div className="p-3 bg-[var(--surface)] rounded border-l-4 border-[var(--primary)]">
                <p className="text-sm text-[var(--text-primary)]">
                  <span className="font-medium">Health Impact:</span> {ingredient.health_impact}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}