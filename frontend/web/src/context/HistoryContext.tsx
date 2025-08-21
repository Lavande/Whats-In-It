
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

// This is a simplified Product type for history purposes
interface Product {
    barcode: string;
    name: string;
    image_url?: string;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('scanHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addHistoryItem = (product: Product) => {
    const newItem: HistoryItem = {
        barcode: product.barcode,
        productName: product.name,
        date: new Date().toISOString(),
        imageUrl: product.image_url,
    };

    const newHistory = [newItem, ...history.filter(item => item.barcode !== product.barcode)];
    // Limit history to 50 items
    const limitedHistory = newHistory.slice(0, 50);

    setHistory(limitedHistory);
    try {
      localStorage.setItem('scanHistory', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  };

  return (
    <HistoryContext.Provider value={{ history, addHistoryItem, isLoading }}>
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
