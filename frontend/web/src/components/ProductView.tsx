
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Tabs from '@/components/Tabs';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';

// Define types based on backend schemas
interface Product {
  name: string;
  image_url?: string;
  brand?: string;
  ingredients_text?: string;
  nutriments?: Record<string, any>;
  // Add other fields from FoodProduct schema as needed
}

interface Analysis {
  summary: string;
  pros: string[];
  cons: string[];
  // Add other fields from ProductAnalysis schema as needed
}

const backendUrl = "https://api.whats-in-it.org";

import { useHistory } from '@/context/HistoryContext';

// ... (rest of the imports)

export default function ProductView({ barcode }: { barcode: string }) {
  const { preferences, isLoading: prefsLoading } = useUserPreferences();
  const { addHistoryItem } = useHistory();
  const [product, setProduct] = useState<Product | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<'product' | 'analysis' | 'done' | 'error'>('product');

  useEffect(() => {
    const fetchData = async () => {
      // Step 1: Fetch product data
      try {
        setLoadingState('product');
        const productRes = await fetch(`${backendUrl}/api/v1/product/${barcode}`);
        if (!productRes.ok) {
          throw new Error(`Product not found (status: ${productRes.status})`);
        }
        const productData = await productRes.json();
        setProduct(productData);
        addHistoryItem({ ...productData, barcode }); // Add to history

        // Once product data is fetched, proceed to analysis
        if (!prefsLoading) {
            setLoadingState('analysis');
            const analysisRes = await fetch(`${backendUrl}/api/v1/analyze-comprehensive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product: productData, user_preferences: preferences }),
            });

            if (!analysisRes.ok) {
                throw new Error(`Failed to get analysis (status: ${analysisRes.status})`);
            }
            const analysisData = await analysisRes.json();
            setAnalysis(analysisData);
            setLoadingState('done');
        }

      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
        setLoadingState('error');
      }
    };

    if (!prefsLoading) {
        fetchData();
    }

  }, [barcode, preferences, prefsLoading]);

  if (loadingState === 'product' || prefsLoading) {
    return <LoadingSpinner message="Fetching product details..." />;
  }

  if (loadingState === 'analysis') {
    return <LoadingSpinner message="Analyzing with your preferences..." />;
  }

  if (loadingState === 'error' || !product) {
    return <ErrorMessage message={error || `Could not load product data for barcode: ${barcode}.`} />;
  }

  const tabs = [
    { label: "AI Analysis", content: analysis ? <AnalysisTab analysis={analysis} /> : <LoadingSpinner message="Waiting for analysis..."/> },
    { label: "Ingredients", content: <p>{product.ingredients_text || 'No ingredients listed.'}</p> },
    { label: "Nutrition Facts", content: product.nutriments ? <NutritionTab nutriments={product.nutriments} /> : <p>No nutrition facts available.</p> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-1">
          <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
            <Image 
              src={product.image_url || '/placeholder.svg'} 
              alt={product.name}
              fill
              className="object-contain p-2"
            />
          </div>
          <h1 className="text-3xl font-bold mt-6">{product.name}</h1>
          <p className="text-lg text-gray-400">{product.brand || 'Unknown Brand'}</p>
        </div>
        <div className="md:col-span-2">
          <Tabs tabs={tabs} />
        </div>
      </div>
    </div>
  );
}

// Helper components for UI states
const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-64">
        <Loader className="animate-spin text-blue-500 h-12 w-12 mb-4" />
        <p className="text-lg text-gray-400">{message}</p>
    </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-64 bg-red-900/20 rounded-lg p-8">
        <AlertTriangle className="text-red-400 h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold text-red-400 mb-2">An Error Occurred</h2>
        <p className="text-gray-300 text-center">{message}</p>
    </div>
);

const AnalysisTab = ({ analysis }: { analysis: Analysis }) => (
  <div>
    <p className="text-gray-300 mb-6">{analysis.summary}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-green-400 mb-3">Pros</h3>
        <ul className="space-y-2">
          {analysis.pros.map((pro: string, i: number) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
              <span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-red-400 mb-3">Cons</h3>
        <ul className="space-y-2">
          {analysis.cons.map((con: string, i: number) => (
            <li key={i} className="flex items-start">
              <XCircle className="w-5 h-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
              <span>{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const NutritionTab = ({ nutriments }: { nutriments: Record<string, any> }) => (
  <div className="grid grid-cols-2 gap-4">
    {Object.entries(nutriments).map(([key, value]) => (
      <div key={key} className="bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-400">{key.replace(/_100g/g, ' (100g)').replace(/_/g, ' ')}</p>
        <p className="text-xl font-semibold">{String(value)}</p>
      </div>
    ))}
  </div>
);
