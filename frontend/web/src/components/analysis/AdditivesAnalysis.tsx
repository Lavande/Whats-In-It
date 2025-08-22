import { AlertTriangle, Shield, AlertCircle, XCircle } from "lucide-react";
import { Additive } from "@/types";
import Card from "@/components/ui/Card";

interface AdditivesAnalysisProps {
  additives: Additive[];
}

export default function AdditivesAnalysis({ additives }: AdditivesAnalysisProps) {
  const getSafetyIcon = (level: string) => {
    switch (level) {
      case 'Safe':
        return <Shield className="w-4 h-4 text-green-600" />;
      case 'Caution':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'Controversial':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'Avoid':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'Safe':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'Caution':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Controversial':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Avoid':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (additives.length === 0) return null;

  // Sort additives by safety level (worst first for visibility)
  const sortedAdditives = [...additives].sort((a, b) => {
    const order = { 'Avoid': 0, 'Controversial': 1, 'Caution': 2, 'Safe': 3 };
    return (order[a.safety_level as keyof typeof order] || 4) - (order[b.safety_level as keyof typeof order] || 4);
  });

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Food Additives
        </h3>
        <span className="text-sm text-[var(--text-secondary)]">
          ({additives.length} found)
        </span>
      </div>

      <div className="space-y-4">
        {sortedAdditives.map((additive, index) => (
          <div key={index} className="border border-[var(--surface-variant)] rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-[var(--text-primary)]">
                  {additive.name}
                </h4>
                {getSafetyIcon(additive.safety_level)}
              </div>
              {additive.code && (
                <div className="text-sm text-[var(--text-secondary)] font-mono bg-[var(--surface)] px-2 py-1 rounded">
                  {additive.code}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSafetyColor(additive.safety_level)}`}>
                {additive.safety_level}
              </span>
            </div>
            
            {additive.description && (
              <p className="text-sm text-[var(--text-secondary)] mb-2 leading-relaxed">
                {additive.description}
              </p>
            )}
            
            {additive.potential_effects && (
              <div className="mt-2 p-2 bg-[var(--surface)] rounded border-l-4 border-[var(--primary)]">
                <p className="text-sm text-[var(--text-primary)]">
                  <span className="font-medium">Potential Effects:</span> {additive.potential_effects}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {additives.some(a => a.safety_level === 'Avoid' || a.safety_level === 'Controversial') && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2 text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm font-medium">
              This product contains additives that may require caution. Consider your personal health conditions and consult healthcare providers if needed.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}