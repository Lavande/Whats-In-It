"use client";

import { useState } from "react";
import { 
  Brain, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Clock,
  TrendingUp,
  Info
} from "lucide-react";
import { useProduct } from "@/hooks/useProduct";
import { getHealthScoreColor, getHealthScoreBgColor } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ScoreCircle from "./ScoreCircle";
import NutritionAnalysis from "./NutritionAnalysis";
import AdditivesAnalysis from "./AdditivesAnalysis";
import KeyIngredientsAnalysis from "./KeyIngredientsAnalysis";
import SourcesList from "./SourcesList";

export default function AnalysisDisplay() {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  
  const {
    currentProduct,
    currentAnalysis,
    analysisLoadingState,
    errorMessage,
    analyzeProduct,
    canAnalyze,
  } = useProduct();

  if (!currentProduct) {
    return null;
  }

  if (analysisLoadingState === 'loading') {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <LoadingSpinner size="lg" />
            <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[var(--primary)]" />
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              AI Analysis in Progress
            </h3>
            <p className="text-[var(--text-secondary)] mb-4 max-w-md">
              Our AI is analyzing this product's ingredients, nutritional value, and compatibility with your preferences.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-[var(--text-secondary)]">
              <Clock className="w-4 h-4" />
              <span>This may take up to 30 seconds...</span>
            </div>
          </div>

          <div className="w-full max-w-sm bg-[var(--surface-variant)] rounded-full h-2">
            <div className="bg-[var(--primary)] h-2 rounded-full w-1/2 animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  if (analysisLoadingState === 'error') {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-[var(--error-light)] rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[var(--error-dark)]" />
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Analysis Failed
            </h3>
            <p className="text-[var(--text-secondary)] mb-4 max-w-md">
              {errorMessage || "We couldn't analyze this product. Please try again."}
            </p>
          </div>

          <Button onClick={analyzeProduct} className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Try Analysis Again</span>
          </Button>
        </div>
      </Card>
    );
  }

  if (!currentAnalysis) {
    if (canAnalyze) {
      return (
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-[var(--primary-light)] rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-[var(--primary)]" />
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Ready for Analysis
              </h3>
              <p className="text-[var(--text-secondary)] mb-4 max-w-md">
                Get AI-powered insights about this product's health impact, ingredients, and compatibility with your preferences.
              </p>
            </div>

            <Button onClick={analyzeProduct} size="lg" className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Analyze Product</span>
            </Button>
          </div>
        </Card>
      );
    }
    
    return null;
  }

  const isRecommended = currentAnalysis.recommendation === 'recommended';
  
  return (
    <div className="space-y-6">
      {/* Analysis Summary Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              AI Analysis
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
            <TrendingUp className="w-4 h-4" />
            <span>Powered by Perplexity</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Health Score */}
          <div className="flex items-center space-x-4">
            <ScoreCircle score={currentAnalysis.health_score} size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Health Score
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Based on ingredients and nutrition
              </p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isRecommended ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isRecommended ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${
                isRecommended ? 'text-green-700' : 'text-red-700'
              }`}>
                {isRecommended ? 'Recommended' : 'Not Recommended'}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {currentAnalysis.recommendation_reason}
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Detailed Analysis */}
        <div className="mt-6 pt-4 border-t border-[var(--surface-variant)]">
          <Button
            variant="outline"
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            className="flex items-center space-x-2"
          >
            <Info className="w-4 h-4" />
            <span>
              {showDetailedAnalysis ? 'Hide' : 'Show'} Detailed Analysis
            </span>
          </Button>
        </div>
      </Card>

      {/* Detailed Analysis Sections */}
      {showDetailedAnalysis && (
        <div className="space-y-4">
          {/* Nutrition Components Analysis */}
          {currentAnalysis.nutrition_components && currentAnalysis.nutrition_components.length > 0 && (
            <NutritionAnalysis components={currentAnalysis.nutrition_components} />
          )}

          {/* Key Ingredients Analysis */}
          {currentAnalysis.key_ingredients && currentAnalysis.key_ingredients.length > 0 && (
            <KeyIngredientsAnalysis ingredients={currentAnalysis.key_ingredients} />
          )}

          {/* Additives Analysis */}
          {currentAnalysis.additives && currentAnalysis.additives.length > 0 && (
            <AdditivesAnalysis additives={currentAnalysis.additives} />
          )}

          {/* Sources */}
          {currentAnalysis.sources && currentAnalysis.sources.length > 0 && (
            <SourcesList sources={currentAnalysis.sources} />
          )}
        </div>
      )}
    </div>
  );
}