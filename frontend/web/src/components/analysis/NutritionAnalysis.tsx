import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { NutritionComponent } from "@/types";
import Card from "@/components/ui/Card";

interface NutritionAnalysisProps {
  components: NutritionComponent[];
}

export default function NutritionAnalysis({ components }: NutritionAnalysisProps) {
  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'healthy':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'moderate':
        return <Minus className="w-4 h-4 text-yellow-600" />;
      case 'unhealthy':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'healthy':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'unhealthy':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (components.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Nutrition Analysis
        </h3>
      </div>

      <div className="space-y-4">
        {components.map((component, index) => (
          <div key={index} className="border border-[var(--surface-variant)] rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-[var(--text-primary)]">
                  {component.name}
                </h4>
                {getRatingIcon(component.health_rating)}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {component.value}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRatingColor(component.health_rating)}`}>
                {component.health_rating.charAt(0).toUpperCase() + component.health_rating.slice(1)}
              </span>
            </div>
            
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {component.reason}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}