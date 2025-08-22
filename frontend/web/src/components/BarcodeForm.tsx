
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, AlertCircle } from "lucide-react";
import { useProduct } from "@/hooks/useProduct";
import { validateBarcode } from "@/lib/utils";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const BarcodeForm = () => {
  const [barcode, setBarcode] = useState("");
  const [localError, setLocalError] = useState("");
  const router = useRouter();
  
  const { 
    loadProductByBarcode, 
    productLoadingState, 
    errorMessage,
    clearError 
  } = useProduct();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and basic cleanup
    const cleanValue = value.replace(/[^0-9]/g, '');
    setBarcode(cleanValue);
    
    // Clear errors when user starts typing
    if (localError) setLocalError("");
    if (errorMessage) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanBarcode = barcode.trim();
    
    if (!cleanBarcode) {
      setLocalError("Please enter a barcode");
      return;
    }

    if (!validateBarcode(cleanBarcode)) {
      setLocalError("Please enter a valid barcode (8-14 digits)");
      return;
    }

    setLocalError("");
    
    // Load product and redirect to product page
    const success = await loadProductByBarcode(cleanBarcode);
    if (success) {
      router.push(`/product/${cleanBarcode}`);
    }
  };

  const isLoading = productLoadingState === 'loading';
  const hasError = localError || errorMessage;
  const isValid = barcode.trim() && validateBarcode(barcode.trim());

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={barcode}
              onChange={handleInputChange}
              placeholder="Enter product barcode..."
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-l-lg bg-[var(--surface-container)] text-[var(--text-primary)] border-2 focus:outline-none focus:ring-0 transition-colors ${
                hasError 
                  ? "border-[var(--error)] focus:border-[var(--error-dark)]"
                  : "border-[var(--surface-variant)] focus:border-[var(--primary)]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              maxLength={14}
              inputMode="numeric"
              pattern="[0-9]*"
            />
            
            {/* Real-time validation indicator */}
            {barcode && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isValid ? (
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-[var(--error)] rounded-full"></div>
                )}
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isLoading}
            isLoading={isLoading}
            className="rounded-l-none rounded-r-lg px-6 py-3"
          >
            {!isLoading && <Search size={20} />}
          </Button>
        </div>
        
        {/* Loading overlay for form */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 shadow-lg flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-[var(--text-primary)]">Loading product...</span>
            </div>
          </div>
        )}
      </form>

      {/* Error Display */}
      {hasError && (
        <div className="mt-4 p-3 bg-[var(--error-light)] border border-[var(--error)] rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-[var(--error-dark)] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-[var(--error-dark)] font-medium">
              {localError || errorMessage}
            </p>
            {errorMessage && !localError && (
              <p className="text-xs text-[var(--error)] mt-1">
                Please try again or check your internet connection.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Helpful hints */}
      {!hasError && (
        <div className="mt-4 text-sm text-[var(--text-secondary)] space-y-1">
          <p>💡 Look for the barcode on the product packaging</p>
          <p>📱 Barcodes are typically 8-14 digits long</p>
        </div>
      )}

      {/* Mobile app note */}
      <div className="mt-6 pt-4 border-t border-[var(--surface-variant)]">
        <p className="text-sm text-[var(--text-secondary)] text-center">
          📱 Want to scan barcodes with your camera?{" "}
          <a 
            href="https://github.com/Lavande/Whats-In-It" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[var(--primary)] hover:text-[var(--primary-dark)] underline transition-colors"
          >
            Try our mobile app version
          </a>
        </p>
      </div>
    </div>
  );
};

export default BarcodeForm;
