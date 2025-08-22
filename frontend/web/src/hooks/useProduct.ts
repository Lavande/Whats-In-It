import { useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { apiService } from '@/services/apiService';
import ApiService from '@/services/apiService';
import { validateBarcode } from '@/lib/utils';

export const useProduct = () => {
  const {
    currentProduct,
    currentAnalysis,
    productLoadingState,
    analysisLoadingState,
    errorMessage,
    userPreferences,
    setCurrentProduct,
    setCurrentAnalysis,
    setProductLoadingState,
    setAnalysisLoadingState,
    setErrorMessage,
    clearError,
    addToScanHistory,
  } = useAppStore();

  const loadProductByBarcode = useCallback(async (barcode: string) => {
    const cleanBarcode = barcode.trim();
    
    if (!validateBarcode(cleanBarcode)) {
      setErrorMessage('Please enter a valid barcode (8-14 digits)');
      return false;
    }

    setProductLoadingState('loading');
    setCurrentProduct(null);
    setCurrentAnalysis(null);
    clearError();

    try {
      const product = await apiService.getProductByBarcode(cleanBarcode);
      setCurrentProduct(product);
      setProductLoadingState('success');
      
      // Add to scan history
      addToScanHistory({
        barcode: cleanBarcode,
        product,
      });
      
      return true;
    } catch (error) {
      console.error('Product loading error:', error);
      setErrorMessage(ApiService.formatErrorMessage(error));
      setProductLoadingState('error');
      return false;
    }
  }, [
    setCurrentProduct,
    setCurrentAnalysis,
    setProductLoadingState,
    setErrorMessage,
    clearError,
    addToScanHistory,
  ]);

  const analyzeProduct = useCallback(async () => {
    if (!currentProduct) {
      setErrorMessage('No product loaded for analysis');
      return false;
    }

    setAnalysisLoadingState('loading');
    clearError();

    try {
      const analysis = await apiService.getComprehensiveAnalysis(
        currentProduct,
        userPreferences
      );
      
      setCurrentAnalysis(analysis);
      setAnalysisLoadingState('success');
      
      // Update the scan history with analysis result
      addToScanHistory({
        barcode: currentProduct.barcode,
        product: currentProduct,
        analysisResult: analysis,
      });
      
      return true;
    } catch (error) {
      console.error('Analysis error:', error);
      setErrorMessage(ApiService.formatErrorMessage(error));
      setAnalysisLoadingState('error');
      return false;
    }
  }, [
    currentProduct,
    userPreferences,
    setCurrentAnalysis,
    setAnalysisLoadingState,
    setErrorMessage,
    clearError,
    addToScanHistory,
  ]);

  const loadProductAndAnalyze = useCallback(async (barcode: string) => {
    const productLoaded = await loadProductByBarcode(barcode);
    if (productLoaded) {
      return await analyzeProduct();
    }
    return false;
  }, [loadProductByBarcode, analyzeProduct]);

  const clearCurrentProduct = useCallback(() => {
    setCurrentProduct(null);
    setCurrentAnalysis(null);
    setProductLoadingState('idle');
    setAnalysisLoadingState('idle');
    clearError();
  }, [
    setCurrentProduct,
    setCurrentAnalysis,
    setProductLoadingState,
    setAnalysisLoadingState,
    clearError,
  ]);

  const retryAnalysis = useCallback(async () => {
    return await analyzeProduct();
  }, [analyzeProduct]);

  const retryProductLoad = useCallback(async (barcode: string) => {
    return await loadProductByBarcode(barcode);
  }, [loadProductByBarcode]);

  // Check if we can analyze (have product but no analysis)
  const canAnalyze = currentProduct && !currentAnalysis && analysisLoadingState !== 'loading';

  return {
    // State
    currentProduct,
    currentAnalysis,
    productLoadingState,
    analysisLoadingState,
    errorMessage,
    canAnalyze,
    
    // Actions
    loadProductByBarcode,
    analyzeProduct,
    loadProductAndAnalyze,
    clearCurrentProduct,
    retryAnalysis,
    retryProductLoad,
    clearError,
  };
};