import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

export function formatBarcode(barcode: string): string {
  // Remove any non-numeric characters and validate
  const cleanBarcode = barcode.replace(/\D/g, '');
  return cleanBarcode;
}

export function validateBarcode(barcode: string): boolean {
  const cleanBarcode = formatBarcode(barcode);
  // Basic validation - should be a numeric string with reasonable length
  return cleanBarcode.length >= 8 && cleanBarcode.length <= 14;
}

export function formatNutritionValue(value: number | string, unit?: string): string {
  if (typeof value === 'number') {
    return `${value}${unit || ''}`;
  }
  return value;
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getHealthScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100 border-green-200';
  if (score >= 60) return 'bg-yellow-100 border-yellow-200';
  if (score >= 40) return 'bg-orange-100 border-orange-200';
  return 'bg-red-100 border-red-200';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}