
"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAppStore } from '@/store/appStore';
import { Product, ScanHistoryItem } from '@/types';

// Legacy interface for compatibility
interface HistoryItem {
  barcode: string;
  productName: string;
  date: string;
  imageUrl?: string;
}

interface HistoryContextType {
  history: HistoryItem[];
  addHistoryItem: (item: Product) => void;
  isLoading: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const scanHistory = useAppStore((state) => state.scanHistory);
  const addToScanHistory = useAppStore((state) => state.addToScanHistory);

  // Convert ScanHistoryItem to legacy HistoryItem format
  const history: HistoryItem[] = scanHistory.map((item) => ({
    barcode: item.barcode,
    productName: item.product.name,
    date: item.scannedAt instanceof Date ? item.scannedAt.toISOString() : new Date(item.scannedAt).toISOString(),
    imageUrl: item.product.image_url,
  }));

  const addHistoryItem = (product: Product) => {
    addToScanHistory({ barcode: product.barcode, product });
  };

  return (
    <HistoryContext.Provider value={{ history, addHistoryItem, isLoading: false }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
