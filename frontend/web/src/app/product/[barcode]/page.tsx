"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Head from "next/head";
import { 
  ArrowLeft, 
  Package, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { useProduct } from "@/hooks/useProduct";
import { formatNutritionValue } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AnalysisDisplay from "@/components/analysis/AnalysisDisplay";

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const barcode = params.barcode as string;
  
  const [ingredientsExpanded, setIngredientsExpanded] = useState(false);
  
  const {
    currentProduct,
    currentAnalysis,
    productLoadingState,
    analysisLoadingState,
    errorMessage,
    loadProductByBarcode,
    analyzeProduct,
    canAnalyze,
    retryProductLoad,
    clearError
  } = useProduct();

  useEffect(() => {
    // Load product if we don't have it or if it's a different barcode
    if (!currentProduct || currentProduct.barcode !== barcode) {
      loadProductByBarcode(barcode);
    }
  }, [barcode, currentProduct, loadProductByBarcode]);

  // Auto-analyze when product loads and we don't have analysis
  useEffect(() => {
    if (canAnalyze && analysisLoadingState === 'idle') {
      analyzeProduct();
    }
  }, [canAnalyze, analysisLoadingState, analyzeProduct]);

  const handleBack = () => {
    router.back();
  };

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <LoadingSpinner size="lg" />
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Loading Product Information
        </h2>
        <p className="text-[var(--text-secondary)]">
          Fetching details for barcode: {barcode}
        </p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="w-16 h-16 bg-[var(--error-light)] rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-[var(--error-dark)]" />
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Product Not Found
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          {errorMessage || "We couldn't find information for this barcode. Please check the barcode and try again."}
        </p>
        <div className="space-x-3">
          <Button variant="outline" onClick={handleBack}>
            Go Back
          </Button>
          <Button onClick={() => retryProductLoad(barcode)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );

  const renderNutritionFacts = () => {
    if (!currentProduct?.nutrition_facts) return null;

    const nutrition = currentProduct.nutrition_facts;
    const hasNutritionData = Object.values(nutrition).some(value => value !== null && value !== undefined);

    if (!hasNutritionData) return null;

    return (
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Nutrition Facts
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {nutrition.energy_kcal && (
            <div className="bg-[var(--surface)] p-3 rounded-lg">
              <div className="text-sm text-[var(--text-secondary)]">Calories</div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">
                {formatNutritionValue(nutrition.energy_kcal, ' kcal')}
              </div>
            </div>
          )}
          {nutrition.fat && (
            <div className="bg-[var(--surface)] p-3 rounded-lg">
              <div className="text-sm text-[var(--text-secondary)]">Fat</div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">
                {formatNutritionValue(nutrition.fat, 'g')}
              </div>
            </div>
          )}
          {nutrition.carbohydrates && (
            <div className="bg-[var(--surface)] p-3 rounded-lg">
              <div className="text-sm text-[var(--text-secondary)]">Carbs</div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">
                {formatNutritionValue(nutrition.carbohydrates, 'g')}
              </div>
            </div>
          )}
          {nutrition.sugars && (
            <div className="bg-[var(--surface)] p-3 rounded-lg">
              <div className="text-sm text-[var(--text-secondary)]">Sugars</div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">
                {formatNutritionValue(nutrition.sugars, 'g')}
              </div>
            </div>
          )}
          {nutrition.proteins && (
            <div className="bg-[var(--surface)] p-3 rounded-lg">
              <div className="text-sm text-[var(--text-secondary)]">Protein</div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">
                {formatNutritionValue(nutrition.proteins, 'g')}
              </div>
            </div>
          )}
          {nutrition.salt && (
            <div className="bg-[var(--surface)] p-3 rounded-lg">
              <div className="text-sm text-[var(--text-secondary)]">Salt</div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">
                {formatNutritionValue(nutrition.salt, 'g')}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderIngredients = () => {
    if (!currentProduct) return null;

    const ingredientsText = currentProduct.ingredients_text;
    const ingredientsList = currentProduct.ingredients_list;
    
    const hasIngredients = ingredientsText || (ingredientsList && ingredientsList.length > 0);
    
    if (!hasIngredients) {
      return (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Ingredients
          </h3>
          <p className="text-[var(--text-secondary)]">
            No ingredient information available for this product.
          </p>
        </Card>
      );
    }

    const displayText = ingredientsText || ingredientsList.join(', ');
    const shouldTruncate = displayText.length > 200;

    return (
      <Card className="overflow-hidden mb-6">
        <button
          onClick={() => setIngredientsExpanded(!ingredientsExpanded)}
          className="w-full p-6 text-left hover:bg-[var(--surface)]/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Ingredients
            </h3>
            {shouldTruncate && (
              ingredientsExpanded ? 
                <ChevronUp className="w-5 h-5 text-[var(--text-secondary)]" /> :
                <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />
            )}
          </div>
        </button>
        
        <div className="px-6 pb-6">
          <p className="text-[var(--text-primary)] leading-relaxed">
            {shouldTruncate && !ingredientsExpanded
              ? `${displayText.slice(0, 200)}...`
              : displayText
            }
          </p>
          
          {shouldTruncate && !ingredientsExpanded && (
            <button
              onClick={() => setIngredientsExpanded(true)}
              className="mt-2 text-[var(--primary)] text-sm font-medium hover:text-[var(--primary-dark)]"
            >
              Show more
            </button>
          )}
        </div>
      </Card>
    );
  };

  if (productLoadingState === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {renderLoadingState()}
      </div>
    );
  }

  if (productLoadingState === 'error' || !currentProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {renderErrorState()}
      </div>
    );
  }

  return (
    <>
      <Head>
        <link rel="canonical" href={`https://whats-in-it.org/product/${barcode}`} />
        <title>{currentProduct ? `${currentProduct.name} - Nutrition Analysis | What's In It?` : `Product ${barcode} - Analysis | What's In It?`}</title>
        <meta name="description" content={currentProduct ? `Complete nutrition analysis for ${currentProduct.name}. View ingredients, nutrition facts, health scores, and AI-powered insights.` : `Comprehensive nutrition analysis and ingredient breakdown for product ${barcode}.`} />
      </Head>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Product Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {currentProduct.name}
            </h1>
            <div className="space-y-1 text-[var(--text-secondary)]">
              <p>
                <span className="font-medium">Brand:</span> {currentProduct.brand || 'Unknown'}
              </p>
              <p>
                <span className="font-medium">Barcode:</span> {currentProduct.barcode}
              </p>
            </div>
          </div>
          
          {currentProduct.image_url && (
            <div className="ml-6 flex-shrink-0">
              <img
                src={currentProduct.image_url}
                alt={currentProduct.name}
                className="w-24 h-24 object-cover rounded-lg border border-[var(--surface-variant)]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Nutrition Facts */}
      {renderNutritionFacts()}

      {/* Ingredients */}
      {renderIngredients()}

      {/* Analysis Section */}
      <AnalysisDisplay />
      </div>
    </>
  );
}